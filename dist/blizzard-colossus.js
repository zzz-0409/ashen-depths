const blizzardColossusSheet=new Image();blizzardColossusSheet.assetSrc='assets/blizzard-colossus-v1.png';
function beginBlizzardColossus(e,pattern='blizzardCompass'){
 const phase=e.hp/e.max<=.5?2:1;e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;
 const count=pattern==='blizzardCompass'?(phase===2?5:4):(phase===2?3:2),windup=pattern==='blizzardCompass'?1.4:1.25,interval=pattern==='blizzardCompass'?.9:1.1;
 e.attack={pattern,bespoke:true,owner:p,world:dungeon,origin:{x:e.x,y:e.y},angle:Math.atan2(p.y-e.y,p.x-e.x),phase,count,windup,interval,nextStrike:0,end:windup+(count-1)*interval+1.2};
}
function cancelBlizzardColossus(e){e.attack=null;e.state='idle';e.t=1.3;}
function blizzardSafeAngle(a,index){return a.angle+index*Math.PI/2*(a.phase===2?-1:1);}
function blizzardColossusTouches(a,index,q){
 const d=dist(a.origin,q);if(!lineClear(a.origin,q))return false;
 if(a.pattern==='blizzardHammer')return index%2===0?d<=145:d>=175&&d<=400;
 const angle=Math.atan2(q.y-a.origin.y,q.x-a.origin.x)-blizzardSafeAngle(a,index);
 return d>=80&&d<=400&&Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))>Math.PI/4+1e-8;
}
const blizzardColossusAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r5b1')return blizzardColossusAnimateBase(e,dt);
 if(e.hp<=0||dead||p.hp<=0){cancelBlizzardColossus(e);return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 e.anim=(e.anim||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(e.reactionStun>0){cancelBlizzardColossus(e);return;}
 const a=e.attack;
 if(!a||!['blizzardCompass','blizzardHammer'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;e.state='idle';const distance=dist(e,p),clear=lineClear(e,p);
  if(e.t<=0&&distance<=400&&clear){beginBlizzardColossus(e,(e.blizzardCycle||0)%2?'blizzardHammer':'blizzardCompass');e.blizzardCycle=(e.blizzardCycle||0)+1;return;}
  if(distance>900&&!e.bossProvoked||distance<110)return;
  if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}const q=e.path?.[0];if(q){const dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{const step=Math.min(len,80*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,46)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.origin)>16||dist(e,p)>650){cancelBlizzardColossus(e);return;}e.elapsed+=dt;
 while(a.nextStrike<a.count&&e.elapsed+1e-8>=a.windup+a.nextStrike*a.interval){const index=a.nextStrike++;a.lastStrike=index;a.lastAt=a.windup+index*a.interval;e.struck=true;if(blizzardColossusTouches(a,index,p))hurt(a.pattern==='blizzardHammer'?(a.phase===2?160:130):(a.phase===2?125:100));playSound('frost',e.x,e.y);if(dead||p.hp<=0){cancelBlizzardColossus(e);return;}}
 if(e.elapsed+1e-8>=a.end)cancelBlizzardColossus(e);
};
const blizzardColossusDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r5b1'||!blizzardColossusSheet.complete||!blizzardColossusSheet.naturalWidth)return blizzardColossusDrawBase(e,size);
 let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack){const a=e.attack;f={row:2,col:a.nextStrike>=a.count?3:a.pattern==='blizzardCompass'?2:e.elapsed<a.windup?0:1};}
 const q=project(e.x,e.y),sw=blizzardColossusSheet.naturalWidth/4,sh=blizzardColossusSheet.naturalHeight/3,w=320,h=w*sh/sw;ctx.save();ctx.fillStyle='#07142066';ctx.beginPath();ctx.ellipse(q.x,q.y,65,20,0,0,Math.PI*2);ctx.fill();ctx.transform(e.facing||1,0,0,1,q.x,q.y);ctx.filter=e.flash>0?'brightness(1.8)':'none';drawPreparedEnemySprite(ctx,blizzardColossusSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.88,w,h);ctx.restore();return true;
};
function drawBlizzardSector(origin,angle,inner,outer,half,color,fill){
 ctx.save();ctx.beginPath();for(let i=0;i<=24;i++){const a=angle-half+half*2*i/24,q=project(origin.x+Math.cos(a)*outer,origin.y+Math.sin(a)*outer);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);}for(let i=24;i>=0;i--){const a=angle-half+half*2*i/24,q=project(origin.x+Math.cos(a)*inner,origin.y+Math.sin(a)*inner);ctx.lineTo(q.x,q.y);}ctx.closePath();ctx.fillStyle=fill;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore();
}
const blizzardColossusGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 blizzardColossusGroundBase();for(const e of(typeof enemyRenderList==='function'?enemyRenderList('r5b1'):enemies)){const a=e.attack;if(e.species!=='r5b1'||e.hp<=0||!a||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y))continue;
  if(a.lastStrike!==undefined&&e.elapsed-a.lastAt<.22){if(a.pattern==='blizzardCompass')drawBlizzardSector(a.origin,blizzardSafeAngle(a,a.lastStrike)+Math.PI,80,400,Math.PI*3/4,'#e2f7ff','#98dcff80');else drawBlizzardSector(a.origin,0,a.lastStrike%2?175:0,a.lastStrike%2?400:145,Math.PI,'#e2f7ff','#98dcff80');}
  if(a.nextStrike>=a.count)continue;
  if(a.pattern==='blizzardCompass'){const angle=blizzardSafeAngle(a,a.nextStrike);drawBlizzardSector(a.origin,angle,80,400,Math.PI/4,'#f5d386','#e6bd6012');drawBlizzardSector(a.origin,angle+Math.PI,80,400,Math.PI*3/4,'#8bd6f3','#61b7e63b');const q=project(a.origin.x+Math.cos(angle)*245,a.origin.y+Math.sin(angle)*245);ctx.save();ctx.fillStyle='#ffe5a5';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('安全',q.x,q.y);ctx.restore();}
  else{const inner=a.nextStrike%2?175:0,outer=a.nextStrike%2?400:145;drawBlizzardSector(a.origin,0,inner,outer,Math.PI,'#a3def4','#78bfe43b');}
  const at=a.windup+a.nextStrike*a.interval;groundRing(e.x,e.y,55+20*Math.max(0,Math.min(1,at-e.elapsed)),'#fff1c7',2);
 }
};
function blizzardColossusAttackHint(e){const a=e.attack;if(!a||a.nextStrike>=a.count)return '嵐が止んだら反撃';return a.pattern==='blizzardCompass'?'金の扇形が安全 · '+(a.phase===2?'逆回転':'順回転')+' '+(a.nextStrike+1)+'/'+a.count:a.nextStrike%2?'外周が凍結 · 懐へ入る':'槌の叩きつけ · 懐から離れる';}
const blizzardColossusSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r5b1'?300:blizzardColossusSizeBase(e);
const blizzardColossusRadiusBase=enemyHitRadius;enemyHitRadius=e=>e.species==='r5b1'?46:blizzardColossusRadiusBase(e);
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r5b1',animateEnemy,drawRegionEnemy);
