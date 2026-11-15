const saharSheet=new Image();saharSheet.assetSrc='assets/sahar-v2.png';
function saharSegmentDistance(a,b,q){let dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*dy)/l)):0;return Math.hypot(q.x-a.x-dx*t,q.y-a.y-dy*t);}
function beginSahar(e,pattern='saharCharge'){
 let phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x),origin={x:e.x,y:e.y};e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 let a=e.attack={pattern,bespoke:true,phase,origin,owner:p,world:dungeon,angle,windup:1.6,last:{...origin},length:0,travel:0,stopped:false,hit:false,marks:[],wakeAt:3.6,wakeFired:false,waves:[],end:4.5};
 if(pattern==='saharCharge'){let wanted=Math.min(520,Math.max(240,dist(e,p)+120)),last=origin;for(let d=6;d<wanted+6;d+=6){let length=Math.min(d,wanted),q={x:origin.x+Math.cos(angle)*length,y:origin.y+Math.sin(angle)*length};if(!passable(q.x,q.y,48)||!lineClear(last,q,48))break;a.length=length;last=q;}a.endPoint=last;}
 else {a.waves=[{start:1.6,reverse:false,hit:false}];if(phase===2)a.waves.push({start:5,reverse:true,hit:false});a.end=a.waves.at(-1).start+2.8;}
}
function saharBreathAngle(a,wave,time){let t=Math.max(0,Math.min(1,(time-wave.start)/1.8));return a.angle-Math.PI/3+(wave.reverse?1-t:t)*Math.PI*2/3;}
function saharBreathContains(a,wave,q,before,after){
 if(after+1e-8<wave.start||before>wave.start+1.8+1e-8||!lineClear(a.origin,q))return false;let r=dist(a.origin,q);if(r<60||r>480)return false;
 let from=saharBreathAngle(a,wave,before),to=saharBreathAngle(a,wave,after),lo=Math.min(from,to)-Math.PI/15,hi=Math.max(from,to)+Math.PI/15,angle=Math.atan2(q.y-a.origin.y,q.x-a.origin.x);for(let k=-2;k<=2;k++){let theta=angle+k*Math.PI*2;if(theta>=lo-1e-8&&theta<=hi+1e-8)return true;}return false;
}
function cancelSahar(e){e.attack=null;e.state='idle';e.t=1.3;}
const saharAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r4b0')return saharAnimateBase(e,dt);if(e.hp<=0||dead||p.hp<=0){cancelSahar(e);return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 e.anim=(e.anim||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(e.reactionStun>0){cancelSahar(e);return;}let a=e.attack;
 if(!a||!['saharCharge','saharBreath'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),clear=lineClear(e,p);if(e.t<=0&&d<=450&&clear){beginSahar(e,(e.saharCycle||0)%2?'saharBreath':'saharCharge');e.saharCycle=(e.saharCycle||0)+1;return;}e.state='idle';if(d>900&&!e.bossProvoked||d<=350&&clear)return;
  if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let q=e.path?.[0];if(q){let dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,80*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,48)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.last)>24){cancelSahar(e);return;}let before=e.elapsed;e.elapsed+=dt;
 if(a.pattern==='saharCharge'){
  let progress=t=>Math.max(0,Math.min(1,(t-1.6)/.7)),budget=(progress(e.elapsed)-progress(before))*a.length,ux=Math.cos(a.angle),uy=Math.sin(a.angle);
  while(!a.stopped&&budget>1e-8){let amount=Math.min(6,budget),from={x:e.x,y:e.y},q={x:e.x+ux*amount,y:e.y+uy*amount};if(!passable(q.x,q.y,48)||!lineClear(from,q,48)){a.stopped=true;break;}moveActor(e,ux*amount,uy*amount,48);let moved=dist(from,e);if(moved>1e-8){let oldTravel=a.travel;a.travel+=moved;if(!a.hit&&saharSegmentDistance(from,e,p)<=60&&lineClear(e,p)){a.hit=true;hurt(a.phase===2?160:130);}let count=Math.min(5,Math.floor((a.travel+1e-8)/100));while(a.marks.length<count){let t=((a.marks.length+1)*100-oldTravel)/moved;a.marks.push({x:from.x+(e.x-from.x)*t,y:from.y+(e.y-from.y)*t});}a.wakeAt=Math.max(a.wakeAt,e.elapsed+1.2);a.end=Math.max(a.end,a.wakeAt+.8);}budget-=amount;if(moved<amount-1e-6)a.stopped=true;}
  a.last={x:e.x,y:e.y};if(before<1.6&&e.elapsed+1e-8>=1.6){e.struck=true;playSound('impact',e.x,e.y);}
  if(!a.wakeFired&&e.elapsed+1e-8>=a.wakeAt){a.wakeFired=true;let radius=a.phase===2?90:75;if(a.marks.some(q=>dist(q,p)<=radius&&lineClear(q,p)))hurt(a.phase===2?120:95);playSound('impact',e.x,e.y);}
 }else for(let wave of a.waves){if(!wave.hit&&saharBreathContains(a,wave,p,before,e.elapsed)){wave.hit=true;hurt(a.phase===2?150:120);}if(before<wave.start&&e.elapsed+1e-8>=wave.start){e.struck=true;playSound('fire',e.x,e.y);}}
 if(e.elapsed>=a.end)cancelSahar(e);
};
const saharDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r4b0'||!saharSheet.complete||!saharSheet.naturalWidth||!saharSheet.naturalHeight)return saharDrawBase(e,size);let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack){let t=e.elapsed,a=e.attack;if(a.pattern==='saharBreath'&&a.waves.length>1&&t>=a.waves[1].start-1.6)t-=a.waves[1].start-1.6;f={row:2,col:t<.6?0:t<1.6?1:t<(a.pattern==='saharCharge'?2.3:3.4)?2:3};}let q=project(e.x,e.y),sw=saharSheet.naturalWidth/4,sh=saharSheet.naturalHeight/3,w=580,h=w*sh/sw,anchor=[.77,.69,.69][f.row];ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,saharSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);else ctx.drawImage(saharSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);ctx.restore();return true;
};
const saharSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r4b0'?350:saharSizeBase(e);
function saharCone(a,angle,color){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=16;i++){let t=angle-Math.PI/15+i/16*Math.PI*2/15,q=project(a.origin.x+Math.cos(t)*480,a.origin.y+Math.sin(t)*480);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}for(let i=16;i>=0;i--){let t=angle-Math.PI/15+i/16*Math.PI*2/15,q=project(a.origin.x+Math.cos(t)*60,a.origin.y+Math.sin(t)*60);ctx.lineTo(q.x,q.y);}ctx.closePath();ctx.stroke();ctx.restore();}
const saharGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 saharGroundBase();for(let e of(typeof enemyRenderList==='function'?enemyRenderList('r4b0'):enemies)){let a=e.attack;if(e.species!=='r4b0'||e.hp<=0||!a||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y))continue;
 if(a.pattern==='saharCharge'){if(e.elapsed<2.3){let ux=Math.cos(a.angle),uy=Math.sin(a.angle);ctx.save();ctx.strokeStyle='#e4bb78';ctx.lineWidth=2;for(let side of [-1,1]){let start=project(a.origin.x-uy*60*side,a.origin.y+ux*60*side),end=project(a.endPoint.x-uy*60*side,a.endPoint.y+ux*60*side);ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();}ctx.restore();}if(!a.wakeFired)for(let q of a.marks)groundRing(q.x,q.y,a.phase===2?90:75,'#e0aa64',2);}
 else for(let wave of a.waves)if(e.elapsed>=wave.start-1.6&&e.elapsed<=wave.start+1.8)saharCone(a,saharBreathAngle(a,wave,e.elapsed),e.elapsed<wave.start?'#e4bb78':'#f49b4b');
 }
};
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r4b0',animateEnemy,drawRegionEnemy);

const saharRadiusBase=enemyHitRadius;enemyHitRadius=e=>e.species==='r4b0'?70:saharRadiusBase(e);
