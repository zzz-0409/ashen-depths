// A committed accelerating rush; baiting it into terrain creates a long opening.
function beginBoarRush(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x),length=clamp(dist(e,p)+140,220,440);
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'boarRush',bespoke:true,windup:1.1,travel:.8,radius:38,length,angle,center:{x:e.x,y:e.y},target:{x:e.x+Math.cos(angle)*length,y:e.y+Math.sin(angle)*length}};
}
function boarDamageFactor(e){return e.species==='r0e5'&&e.attack?.pattern==='boarRush'&&e.attack.blocked?1.75:1}
const boarHitBase=hit;hit=(e,damage)=>boarHitBase(e,damage*boarDamageFactor(e));
const boarAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0e5')return boarAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=360&&lineClear(e,p))beginBoarRush(e);
 let a=e.attack;if(a?.pattern!=='boarRush')return boarAnimateBase(e,dt);
 let previous=e.elapsed;e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 let progress=t=>Math.pow(clamp((t-a.windup)/a.travel,0,1),2),distance=a.length*(progress(e.elapsed)-progress(previous));
 if(distance>0&&!a.blocked){let steps=Math.ceil(distance/6),step=distance/steps;
  for(let i=0;i<steps;i++){let before={x:e.x,y:e.y},dx=Math.cos(a.angle)*step,dy=Math.sin(a.angle)*step;moveActor(e,dx,dy,16);
   if(Math.hypot(e.x-before.x-dx,e.y-before.y-dy)>.1){e.x=before.x;e.y=before.y;a.blocked=true;a.recoverAt=e.elapsed+2.4;e.struck=true;burst(e.x,e.y,45,'#e8c387');break}
   if(!a.hit&&dist(e,p)<=a.radius&&lineClear(e,p)){hurt(38);a.hit=true}
  }
 }
 if(e.elapsed>=a.windup+a.travel)e.struck=true;
 if(e.elapsed>=(a.recoverAt??a.windup+a.travel+.7)){e.state='idle';e.t=1.4;e.attack=null}
};
const boarSheet=new Image();boarSheet.assetSrc='assets/grass-boar-anim.png';
const boarDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0e5')return boarDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(a?.pattern==='boarRush')frame={row:a.blocked?2:e.elapsed<a.windup?2:e.elapsed<a.windup+a.travel?1:2,col:a.blocked?2:e.elapsed<a.windup?0:e.elapsed<a.windup+a.travel?Math.floor(e.anim*15)%4:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,37,12,0,0,Math.PI*2);ctx.fill();
 if(boarSheet.complete&&boarSheet.naturalWidth){let sw=boarSheet.naturalWidth/4,sh=boarSheet.naturalHeight/3,w=130,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,boarSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);else ctx.drawImage(boarSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h)}ctx.restore();return true;
};
function drawBoarEffects(ground){for(let e of enemies){let a=e.attack;if(e.species!=='r0e5'||e.hp<=0||a?.pattern!=='boarRush'||!visibleAt(e.x,e.y))continue;ctx.save();if(a.blocked){if(ground)groundRing(e.x,e.y,48,'#ffe19a',2);if(!ground){let s=project(e.x,e.y);ctx.fillStyle='#ffe19a';for(let i=0;i<3;i++){let t=e.anim*4+i*Math.PI*2/3;ctx.beginPath();ctx.arc(s.x+Math.cos(t)*16,s.y-102+Math.sin(t)*5,3,0,Math.PI*2);ctx.fill()}}}else if(ground&&!e.struck){ctx.strokeStyle='#ffc295';ctx.fillStyle='#a8532428';ctx.lineWidth=2;finalPolygon(a,[[0,-a.radius],[a.length,-a.radius],[a.length,a.radius],[0,a.radius]])}ctx.restore()}};

const boarGroundBase=drawGroundEffects;drawGroundEffects=()=>{boarGroundBase();drawBoarEffects(true)};
const boarAirBase=drawEffects;drawEffects=()=>{boarAirBase();drawBoarEffects(false)};

