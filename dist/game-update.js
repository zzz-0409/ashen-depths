// A new release is opt-in. Never reload an expedition or a failed save.
let availableGameRelease=null,gameReleaseChecking=false;
function canApplyGameUpdate(){return !started||(!dead&&campaign().inVillage&&!dpsRun?.active)}
function refreshGameUpdateBadge(){
 let badge=$('gameUpdateBadge');if(!availableGameRelease){badge?.remove();return;}
 if(!badge){badge=document.createElement('button');badge.id='gameUpdateBadge';badge.onclick=showGameUpdate;document.querySelector('header .menu')?.append(badge);}
 badge.textContent='更新あり';badge.title='村で保存して更新版を読み込む';
}
async function checkGameUpdate(){
 if(gameReleaseChecking||typeof CLIENT_RELEASE_ID==='undefined'||!['http:','https:'].includes(location.protocol))return;
 gameReleaseChecking=true;
 try{let response=await fetch('release.json',{cache:'no-store'});if(!response.ok)return;let release=await response.json();if(!/^[a-f0-9]{64}$/.test(release?.revision))return;availableGameRelease=release.revision===CLIENT_RELEASE_ID?null:release.revision;refreshGameUpdateBadge();}catch{}finally{gameReleaseChecking=false;}
}
function showGameUpdate(){
 let ready=canApplyGameUpdate();worldMenu('ゲームの更新','<h3>更新版が届いています</h3><p>'+(ready?'保存してから更新版を読み込みます。再開画面で「保存した探索を再開」を選んでください。':'更新は村で行えます。未回収の素材を拾い、村へ帰還してから開いてください。')+'</p><button onclick="applyGameUpdate()" '+(!ready?'disabled':'')+'>保存して更新する</button>','update');
}
function applyGameUpdate(){
 if(!availableGameRelease||!canApplyGameUpdate())return false;
 if(started&&!save()){say('保存できなかったため更新を中止しました。保存画面を確認してください。');return false;}
 location.reload();return true;
}
checkGameUpdate();setInterval(()=>{if(!document.hidden)checkGameUpdate()},30000);
