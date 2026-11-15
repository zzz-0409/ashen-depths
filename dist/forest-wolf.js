// Bark wolf: two committed ground rushes. Each pass gets its own aim warning.
function forestWolfLane(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x),length=Math.min(330,dist(e,p)+65),origin={x:e.x,y:e.y},target={...origin};
 for(let d=4;d<=length;d+=4){let q={x:origin.x+Math.cos(angle)*d,y:origin.y+Math.sin(angle)*d};if(!passable(q.x,q.y,16)||!lineClear(origin,q))break;target=q;}
 e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 return {origin,target,angle,hit:false,blocked:false};
}
function beginForestWolfRush(e){e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'barkRush',bespoke:true,windup:.85,lanes:[forestWolfLane(e)]};}
function forestWolfContact(from,to,point){let dx=to.x-from.x,dy=to.y-from.y,len=dx*dx+dy*dy,t=len?clamp(((point.x-from.x)*dx+(point.y-from.y)*dy)/len,0,1):0;return Math.hypot(point.x-from.x-dx*t,point.y-from.y-dy*t)<=34;}
function forestWolfAdvance(e,dt){
 let a=e.attack,previous=e.elapsed;e.elapsed+=dt;
 if(e.elapsed>=1.35&&!a.lanes[1])a.lanes.push(forestWolfLane(e));
 a.lanes.forEach((lane,index)=>{
  let start=index?2.05:.85,from=clamp((previous-start)/.35,0,1),to=clamp((e.elapsed-start)/.35,0,1);
  if(to<=from||lane.blocked)return;
  let dx=(lane.target.x-lane.origin.x)*(to-from),dy=(lane.target.y-lane.origin.y)*(to-from),steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
  for(let i=0;i<steps;i++){
   let before={x:e.x,y:e.y},next={x:e.x+dx/steps,y:e.y+dy/steps};
   if(!passable(next.x,next.y,16)||!lineClear(before,next)){lane.blocked=true;break;}
   e.x=next.x;e.y=next.y;
   if(!lane.hit&&forestWolfContact(before,e,p)&&lineClear(e,p)){lane.hit=true;hurt(index?46:38);playSound('slash',e.x,e.y);}
  }
 });
 if(e.elapsed>=3.15){e.attack=null;e.state='idle';e.t=1.6;e.struck=true;}
}
const forestWolfAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2e0')return forestWolfAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='barkRush'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(distance<=310&&clear&&e.t<=0)beginForestWolfRush(e);
  else{
   if(distance>750&&!e.aware||distance<70&&clear){e.state='idle';return;}
   if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,140*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,16)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 for(let remaining=dt;remaining>1e-8&&e.attack;){let step=Math.min(.025,remaining);forestWolfAdvance(e,step);remaining-=step;}
};
const forestWolfDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2e0')return forestWolfDrawBase(e,size);
 let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim),a=e.attack;
 if(e.hp>0&&a?.pattern==='barkRush'){let t=e.elapsed;frame=t<.85||t>=1.35&&t<2.05?{row:2,col:0}:t<1.2||t>=2.05&&t<2.4?{row:1,col:Math.floor(t*20)%4}:{row:2,col:3};}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,34,11,0,0,Math.PI*2);ctx.fill();
 if(wolfSheet.complete&&wolfSheet.naturalWidth){let sw=wolfSheet.naturalWidth/4,sh=wolfSheet.naturalHeight/3,w=132,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'sepia(.5) hue-rotate(30deg) saturate(.8)';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,wolfSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);else ctx.drawImage(wolfSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);}
 ctx.restore();return true;
};
const forestWolfSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2e0'?132:forestWolfSizeBase(e);
const forestWolfGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 forestWolfGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r2e0'):enemies)){let a=e.attack;if(e.species!=='r2e0'||e.hp<=0||a?.pattern!=='barkRush'||!visibleAt(e.x,e.y))continue;
  a.lanes.forEach((lane,index)=>{let start=index?2.05:.85;if(e.elapsed>start+.35)return;
   let side={x:-Math.sin(lane.angle)*34,y:Math.cos(lane.angle)*34},points=[{x:lane.origin.x+side.x,y:lane.origin.y+side.y},{x:lane.target.x+side.x,y:lane.target.y+side.y},{x:lane.target.x-side.x,y:lane.target.y-side.y},{x:lane.origin.x-side.x,y:lane.origin.y-side.y}].map(q=>project(q.x,q.y));
   ctx.save();ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.fillStyle=e.elapsed<start?'#cbdc8e22':'#e6f8a65a';ctx.strokeStyle=index?'#ffd68c':'#d4e5a0';ctx.lineWidth=2;ctx.fill();ctx.stroke();groundRing(lane.origin.x,lane.origin.y,34,ctx.strokeStyle,1);groundRing(lane.target.x,lane.target.y,34,ctx.strokeStyle,1);ctx.restore();
  });
 }
};
