// Retreating marsh flame: pursue its body only after the planted embers expire.
function swampWispPlant(e,time){
 let a=e.attack,last=a.marks.at(-1);if(last&&dist(last,e)<45)return;
 a.marks.push({x:e.x,y:e.y,placed:time,at:time+1.1,spent:false});
}
function beginSwampWisp(e){
 let angle=Math.atan2(e.y-p.y,e.x-p.x);e.state='attack';e.elapsed=0;e.struck=false;
 e.attack={pattern:'marshEmbers',bespoke:true,windup:1.1,angle,radius:70,marks:[],nextSeed:1};swampWispPlant(e,0);
}
const swampWispAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3e1')return swampWispAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='marshEmbers'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(e.t<=0&&distance<=280&&clear)beginSwampWisp(e);
  else{
   e.state='idle';if(distance>750&&!e.aware)return;
   if(distance<=220&&clear)return;
   if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,115*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,15)>.1?'walk':'idle';}}return;
  }
 }
 let a=e.attack,end=e.elapsed+dt;
 // Split at planting times so slow frames cannot collapse all marks at one point.
 while(e.elapsed<Math.min(end,.9)-1e-8){
  let next=Math.min(end,a.nextSeed*.3,.9),step=Math.max(0,next-e.elapsed);
  moveActor(e,Math.cos(a.angle)*170*step*(e.slow>0?.35:1),Math.sin(a.angle)*170*step*(e.slow>0?.35:1),15);
  e.elapsed=next;
  if(e.elapsed+1e-8>=a.nextSeed*.3){swampWispPlant(e,a.nextSeed*.3);a.nextSeed++;}
 }
 e.elapsed=end;
 for(let mark of a.marks)if(!mark.spent&&end+1e-8>=mark.at){
  mark.spent=true;if(dist(mark,p)<=a.radius&&lineClear(mark,p))hurt(34);
  burst(mark.x,mark.y,a.radius,'#b5e49a');playSound('poison',mark.x,mark.y);
 }
 e.struck=a.marks.every(mark=>mark.spent);
 if(end>=2.8){e.attack=null;e.state='idle';e.t=2.4;}
};
const swampWispSheet=new Image();swampWispSheet.assetSrc='assets/swamp-wisp-anim.png';
const swampWispDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r3e1')return swampWispDrawBase(e,size);
 let pos=project(e.x,e.y),attack=e.hp>0&&e.attack?.pattern==='marshEmbers',lift=e.hp>0?Math.sin(e.anim*3)*3:0,frame=spriteFrame(e.state,e.anim);
 if(attack)frame=e.elapsed<.9?{row:1,col:Math.min(3,Math.floor(e.elapsed/.225))}:{row:2,col:e.elapsed<1.1?0:e.elapsed<1.7?1:e.elapsed<2.1?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,23,8,0,0,Math.PI*2);ctx.fill();
 if(swampWispSheet.complete&&swampWispSheet.naturalWidth){let sw=swampWispSheet.naturalWidth/4,sh=swampWispSheet.naturalHeight/3,w=125,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,swampWispSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.84-lift,w,h);else ctx.drawImage(swampWispSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.84-lift,w,h);}
 ctx.restore();return true;
};
const swampWispSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3e1'?90:swampWispSizeBase(e);
const swampWispGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 swampWispGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r3e1'):enemies)){let a=e.attack;if(e.species!=='r3e1'||e.hp<=0||a?.pattern!=='marshEmbers')continue;
  for(let mark of a.marks){if(mark.spent||!visibleAt(mark.x,mark.y))continue;
   // Clip the warning to the same line-of-sight test used by the explosion.
   ctx.save();ctx.beginPath();for(let i=0;i<=40;i++){let angle=i/40*Math.PI*2,last=mark;for(let r=5;r<=a.radius;r+=5){let q={x:mark.x+Math.cos(angle)*r,y:mark.y+Math.sin(angle)*r};if(!lineClear(mark,q))break;last=q;}let s=project(last.x,last.y);if(i)ctx.lineTo(s.x,s.y);else ctx.moveTo(s.x,s.y);}
   ctx.closePath();ctx.fillStyle='#d2e99120';ctx.strokeStyle='#e4f3aa';ctx.lineWidth=2;ctx.fill();ctx.stroke();
   let pos=project(mark.x,mark.y),progress=clamp((e.elapsed-mark.placed)/1.1,0,1);circle(pos.x,pos.y-5,4+progress*5,'#e6f6b0');ctx.restore();
  }
 }
};
const swampWispEffectsBase=drawEffects;drawEffects=()=>{
 swampWispEffectsBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r3e1'):enemies)){let a=e.attack;if(e.species!=='r3e1'||e.hp<=0||a?.pattern!=='marshEmbers')continue;
  for(let mark of a.marks){let age=e.elapsed-mark.at;if(!mark.spent||age<0||age>.3||!visibleAt(mark.x,mark.y))continue;let pos=project(mark.x,mark.y);ctx.save();ctx.globalAlpha=1-age/.3;for(let i=0;i<5;i++){let angle=i*2.4;circle(pos.x+Math.cos(angle)*age*100,pos.y-15-age*90+Math.sin(angle)*age*30,8*(1-age/.3),'#dcf6a9');}ctx.restore();}
 }
};
