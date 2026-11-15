const waterPriestSheet=new Image();waterPriestSheet.assetSrc='assets/water-priest-v3.png';
function waterPriestGap(a,point,wave){let angle=Math.atan2(point.y-a.origin.y,point.x-a.origin.x)-wave.gap;return Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=Math.PI/6;}
function waterPriestRadius(time,start){return 70+430*Math.max(0,Math.min(1,(time-start)/1.4));}
function beginWaterPriest(e,pattern='priestTide'){
 let phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x);e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern,bespoke:true,phase,origin:{x:e.x,y:e.y},owner:p,world:dungeon,windup:pattern==='priestTide'?1.5:1.15,marks:[],waves:phase===2?[{start:1.5,gap:angle+Math.PI/2,hit:false},{start:4.2,gap:angle-Math.PI/2,hit:false}]:[{start:1.5,gap:angle+Math.PI/2,hit:false}]};
 if(pattern==='priestColumns')e.attack.marks.push({x:p.x,y:p.y,releaseAt:1.15,fired:false});
}
function waterPriestCancel(e){e.attack=null;e.state='idle';e.t=.9;}
const waterPriestAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3b1')return waterPriestAnimateBase(e,dt);
 if(e.hp<=0||dead||p.hp<=0){waterPriestCancel(e);return;}if(paused||!started||!Number.isFinite(dt)||dt<=0)return;
 if(e.reactionStun>0){waterPriestCancel(e);return;}e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);let a=e.attack;
 if(!a||!['priestTide','priestColumns'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),clear=lineClear(e,p);if(e.t<=0&&d<=480&&clear){beginWaterPriest(e,(e.priestCycle||0)%2?'priestColumns':'priestTide');e.priestCycle=(e.priestCycle||0)+1;return;}e.state='idle';if(d>850&&!e.bossProvoked||d<=480&&clear)return;
  if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let to=e.path?.[0];if(to){let dx=to.x-e.x,dy=to.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,65*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,22)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.origin)>24){waterPriestCancel(e);return;}let before=e.elapsed;e.elapsed+=dt;
 if(a.pattern==='priestTide'){
  for(let wave of a.waves){if(e.elapsed+1e-8<wave.start||before>wave.start+1.4)continue;let near=waterPriestRadius(Math.max(before,wave.start),wave.start)-18,far=waterPriestRadius(e.elapsed,wave.start)+18,d=dist(p,a.origin);if(!wave.hit&&d>=near&&d<=far&&!waterPriestGap(a,p,wave)&&lineClear(a.origin,p)){wave.hit=true;e.struck=true;hurt(a.phase===2?125:100);playSound('impact',p.x,p.y);}}
  if(e.elapsed>=a.waves.at(-1).start+2.1)waterPriestCancel(e);
 }else{
  let count=a.phase===2?4:3;while(a.marks.length<count&&e.elapsed+1e-8>=a.marks.length*.55)a.marks.push({x:p.x,y:p.y,releaseAt:e.elapsed+1.15,fired:false});
  for(let mark of a.marks)if(!mark.fired&&e.elapsed+1e-8>=mark.releaseAt){mark.fired=true;e.struck=true;if(dist(p,mark)<=70&&lineClear(a.origin,mark)&&lineClear(mark,p))hurt(a.phase===2?120:95);playSound('impact',mark.x,mark.y);}
  if(a.marks.length===count&&a.marks.every(mark=>mark.fired)&&e.elapsed>=a.marks.at(-1).releaseAt+.7)waterPriestCancel(e);
 }
};
const waterPriestDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{if(e.species!=='r3b1'||!waterPriestSheet.complete||!waterPriestSheet.naturalWidth||!waterPriestSheet.naturalHeight)return waterPriestDrawBase(e,size);let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack)f={row:2,col:e.elapsed<.6?0:e.elapsed<e.attack.windup?1:e.elapsed<e.attack.windup+.4?2:3};let q=project(e.x,e.y),sw=waterPriestSheet.naturalWidth/4,sh=waterPriestSheet.naturalHeight/3,w=300,h=w*sh/sw;ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,waterPriestSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*(f.row===0?.85:.78),w,h);else ctx.drawImage(waterPriestSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*(f.row===0?.85:.78),w,h);ctx.restore();return true;};
const waterPriestSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3b1'?200:waterPriestSizeBase(e);
function waterPriestArc(origin,radius,gap,color,width){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();for(let i=0;i<=48;i++){let angle=gap+Math.PI/6+i/48*Math.PI*5/3,q=project(origin.x+Math.cos(angle)*radius,origin.y+Math.sin(angle)*radius);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}ctx.stroke();ctx.restore();}
const waterPriestGroundBase=drawGroundEffects;drawGroundEffects=()=>{waterPriestGroundBase();for(let e of(typeof enemyRenderList==='function'?enemyRenderList('r3b1'):enemies)){let a=e.attack;if(e.species!=='r3b1'||e.hp<=0||!a||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y))continue;if(a.pattern==='priestTide'){for(let wave of a.waves){if(e.elapsed>wave.start+1.4||e.elapsed<wave.start-1.5)continue;let active=e.elapsed>=wave.start,r=active?waterPriestRadius(e.elapsed,wave.start):70;waterPriestArc(a.origin,r,wave.gap,active?'#8be5ff':'#d4e4ac',active?7:2);if(active){waterPriestArc(a.origin,r-18,wave.gap,'#75bddb',1);waterPriestArc(a.origin,r+18,wave.gap,'#75bddb',1);}else for(let angle of [wave.gap-Math.PI/6,wave.gap+Math.PI/6]){let q=project(a.origin.x+Math.cos(angle)*70,a.origin.y+Math.sin(angle)*70),end=project(a.origin.x+Math.cos(angle)*500,a.origin.y+Math.sin(angle)*500);ctx.save();ctx.strokeStyle='#91e8bc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.restore();}}}else if(a.pattern==='priestColumns')for(let mark of a.marks){if(e.elapsed>mark.releaseAt+.25)continue;groundRing(mark.x,mark.y,70,mark.fired?'#8be5ff':'#d4e4ac',mark.fired?6:2);if(mark.fired){let q=project(mark.x,mark.y);ctx.save();ctx.strokeStyle='#8be5ff';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x,q.y-140);ctx.stroke();ctx.restore();}}}};
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r3b1',animateEnemy,drawRegionEnemy);
