// The vine snake lashes a committed line, then bites around its original position.
// A damaging lash pulls the player along collision-checked steps, never through walls.
function beginVineLash(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x);
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'vineLash',bespoke:true,windup:1,origin:{x:e.x,y:e.y},angle,lashed:false,bitten:false,length:340};
 for(let d=4;d<=340;d+=4)if(!lineClear(e,{x:e.x+Math.cos(angle)*d,y:e.y+Math.sin(angle)*d})){e.attack.length=d-4;break;}
}
function vineLashContains(a,point){
 let dx=point.x-a.origin.x,dy=point.y-a.origin.y,along=dx*Math.cos(a.angle)+dy*Math.sin(a.angle),side=-dx*Math.sin(a.angle)+dy*Math.cos(a.angle);
 return along>=0&&along<=a.length&&Math.abs(side)<=24;
}
function pullVinePlayer(a){
 let dx=a.origin.x-p.x,dy=a.origin.y-p.y,length=Math.hypot(dx,dy),distance=Math.min(140,Math.max(0,length-40));
 if(!length)return;let steps=Math.ceil(distance/6);for(let i=0;i<steps;i++)moveActor(p,dx/length*distance/steps,dy/length*distance/steps,13);
}
const vineAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2e1')return vineAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='vineLash'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(distance<=340&&clear&&e.t<=0)beginVineLash(e);
  else{
   if(distance>750&&!e.aware||distance<=300&&clear){e.state='idle';return;}
   if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,95*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,13)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 let a=e.attack;e.elapsed+=dt;
 if(!a.lashed&&e.elapsed>=1){a.lashed=true;
  if(vineLashContains(a,p)&&lineClear(a.origin,p)){let hp=p.hp;hurt(42);if(p.hp<hp)pullVinePlayer(a);}
  playSound('slash',e.x,e.y);
 }
 if(!a.bitten&&e.elapsed>=1.55){a.bitten=true;if(dist(a.origin,p)<=95&&lineClear(a.origin,p))hurt(36);burst(e.x,e.y,95,'#add27f');playSound('impact',e.x,e.y);}
 e.struck=a.lashed&&a.bitten;if(e.elapsed>=2.4){e.attack=null;e.state='idle';e.t=1.5;}
};
function vineWarningCorners(a){return [[0,-24],[a.length,-24],[a.length,24],[0,24]].map(([x,y])=>({x:a.origin.x+Math.cos(a.angle)*x-Math.sin(a.angle)*y,y:a.origin.y+Math.sin(a.angle)*x+Math.cos(a.angle)*y}));}
const vineDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2e1')return vineDrawBase(e,size);
 let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim);
 if(e.hp>0&&e.attack?.pattern==='vineLash')frame={row:2,col:e.elapsed<.5?0:e.elapsed<1?1:e.elapsed<1.75?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,30,10,0,0,Math.PI*2);ctx.fill();
 if(serpentSheet.complete&&serpentSheet.naturalWidth){let sw=serpentSheet.naturalWidth/4,sh=serpentSheet.naturalHeight/3,w=160,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'sepia(.25) hue-rotate(15deg)';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,serpentSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);else ctx.drawImage(serpentSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);}
 ctx.restore();return true;
};
const vineSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2e1'?160:vineSizeBase(e);
const vineGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 vineGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r2e1'):enemies)){let a=e.attack;if(e.species!=='r2e1'||e.hp<=0||a?.pattern!=='vineLash'||!visibleAt(e.x,e.y))continue;
  ctx.save();if(e.elapsed<1.2){let points=vineWarningCorners(a).map(q=>project(q.x,q.y));ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.fillStyle=a.lashed?'#dcf79a77':'#b5cf8530';ctx.strokeStyle='#d3e9a0';ctx.lineWidth=a.lashed?3:1.5;ctx.fill();ctx.stroke();
   if(a.lashed){let start=project(e.x,e.y),end=project(e.x+Math.cos(a.angle)*a.length,e.y+Math.sin(a.angle)*a.length);ctx.beginPath();ctx.moveTo(start.x,start.y-12);for(let i=1;i<=12;i++)ctx.lineTo(start.x+(end.x-start.x)*i/12,start.y+(end.y-start.y)*i/12-12+Math.sin(i*1.7)*5);ctx.strokeStyle='#8ebd65';ctx.lineWidth=5;ctx.stroke();}
  }
  if(e.elapsed<1.75){ctx.setLineDash(a.lashed?[]:[4,5]);groundRing(a.origin.x,a.origin.y,95,a.bitten?'#f4e9af':a.lashed?'#efbf7c':'#b7b897',a.lashed?2.5:1);}
  ctx.restore();
 }
};
