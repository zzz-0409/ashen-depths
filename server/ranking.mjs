// Cloudflare Worker/D1 API. Google credentials are verified here, never trusted from a client user ID.
export const SEASON='hunt-1';
export function accountNeedsName(name){return !name||/^冒険者[0-9a-f]{6}$/.test(name)}
export function validateAccountName(value){
 if(typeof value!=='string')throw Object.assign(Error('名前を入力してください'),{status:400});
 const name=value.normalize('NFKC').trim().replace(/ +/g,' ');
 if([...name].length<2||[...name].length>16||! /^[\p{L}\p{M}\p{N} ._ー・-]+$/u.test(name)||accountNeedsName(name))throw Object.assign(Error('名前は2〜16文字の文字・数字・空白・「.」「_」「-」「・」で入力してください'),{status:400});
 return name;
}
const cookie=(request,name)=>(request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1)||'';
const json=(value,status=200,headers={})=>Response.json(value,{status,headers:{'Cache-Control':'no-store',...headers}});
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const bytes=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
let keyCache=null,keyExpiry=0;
export async function verifyGoogleToken(token,clientId,nonce,{fetchKeys=()=>fetch('https://www.googleapis.com/oauth2/v3/certs'),now=Date.now()}={}){
 if(typeof token!=='string'||token.length>12000)fail('ログイン情報が不正です',401);
 let parts=token.split('.');if(parts.length!==3)fail('ログイン情報が不正です',401);
 let header,payload;try{header=JSON.parse(new TextDecoder().decode(bytes(parts[0])));payload=JSON.parse(new TextDecoder().decode(bytes(parts[1])))}catch{fail('ログイン情報が不正です',401)}
 if(header.alg!=='RS256'||typeof header.kid!=='string'||!['accounts.google.com','https://accounts.google.com'].includes(payload.iss)||payload.aud!==clientId||payload.azp&&payload.azp!==clientId||!Number.isFinite(payload.exp)||payload.exp*1000<=now||!Number.isFinite(payload.iat)||payload.iat*1000>now+60000||typeof payload.sub!=='string'||!/^\d{1,255}$/.test(payload.sub)||payload.nonce!==nonce)fail('Googleログインを確認できません',401);
 if(!keyCache||keyExpiry<=now){let response=await fetchKeys();if(!response.ok)fail('Googleに接続できません',503);let body=await response.json();keyCache=body.keys;keyExpiry=now+300000}
 let jwk=keyCache?.find(k=>k.kid===header.kid&&k.kty==='RSA'&&k.alg==='RS256');if(!jwk)fail('ログイン鍵が更新されています。再度ログインしてください',401);
 let key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))fail('ログインの署名が不正です',401);return payload.sub;
}
function setCookie(name,value,request,maxAge){let secure=new URL(request.url).protocol==='https:'?'; Secure':'';return name+'='+value+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+maxAge+secure}
async function readBody(request){let text=await request.text();if(text.length>16000)fail('送信内容が大きすぎます',413);try{return JSON.parse(text)}catch{fail('送信内容が不正です')}}
export async function user(request,env){let token=cookie(request,'ad_session');if(!token)return null;return env.DB.prepare('SELECT account_id FROM sessions WHERE token_hash=? AND expires_at>?').bind(await hash(token),Date.now()).first()}
export async function rankingApi(request,env){let url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return null;
 try{
  if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)fail('送信元を確認できません',403);
  let ready=!!env.GOOGLE_CLIENT_ID&&!!env.DB;
  if(url.pathname==='/api/config'&&request.method==='GET')return json({ready,clientId:ready?env.GOOGLE_CLIENT_ID:null,season:SEASON});
  if(!ready)fail('Googleログインとランキングはまだ有効化されていません',503);
  if(url.pathname==='/api/login-challenge'&&request.method==='POST'){let nonce=crypto.randomUUID();return json({nonce},200,{'Set-Cookie':setCookie('ad_nonce',nonce,request,300)})}
  if(url.pathname==='/api/login'&&request.method==='POST'){let nonce=cookie(request,'ad_nonce');if(!nonce)fail('ログイン操作をやり直してください',401);let body=await readBody(request),sub=await verifyGoogleToken(body.credential,env.GOOGLE_CLIENT_ID,nonce),accountId=await hash('google:'+sub),token=crypto.randomUUID()+crypto.randomUUID(),name='冒険者'+accountId.slice(0,6);
   await env.DB.batch([env.DB.prepare('INSERT INTO accounts(id,display_name) VALUES(?,?) ON CONFLICT(id) DO NOTHING').bind(accountId,name),env.DB.prepare('INSERT INTO sessions(token_hash,account_id,expires_at) VALUES(?,?,?)').bind(await hash(token),accountId,Date.now()+604800000)]);
   let response=json({name});response.headers.append('Set-Cookie',setCookie('ad_session',token,request,604800));response.headers.append('Set-Cookie',setCookie('ad_nonce','',request,0));return response;
  }
  let current=await user(request,env);
  if(url.pathname==='/api/me'&&request.method==='GET'){let profile=current?await env.DB.prepare('SELECT display_name AS name FROM accounts WHERE id=?').bind(current.account_id).first():null;return json(profile?{...profile,needsName:accountNeedsName(profile.name)}:null);}
  if(url.pathname==='/api/ranking'&&request.method==='GET'){
   let leaders=await env.DB.prepare('SELECT a.display_name AS name,s.best AS dps FROM scores s JOIN accounts a ON a.id=s.account_id WHERE s.season=? ORDER BY s.best DESC,s.account_id ASC LIMIT 50').bind(SEASON).all();
   let mine=current?await env.DB.prepare('SELECT best,last,1+(SELECT COUNT(*) FROM scores x WHERE x.season=s.season AND x.best>s.best) AS rank FROM scores s WHERE s.account_id=? AND s.season=?').bind(current.account_id,SEASON).first():null;return json({season:SEASON,leaders:leaders.results,mine,verification:'client-measured'});
  }
  if(!current)fail('Googleログインが必要です',401);
  if(url.pathname==='/api/profile'&&request.method==='POST'){const body=await readBody(request),name=validateAccountName(body.name);await env.DB.prepare('UPDATE accounts SET display_name=? WHERE id=?').bind(name,current.account_id).run();return json({name,needsName:false});}
  if(url.pathname==='/api/logout'&&request.method==='POST'){await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(cookie(request,'ad_session'))).run();return json({ok:true},200,{'Set-Cookie':setCookie('ad_session','',request,0)})}
  if(url.pathname==='/api/dps/start'&&request.method==='POST'){let id=crypto.randomUUID(),now=Date.now();await env.DB.batch([env.DB.prepare('DELETE FROM runs WHERE account_id=? OR expires_at<?').bind(current.account_id,now),env.DB.prepare('INSERT INTO runs(id,account_id,started_at,expires_at) VALUES(?,?,?,?)').bind(id,current.account_id,now,now+180000)]);return json({id,duration:30,season:SEASON})}
  if(url.pathname==='/api/dps/finish'&&request.method==='POST'){let body=await readBody(request),now=Date.now();if(typeof body.id!=='string'||!Number.isSafeInteger(body.damage)||body.damage<0||body.damage>3e10||body.season!==SEASON)fail('計測結果が不正です');let run=await env.DB.prepare('DELETE FROM runs WHERE id=? AND account_id=? AND started_at<=? AND expires_at>? RETURNING id').bind(body.id,current.account_id,now-30000,now).first();if(!run)fail('計測時間または計測IDを確認できません',409);let dps=Math.round(body.damage/30*100)/100;await env.DB.prepare('INSERT INTO scores(account_id,season,best,last,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(account_id,season) DO UPDATE SET best=MAX(scores.best,excluded.best),last=excluded.last,updated_at=excluded.updated_at').bind(current.account_id,SEASON,dps,dps,now).run();return json({dps})}
  return json({error:'見つかりません'},404);
 }catch(error){return json({error:error.status?error.message:'サーバーに接続できませんでした'},error.status||500)}
}
