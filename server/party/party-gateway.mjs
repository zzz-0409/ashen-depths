import {PROTOCOL} from './room-core.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=async token=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');
const roomIdPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
async function session(request,DB,now){
 const cookies=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith('ad_session='));
 if(cookies.length!==1)return null;
 const token=cookies[0].slice(11);if(!token||token.length>256)return null;
 return DB.prepare('SELECT s.account_id, s.expires_at, a.display_name FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?').bind(await hash(token),now).first();
}
// connect is provided by the trusted hosting adapter. Only the validated
// identity object is passed to it; caller-controlled identity headers are ignored.
export async function partyGateway(request,env,{connect,now=Date.now()}={}){
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/party/'))return null;
 const ready=!!env.DB&&!!env.GOOGLE_CLIENT_ID&&typeof env.GAME_REVISION==='string'&&!!env.GAME_REVISION&&typeof env.PARTY_ROOMS?.idFromName==='function'&&typeof env.PARTY_ROOMS?.get==='function';
 if(url.pathname==='/api/party/config'&&request.method==='GET')return json({ready,maxPlayers:4,mode:'village',revision:env.GAME_REVISION||null,protocol:PROTOCOL});
 if(request.headers.get('Origin')!==url.origin)return json({error:'origin-mismatch'},403);
 if(!ready)return json({error:'party-unavailable'},503);
 try{
  const current=await session(request,env.DB,now);if(!current)return json({error:'login-required'},401);
  if(url.pathname==='/api/party/rooms'&&request.method==='POST'){
   // No caller payload is needed. Identity, version and lifetime are server-owned.
   if(request.body){const reader=request.body.getReader();try{const first=await reader.read();if(!first.done&&first.value?.length)return json({error:'body-not-allowed'},400);}finally{await reader.cancel();}}
   const id=crypto.randomUUID(),expires=now+3600000;
   const inserted=await env.DB.prepare('INSERT INTO party_rooms(id,owner_id,revision,created_at,expires_at) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM party_rooms WHERE owner_id=? AND expires_at>?)<3 RETURNING id').bind(id,current.account_id,env.GAME_REVISION,now,expires,current.account_id,now).first();
   if(!inserted)return json({error:'room-limit'},429);
   return json({roomId:id,revision:env.GAME_REVISION,protocol:PROTOCOL,expiresAt:expires},201);
  }
  const match=url.pathname.match(/^\/api\/party\/rooms\/([^/]+)\/socket$/);
  if(!match||!roomIdPattern.test(match[1]))return json({error:'not-found'},404);
  if(request.method!=='GET')return json({error:'method-not-allowed'},405);
  if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return json({error:'websocket-required'},426);
  if(url.searchParams.get('protocol')!==String(PROTOCOL)||url.searchParams.get('revision')!==env.GAME_REVISION)return json({error:'version-mismatch'},409);
  const room=await env.DB.prepare('SELECT id,revision,expires_at FROM party_rooms WHERE id=? AND expires_at>?').bind(match[1],now).first();
  if(!room)return json({error:'room-expired-or-missing'},404);
  if(room.revision!==env.GAME_REVISION)return json({error:'version-mismatch'},409);
  if(typeof connect!=='function')return json({error:'transport-unavailable'},503);
  return await connect({roomId:room.id,expiresAt:room.expires_at,sessionExpiresAt:current.expires_at,identity:{accountId:current.account_id,name:current.display_name,connectionId:crypto.randomUUID(),revision:env.GAME_REVISION,protocol:PROTOCOL}});
 }catch{return json({error:'party-server-error'},500);}
}
