const skollSheet=new Image();skollSheet.assetSrc='assets/skoll-v1.png';
function beginSkoll(e,pattern='skollRake'){
 const phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x);e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;
 const a=e.attack={pattern,bespoke:true,owner:p,world:dungeon,origin:{x:e.x,y:e.y},angle,phase,windup:pattern==='skollRake'?1.2:phase===2?3.3:2.4,sets:[],marks:[],nextTick:1.2,nextHit:-Infinity};
 if(pattern==='skollRake'){a.sets=[{angle,start:1.2,end:3}];if(phase===2)a.sets.push({angle:angle+Math.PI/2,start:2.1,end:3.9});a.end=a.sets.at(-1).end+1.4;}
 else{a.count=phase===2?5:3;a.marks.push({x:p.x,y:p.y,fired:false});a.end=a.windup+(a.count-1)*.45+1.2;}
}
function cancelSkoll(e){e.attack=null;e.state='idle';e.t=1.2;}
function skollRakeTouches(a,set,q){const dx=q.x-a.origin.x,dy=q.y-a.origin.y,along=dx*Math.cos(set.angle)+dy*Math.sin(set.angle),side=-dx*Math.sin(set.angle)+dy*Math.cos(set.angle);return along>=90&&along<=450&&[-90,0,90].some(offset=>Math.abs(side-offset)<=22)&&lineClear(a.origin,q);}
const skollAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r5b0')return skollAnimateBase(e,dt);
 if(e.hp<=0||dead||p.hp<=0){cancelSkoll(e);return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 e.anim=(e.anim||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(e.reactionStun>0){cancelSkoll(e);return;}
 const a=e.attack;
 if(!a||!['skollRake','skollEcho'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;e.state='idle';const distance=dist(e,p),clear=lineClear(e,p);
  if(e.t<=0&&distance<=450&&clear){beginSkoll(e,(e.skollCycle||0)%2?'skollEcho':'skollRake');e.skollCycle=(e.skollCycle||0)+1;return;}
  if(distance>900&&!e.bossProvoked||distance<120)return;
  if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}const q=e.path?.[0];if(q){const dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{const step=Math.min(len,110*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,42)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.origin)>16||dist(e,p)>650){cancelSkoll(e);return;}e.elapsed+=dt;
 if(a.pattern==='skollRake'){
  while(a.nextTick<=e.elapsed+1e-8&&a.nextTick<=a.sets.at(-1).end+1e-8){const t=a.nextTick;a.nextTick=Math.round((t+.05)*1e6)/1e6;if(t>=a.nextHit-1e-8&&a.sets.some(set=>t>=set.start-1e-8&&t<=set.end+1e-8&&skollRakeTouches(a,set,p))){a.nextHit=t+.75;e.struck=true;hurt(a.phase===2?110:90);playSound('frost',e.x,e.y);}if(dead||p.hp<=0){cancelSkoll(e);return;}}
 }else{
  while(a.marks.length<a.count&&e.elapsed+1e-8>=a.marks.length*.45)a.marks.push({x:p.x,y:p.y,fired:false});
  for(let i=a.count-1;i>=0;i--){const mark=a.marks[i],at=a.windup+(a.count-1-i)*.45;if(mark&&!mark.fired&&e.elapsed+1e-8>=at){mark.fired=true;e.struck=true;if(dist(p,mark)<=85&&lineClear(a.origin,mark)&&lineClear(mark,p))hurt(a.phase===2?145:120);playSound('frost',mark.x,mark.y);if(dead||p.hp<=0){cancelSkoll(e);return;}}}
 }
 if(e.elapsed+1e-8>=a.end)cancelSkoll(e);
};
const skollDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r5b0'||!skollSheet.complete||!skollSheet.naturalWidth)return skollDrawBase(e,size);
 let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack){const a=e.attack;f={row:2,col:e.elapsed>=a.end-1.2?3:a.pattern==='skollEcho'?2:e.elapsed<a.windup?0:1};}
 const q=project(e.x,e.y),sw=skollSheet.naturalWidth/4,sh=skollSheet.naturalHeight/3,w=300,h=w*sh/sw;ctx.save();ctx.fillStyle="#07142066";ctx.beginPath();ctx.ellipse(q.x,q.y,65,18,0,0,Math.PI*2);ctx.fill();ctx.transform(e.facing||1,0,0,1,q.x,q.y);ctx.filter=e.flash>0?'brightness(1.8)':'none';drawPreparedEnemySprite(ctx,skollSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.88,w,h);ctx.restore();return true;
};
function skollLanePoint(a,set,along,side){return{x:a.origin.x+Math.cos(set.angle)*along-Math.sin(set.angle)*side,y:a.origin.y+Math.sin(set.angle)*along+Math.cos(set.angle)*side};}
const skollGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 skollGroundBase();for(const e of(typeof enemyRenderList==='function'?enemyRenderList('r5b0'):enemies)){const a=e.attack;if(e.species!=='r5b0'||e.hp<=0||!a||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y))continue;
  if(a.pattern==='skollRake')for(const set of a.sets){if(e.elapsed>set.end||e.elapsed<set.start-1.2)continue;const active=e.elapsed>=set.start;for(const offset of [-90,0,90]){const corners=[[90,offset-22],[450,offset-22],[450,offset+22],[90,offset+22]].map(([along,side])=>{const q=skollLanePoint(a,set,along,side);return project(q.x,q.y);});ctx.save();ctx.beginPath();corners.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.fillStyle=active?'#7bcfe866':'#5ba4cc33';ctx.strokeStyle=active?'#e2f7ff':'#8ccce3';ctx.lineWidth=active?3:2;ctx.fill();ctx.stroke();if(active)for(let d=110;d<=430;d+=40){const q=skollLanePoint(a,set,d,offset);const v=project(q.x,q.y),height=22+(d%3)*6;ctx.beginPath();ctx.moveTo(v.x-8,v.y+3);ctx.lineTo(v.x-3,v.y-height);ctx.lineTo(v.x+9,v.y+2);ctx.closePath();ctx.fillStyle='#65b1d6bb';ctx.fill();ctx.strokeStyle='#d6f8ff';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.moveTo(v.x-3,v.y-height);ctx.lineTo(v.x+1,v.y+3);ctx.lineTo(v.x+9,v.y+2);ctx.fillStyle='#c1eeffc0';ctx.fill();}ctx.restore();}}
  else if(a.pattern==='skollEcho')for(let i=0;i<a.marks.length;i++){const mark=a.marks[i],at=a.windup+(a.count-1-i)*.45;if(mark.fired&&e.elapsed>at+.25)continue;const next=a.marks.length===a.count&&i===a.marks.findLastIndex(v=>!v.fired);groundRing(mark.x,mark.y,85,mark.fired?'#effaff':next?'#f4d08a':'#6db3cf',mark.fired?5:next?3:1);if(mark.fired)boundarySigil(mark,45,'#c1edff',0,6);}
 }
};
function skollAttackHint(e){const a=e.attack;if(!a)return '攻撃後の隙に反撃';if(a.pattern==='skollEcho')return a.marks.length<a.count?'足元を記録中 · 同じ場所に留まらない':e.elapsed<a.end-1.2?'新しい足跡から凍結 · 金の円を離れる':'遠吠え後の隙に反撃';return e.elapsed>=a.sets.at(-1).end?'氷が消えたら反撃':a.phase===2?'氷の爪が交差 · 線の隙間か背後へ':'3本の氷の爪 · 線の隙間か背後へ';}
const skollSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r5b0'?280:skollSizeBase(e);
const skollRadiusBase=enemyHitRadius;enemyHitRadius=e=>e.species==='r5b0'?42:skollRadiusBase(e);
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r5b0',animateEnemy,drawRegionEnemy);
