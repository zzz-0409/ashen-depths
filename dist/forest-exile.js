// A close slash creates space for a committed dagger throw after a backward step.
function beginExileSkirmish(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'exileSkirmish',bespoke:true,windup:.7,center:{x:e.x,y:e.y},angle,radius:125,halfAngle:.85,slashed:false,thrown:false,blocked:false,throwOrigin:null};
}
function exileSlashContains(a,point){let angle=Math.atan2(point.y-a.center.y,point.x-a.center.x)-a.angle;return dist(a.center,point)<=a.radius&&Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=a.halfAngle;}
function exileAdvance(e,dt){
 let a=e.attack,previous=e.elapsed;e.elapsed+=dt;
 if(!a.slashed&&e.elapsed>=.7){a.slashed=true;if(exileSlashContains(a,p)&&lineClear(a.center,p))hurt(35);playSound('slash',e.x,e.y);}
 let travel=clamp((e.elapsed-.9)/.4,0,1)-clamp((previous-.9)/.4,0,1);
 if(travel>0&&!a.blocked){let length=100*travel,steps=Math.max(1,Math.ceil(length/4));for(let i=0;i<steps;i++){
  let next={x:e.x-Math.cos(a.angle)*length/steps,y:e.y-Math.sin(a.angle)*length/steps};
  if(!passable(next.x,next.y,14)||!lineClear(e,next)){a.blocked=true;break;}e.x=next.x;e.y=next.y;
 }}
 if(!a.throwOrigin&&e.elapsed>=1.3){a.throwOrigin={x:e.x,y:e.y};a.throwAngle=Math.atan2(p.y-e.y,p.x-e.x);e.facing=Math.cos(a.throwAngle)-Math.sin(a.throwAngle)<0?-1:1;}
 if(!a.thrown&&e.elapsed>=2.1){a.thrown=true;shots.push({x:a.throwOrigin.x,y:a.throwOrigin.y,vx:Math.cos(a.throwAngle)*380,vy:Math.sin(a.throwAngle)*380,life:460/380,damage:52,enemy:true,art:'woodArrow',exileBlade:true});playSound('arrow',e.x,e.y);}
 e.struck=a.thrown;if(e.elapsed>=3.3){e.attack=null;e.state='idle';e.t=1.3;}
}
const exileAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2e2')return exileAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='exileSkirmish'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(distance<=135&&clear&&e.t<=0)beginExileSkirmish(e);
  else{
   if(distance>750&&!e.aware||distance<85&&clear){e.state='idle';return;}
   if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,125*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,14)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 for(let remaining=dt;remaining>1e-8&&e.attack;){let step=Math.min(.025,remaining);exileAdvance(e,step);remaining-=step;}
};
const exileDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2e2')return exileDrawBase(e,size);let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim);
 if(e.hp>0&&e.attack?.pattern==='exileSkirmish'){let t=e.elapsed;frame=t>=.9&&t<1.3?{row:1,col:3-Math.floor(t*12)%4}:{row:2,col:t<.7||t>=1.3&&t<2.1?0:t<.9||t>=2.1&&t<2.4?2:3};}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,23,9,0,0,Math.PI*2);ctx.fill();
 if(scoutSheet.complete&&scoutSheet.naturalWidth){let sw=scoutSheet.naturalWidth/4,sh=scoutSheet.naturalHeight/3,w=122,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'sepia(.3) hue-rotate(35deg)';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,scoutSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.96,w,h);else ctx.drawImage(scoutSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.96,w,h);}ctx.restore();return true;
};
const exileSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2e2'?122:exileSizeBase(e);
const exileGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 exileGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r2e2'):enemies)){let a=e.attack;if(e.species!=='r2e2'||e.hp<=0||a?.pattern!=='exileSkirmish'||!visibleAt(e.x,e.y))continue;
  ctx.save();ctx.strokeStyle='#f1cf9d';ctx.lineWidth=2;ctx.fillStyle='#d6aa7029';
  if(e.elapsed<.85){let center=project(a.center.x,a.center.y);ctx.beginPath();ctx.moveTo(center.x,center.y);for(let i=0;i<=20;i++){let angle=a.angle-a.halfAngle+2*a.halfAngle*i/20,q=project(a.center.x+Math.cos(angle)*a.radius,a.center.y+Math.sin(angle)*a.radius);ctx.lineTo(q.x,q.y);}ctx.closePath();ctx.fill();ctx.stroke();}
  if(a.throwOrigin&&!a.thrown){let length=460;for(let d=4;d<=460;d+=4)if(!lineClear(a.throwOrigin,{x:a.throwOrigin.x+Math.cos(a.throwAngle)*d,y:a.throwOrigin.y+Math.sin(a.throwAngle)*d})){length=d-4;break;}
   ctx.beginPath();thornLaneOutline(a.throwOrigin,a.throwAngle,length).forEach((point,i)=>{let q=project(point.x,point.y);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});ctx.closePath();ctx.strokeStyle='#bfe6d9';ctx.fillStyle='#9cd8c320';ctx.fill();ctx.stroke();
  }ctx.restore();
 }
};
const exileArrowBase=drawWoodArrow;drawWoodArrow=s=>{
 if(!s.exileBlade)return exileArrowBase(s);let head=project(s.x,s.y),tail=project(s.x-s.vx/380*24,s.y-s.vy/380*24);ctx.save();ctx.translate(head.x,head.y);ctx.rotate(Math.atan2(head.y-tail.y,head.x-tail.x));ctx.fillStyle='#e4f1de';ctx.strokeStyle='#7b9a87';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-15,-5);ctx.lineTo(-10,0);ctx.lineTo(-15,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#896e47';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-22,0);ctx.stroke();ctx.restore();
};
