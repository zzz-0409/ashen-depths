function beginArcherShot(e){e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'aimedArrow',bespoke:true,windup:1.05,target:{x:p.x,y:p.y}};e.facing=p.x-e.x-(p.y-e.y)<0?-1:1}
const archerAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0e3')return archerAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 let a=e.attack;if(e.state==='attack'&&a?.pattern==='aimedArrow'){
  e.anim+=dt;e.elapsed+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
  if(e.elapsed>=a.windup&&!e.struck){e.struck=true;if(lineClear(e,a.target)){let angle=Math.atan2(a.target.y-e.y,a.target.x-e.x);shots.push({x:e.x,y:e.y,vx:Math.cos(angle)*360,vy:Math.sin(angle)*360,damage:30,life:1.6,enemy:true,art:'woodArrow'});if(typeof playSound==='function')playSound('arrow',e.x,e.y)}}
  if(e.elapsed>=a.windup+.65){e.state='idle';e.t=1.1;e.retreatTime=0;e.attack=null}return;
 }
 let d=dist(e,p);if(d>460||!lineClear(e,p))return archerAnimateBase(e,dt);
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);e.t-=dt;
 // A bounded retreat gives melee builds a chance to corner the archer.
 if(d<190&&(e.retreatTime||0)<.9){let dx=e.x-p.x,dy=e.y-p.y,length=Math.hypot(dx,dy)||1,step=100*(e.slow>0?.35:1)*Math.min(dt,.9-(e.retreatTime||0)),moved=moveActor(e,dx/length*step,dy/length*step,12);e.retreatTime=(e.retreatTime||0)+dt;e.state=moved>.1?'walk':'idle';e.facing=dx-dy<0?1:-1;if(moved<.1)e.retreatTime=.9;return}
 e.state='idle';if(e.t<=0)beginArcherShot(e);
};
const archerSheet=new Image();archerSheet.assetSrc='assets/grass-archer-anim.png';
const archerDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0e3')return archerDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(a?.pattern==='aimedArrow')frame={row:2,col:e.elapsed<.3?0:e.elapsed<a.windup?1:e.elapsed<a.windup+.2?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,20,8,0,0,Math.PI*2);ctx.fill();
 if(archerSheet.complete&&archerSheet.naturalWidth){let sw=archerSheet.naturalWidth/4,sh=archerSheet.naturalHeight/3,w=108,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,archerSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.92,w,h);else ctx.drawImage(archerSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.92,w,h)}ctx.restore();return true;
};
function drawWoodArrow(s){let length=Math.hypot(s.vx,s.vy)||1,head=project(s.x,s.y),tail=project(s.x-s.vx/length*25,s.y-s.vy/length*25),angle=Math.atan2(head.y-tail.y,head.x-tail.x);ctx.save();ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#dfc18b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(head.x,head.y);ctx.stroke();ctx.fillStyle='#f1e9d2';ctx.beginPath();ctx.moveTo(head.x,head.y);ctx.lineTo(head.x-Math.cos(angle-.45)*8,head.y-Math.sin(angle-.45)*8);ctx.lineTo(head.x-Math.cos(angle+.45)*8,head.y-Math.sin(angle+.45)*8);ctx.closePath();ctx.fill();ctx.restore()}
const archerEffectsBase=drawGroundEffects;drawGroundEffects=()=>{archerEffectsBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r0e3'):enemies)){let a=e.attack;if(e.species!=='r0e3'||e.hp<=0||a?.pattern!=='aimedArrow'||e.struck||!visibleAt(e.x,e.y))continue;let from=project(e.x,e.y),to=project(a.target.x,a.target.y);ctx.save();ctx.strokeStyle='#efd7a3';ctx.globalAlpha=.4+.5*clamp(e.elapsed/a.windup,0,1);ctx.lineWidth=2;ctx.setLineDash([10,5]);ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();ctx.restore()}};

