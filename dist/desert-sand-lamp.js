const sandLampSheet=new Image();sandLampSheet.assetSrc='assets/desert-sand-lamp-v1.png';
function beginSandLamp(e){e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'sandLampPulse',bespoke:true,windup:1.6,origin:{x:e.x,y:e.y},hold:0,fired:false};}
function extinguishSandLamp(e){e.attack=null;e.state='idle';e.elapsed=0;e.struck=true;e.t=2.4;e.lampCold=2.4;burst(e.x,e.y,65,'#9ce7ed');playSound('frost',e.x,e.y);}
const sandLampAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r4e6')return sandLampAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||paused||dead||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);e.lampCold=Math.max(0,(e.lampCold||0)-dt);
 if(e.lampCold>0){e.t=Math.max(0,e.t-dt);e.state='idle';return;}
 let a=e.attack;
 if(a?.pattern!=='sandLampPulse'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),clear=lineClear(e,p);
  if(e.t<=0&&d<=400&&clear){beginSandLamp(e);return;}
  e.state='idle';if(d>800&&!e.aware||d<=230)return;
  if(e.nav<=0){e.nav=.7;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
  let to=e.path?.[0];if(to){let dx=to.x-e.x,dy=to.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,72*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,16)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(dist(e,a.origin)>24){e.attack=null;e.state='idle';e.t=1.4;return;}
 let before=e.elapsed;e.elapsed=Math.round((before+dt)*1e6)/1e6;
 if(!a.fired){
  let charging=Math.max(0,Math.min(dt,a.windup-before));
  a.hold=dist(p,a.origin)<=70+1e-8&&lineClear(a.origin,p)?Math.round((a.hold+charging)*1e6)/1e6:0;
  if(a.hold>=.35){extinguishSandLamp(e);return;}
  if(e.elapsed>=a.windup){a.fired=true;e.struck=true;if(dist(p,a.origin)<=260+1e-8&&lineClear(a.origin,p))hurt(70);burst(a.origin.x,a.origin.y,260,'#f5bf73');playSound('impact',e.x,e.y);}
 }
 if(e.elapsed>=2.3){e.attack=null;e.state='idle';e.t=2.4;}
};
const sandLampDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r4e6'||!sandLampSheet.complete||!sandLampSheet.naturalWidth||!sandLampSheet.naturalHeight)return sandLampDrawBase(e,size);
 let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0||e.lampCold>0)f={row:2,col:3};else if(e.attack?.pattern==='sandLampPulse')f={row:2,col:e.elapsed<.6?0:e.elapsed<1.6?1:2};
 let q=project(e.x,e.y),sw=sandLampSheet.naturalWidth/4,sh=sandLampSheet.naturalHeight/3,w=220,h=w*sh/sw,bob=e.hp>0&&!e.lampCold?Math.sin((e.anim||0)*3)*3:0;
 ctx.save();ctx.translate(q.x,q.y-bob);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,sandLampSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.78,w,h);else ctx.drawImage(sandLampSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.78,w,h);ctx.restore();return true;
};
const sandLampSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r4e6'?125:sandLampSizeBase(e);
const sandLampGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 sandLampGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r4e6'):enemies)){let a=e.attack;if(e.species!=='r4e6'||e.hp<=0||a?.pattern!=='sandLampPulse'||!visibleAt(a.origin.x,a.origin.y))continue;
  if(!a.fired){groundRing(a.origin.x,a.origin.y,260,'#efad68',2);groundRing(a.origin.x,a.origin.y,260*Math.max(0,1-e.elapsed/1.6),'#ffdbaa',1);groundRing(a.origin.x,a.origin.y,70,'#8bdde4',2);if(a.hold>0){let q=project(e.x,e.y);ctx.save();ctx.strokeStyle='#b7f7f3';ctx.lineWidth=4;ctx.beginPath();ctx.arc(q.x,q.y-110,12,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,a.hold/.35));ctx.stroke();ctx.restore();}}
  else if(e.elapsed<1.85)groundRing(a.origin.x,a.origin.y,260,'#ffe3ad',4);
 }
};
