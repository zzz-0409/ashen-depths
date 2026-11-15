// Capture only rendering state; a corpse never participates in AI or damage.
function enemyDeathSnapshot(e){return{x:e.x,y:e.y,species:e.species,exRank:e.exRank,boss:!!e.boss,role:e.role,kind:e.kind,facing:e.facing||1,state:e.state,anim:e.anim||0,elapsed:e.elapsed||0,shellGuard:e.shellGuard||0,struck:!!e.struck,attack:e.attack?{pattern:e.attack.pattern,windup:e.attack.windup,travel:e.attack.travel,blocked:!!e.attack.blocked}:null,hp:0,flash:0}}
const deathWorldKillBase=worldKill;worldKill=e=>{if(!e)return;let wasRewarded=e.rewarded;deathWorldKillBase(e);if(!wasRewarded&&e.rewarded&&!e.dummy&&e.hp<=0){corpses.push({x:e.x,y:e.y,life:6,maxLife:6,size:enemyVisualSize(e),facing:e.facing||1,body:enemyDeathSnapshot(e)});if(corpses.length>64)corpses.splice(0,corpses.length-64)}};
function drawEnemyRemains(c){
 let s=project(c.x,c.y);ctx.save();
 if(c.body){let elapsed=c.maxLife-c.life,fall=clamp(elapsed/.55,0,1),ease=1-Math.pow(1-fall,3);ctx.globalAlpha=Math.min(1,c.life/2);ctx.translate(s.x,s.y);ctx.rotate(ease*.95*c.facing);ctx.scale(1,1-ease*.42);ctx.translate(-s.x,-s.y);drawRegionEnemy(c.body,c.size)}
 else{ctx.translate(s.x,s.y);ctx.scale(c.facing||1,.3);ctx.rotate(.5);ctx.globalAlpha=Math.min(.4,c.life/4);if(enemySheet.complete&&enemySheet.naturalWidth)ctx.drawImage(enemySheet,0,0,enemySheet.naturalWidth/4,enemySheet.naturalHeight/3,-35,-25,70,70)}
 ctx.restore();
}
