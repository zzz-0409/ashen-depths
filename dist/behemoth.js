const BEHEMOTH_MOVES={hornRush:{name:'大角突進',hint:'進路の横へ回避'},earthStomp:{name:'大地砕き',hint:'円の外へ離れる'}};
function beginBehemothAttack(e,pattern){
 let phase=e.hp/e.max<.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x),length=clamp(dist(e,p)+100,180,420);
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern,bespoke:true,phase,center:{x:e.x,y:e.y},angle,length,target:{x:e.x+Math.cos(angle)*length,y:e.y+Math.sin(angle)*length},radius:pattern==='hornRush'?65:phase===2?215:180,windup:phase===2?1.05:1.35,travel:pattern==='hornRush'?.65:0,recovery:pattern==='hornRush'?1.3:.95};
}
const behemothAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0b1'||e.hp<=0)return behemothAnimateBase(e,dt);
 if(!(e.reactionStun>0)&&e.state!=='attack'&&e.t<=dt&&dist(e,p)<=430&&lineClear(e,p)){beginBehemothAttack(e,(e.behemothCycle||0)%2?'earthStomp':'hornRush');e.behemothCycle=(e.behemothCycle||0)+1}
 let a=e.attack;if(!BEHEMOTH_MOVES[a?.pattern])return behemothAnimateBase(e,dt);
 if(e.reactionStun>0)return;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);let previous=e.elapsed;e.elapsed+=dt;
 if(a.pattern==='hornRush'){
  let delta=clamp((e.elapsed-a.windup)/a.travel,0,1)-clamp((previous-a.windup)/a.travel,0,1);
  if(delta>0&&!a.blocked){let distance=a.length*delta,steps=Math.ceil(distance/8),step=distance/steps;for(let i=0;i<steps;i++){let before={x:e.x,y:e.y},dx=Math.cos(a.angle)*step,dy=Math.sin(a.angle)*step,moved=moveActor(e,dx,dy,20);if(moved<step*.8||Math.hypot(e.x-before.x-dx,e.y-before.y-dy)>.1){e.x=before.x;e.y=before.y;a.blocked=true;break}if(!a.hit&&dist(e,p)<=a.radius&&lineClear(e,p)){hurt(a.phase===2?80:60);a.hit=true}}}
 }else if(e.elapsed>=a.windup&&!e.struck){if(dist(e,p)<=a.radius&&lineClear(e,p))hurt(a.phase===2?90:70);burst(e.x,e.y,a.radius,'#e7c587');shake=Math.max(shake,5);if(typeof playSound==='function')playSound('impact',e.x,e.y)}
 if(e.elapsed>=a.windup+a.travel)e.struck=true;
 if(e.elapsed>=a.windup+a.travel+a.recovery){e.state='idle';e.t=.75;e.attack=null}
};
const behemothSheet=new Image();behemothSheet.assetSrc='assets/behemoth-anim.png';
const behemothDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0b1')return behemothDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(BEHEMOTH_MOVES[a?.pattern])frame={row:2,col:a.pattern==='hornRush'?(e.elapsed<a.windup?0:e.elapsed<a.windup+a.travel?1:3):e.elapsed<a.windup?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,70,25,0,0,Math.PI*2);ctx.fill();
 if(behemothSheet.complete&&behemothSheet.naturalWidth){let sw=behemothSheet.naturalWidth/4,sh=behemothSheet.naturalHeight/3,w=270,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(behemothSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.84,w,h)}ctx.restore();return true;
};
const behemothEffectsBase=drawGroundEffects;drawGroundEffects=()=>{behemothEffectsBase();for(let e of enemies){let a=e.attack;if(e.species!=='r0b1'||e.hp<=0||!BEHEMOTH_MOVES[a?.pattern]||e.struck||!visibleAt(e.x,e.y))continue;ctx.save();ctx.strokeStyle='#ffce8c';ctx.fillStyle='#c7833028';ctx.lineWidth=2;if(a.pattern==='hornRush'){finalPolygon(a,[[0,-a.radius],[a.length,-a.radius],[a.length,a.radius],[0,a.radius]]);groundRing(a.center.x,a.center.y,a.radius,'#ffce8c',1);groundRing(a.target.x,a.target.y,a.radius,'#ffce8c',1)}else{let s=project(a.center.x,a.center.y);ctx.beginPath();ctx.ellipse(s.x,s.y,a.radius*ISOX*Math.SQRT2,a.radius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill();ctx.stroke()}ctx.restore()}};

