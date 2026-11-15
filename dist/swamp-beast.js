const mudBeastSheet=new Image();mudBeastSheet.assetSrc='assets/swamp-beast-anim.png';
function beginMudBeast(e){let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern:'mudRush',bespoke:true,windup:1.1,angle,origin:{x:e.x,y:e.y},travelled:0,stoppedAt:null,blocked:false};}
function mudBeastDamageFactor(e){let a=e.attack;if(e.species!=='r3e4'||a?.pattern!=='mudRush'||e.dotTick)return 1;return a.stoppedAt!==null?1.4:e.elapsed<1.1?.5:1;}
const mudBeastHitBase=hit;hit=(e,d)=>mudBeastHitBase(e,d*mudBeastDamageFactor(e));
function mudRushTouches(from,to,point){let dx=to.x-from.x,dy=to.y-from.y,len=dx*dx+dy*dy,t=len?clamp(((point.x-from.x)*dx+(point.y-from.y)*dy)/len,0,1):0;return Math.hypot(point.x-from.x-dx*t,point.y-from.y-dy*t)<=42;}
const mudBeastAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3e4')return mudBeastAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='mudRush'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(e.t<=0&&distance<=330&&clear)beginMudBeast(e);
  else{e.state='idle';if(distance>750&&!e.aware)return;if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,85*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,22)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;}
 }
 e.elapsed=Math.round((e.elapsed+dt)*1e6)/1e6;let a=e.attack;
 if(a.stoppedAt===null&&e.elapsed>=1.1){
  if(!a.launched){a.launched=true;playSound('impact',e.x,e.y);}
  let wanted=Math.min(350,(e.elapsed-1.1)*500),remaining=wanted-a.travelled;
  while(remaining>1e-8){let step=Math.min(10,remaining),from={x:e.x,y:e.y},to={x:e.x+Math.cos(a.angle)*step,y:e.y+Math.sin(a.angle)*step};
   if(!lineClear(from,to)){a.blocked=true;a.stoppedAt=1.1+a.travelled/500;break;}
   moveActor(e,to.x-e.x,to.y-e.y,22);if(Math.abs((e.x-from.x)*Math.sin(a.angle)-(e.y-from.y)*Math.cos(a.angle))>1e-6){e.x=from.x;e.y=from.y;}let moved=dist(from,e);a.travelled+=moved;remaining-=step;
   if(!e.struck&&mudRushTouches(from,e,p)&&lineClear(e,p)){e.struck=true;hurt(62);}
   if(moved<step*.9){a.blocked=true;a.stoppedAt=1.1+a.travelled/500;break;}
  }
  if(a.stoppedAt===null&&a.travelled>=350-1e-6)a.stoppedAt=1.8;
 }
 if(a.stoppedAt!==null&&e.elapsed>=a.stoppedAt+(a.blocked?2:1.2)){e.attack=null;e.state='idle';e.t=2;e.struck=true;}
};
const mudBeastDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r3e4'||!mudBeastSheet.complete||!mudBeastSheet.naturalWidth)return mudBeastDrawBase(e,size);
 let a=e.attack,frame=spriteFrame(e.state,e.anim);if(a?.pattern==='mudRush')frame={row:2,col:a.stoppedAt!==null?3:e.elapsed<1.1?0:1+Math.floor(e.elapsed*12)%2};
 let q=project(e.x,e.y),sw=mudBeastSheet.naturalWidth/4,sh=mudBeastSheet.naturalHeight/3,w=155,h=w*sh/sw;ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,mudBeastSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.91,w,h);else ctx.drawImage(mudBeastSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.91,w,h);ctx.restore();return true;
};
const mudBeastSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3e4'?125:mudBeastSizeBase(e);
const mudBeastGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 mudBeastGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r3e4'):enemies)){let a=e.attack;if(e.species!=='r3e4'||e.hp<=0||a?.pattern!=='mudRush'||!visibleAt(e.x,e.y))continue;ctx.save();
 if(a.stoppedAt!==null){groundRing(e.x,e.y,48,'#ffd89b',2);}else{
  let remaining=350-a.travelled,end=0;for(let d=10;d<=remaining;d+=10){let q={x:e.x+Math.cos(a.angle)*d,y:e.y+Math.sin(a.angle)*d};if(!lineClear(e,q))break;end=d;}
  ctx.beginPath();for(let i=0;i<=32;i++){let angle=a.angle-Math.PI/2+i*Math.PI*2/32,forward=i<=16?end:0,q=project(e.x+Math.cos(a.angle)*forward+Math.cos(angle)*42,e.y+Math.sin(a.angle)*forward+Math.sin(angle)*42);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.closePath();ctx.fillStyle='#e1b67122';ctx.strokeStyle='#ffe0a1';ctx.lineWidth=2;ctx.fill();ctx.stroke();
 }ctx.restore();}
};
