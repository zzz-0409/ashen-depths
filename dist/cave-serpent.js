function beginSerpentAttack(e,venom){
 let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.serpentCycle=(e.serpentCycle||0)+1;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:venom?'serpentVenom':'serpentBite',bespoke:true,origin:{x:e.x,y:e.y},target:{x:p.x,y:p.y},angle,windup:venom?1.6:1.1,radius:95,ticks:0};
}
function serpentBiteContains(a,point){let dx=point.x-a.origin.x,dy=point.y-a.origin.y,angle=Math.atan2(dy,dx)-a.angle;return Math.hypot(dx,dy)<=165&&Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=.55;}
const serpentAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1e7')return serpentAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.state!=='attack'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),venom=(e.serpentCycle||0)%2===0,range=venom?350:150;
  if(e.t<=0&&distance<=range&&lineClear(e,p))beginSerpentAttack(e,venom);
  else{e.state='idle';if(distance<=range*.8&&lineClear(e,p)||(distance>750&&!e.aware))return;
   if(e.nav<=0){e.nav=.6;e.path=lineClear(e,p)?[{x:p.x,y:p.y}]:findPath(e,p);}let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,105*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,12)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 let a=e.attack;if(!a?.pattern?.startsWith('serpent'))return;e.elapsed+=dt;
 if(a.pattern==='serpentBite'){
  if(!e.struck&&e.elapsed>=a.windup){e.struck=true;if(serpentBiteContains(a,p)&&lineClear(a.origin,p))hurt(52);if(typeof playSound==='function')playSound('impact',e.x,e.y);}
 }else while(a.ticks<4&&e.elapsed>=a.windup+a.ticks*.65){a.ticks++;if(dist(a.target,p)<=a.radius&&lineClear(a.origin,a.target)&&lineClear(a.target,p))hurt(18);if(a.ticks===1&&typeof playSound==='function')playSound('vortex',a.target.x,a.target.y);e.struck=a.ticks===4;}
 if(e.elapsed>=(a.pattern==='serpentBite'?2.1:4.4)){e.attack=null;e.state='idle';e.t=.8;}
};
const serpentSheet=new Image();serpentSheet.assetSrc='assets/cave-serpent-anim.png';
const serpentDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1e7')return serpentDrawBase(e,size);let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim),a=e.attack;
 if(a?.pattern?.startsWith('serpent'))frame={row:2,col:e.elapsed<a.windup*.5?0:e.elapsed<a.windup?1:e.elapsed<a.windup+.3?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,35,12,0,0,Math.PI*2);ctx.fill();
 if(serpentSheet.complete&&serpentSheet.naturalWidth){let sw=serpentSheet.naturalWidth/4,sh=serpentSheet.naturalHeight/3,w=180,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,serpentSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);else ctx.drawImage(serpentSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);}ctx.restore();return true;
};
const serpentGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 serpentGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r1e7'):enemies)){let a=e.attack;if(e.species!=='r1e7'||e.hp<=0||!a?.pattern?.startsWith('serpent'))continue;ctx.save();
  if(a.pattern==='serpentVenom'&&visibleAt(a.target.x,a.target.y)){
   let active=e.elapsed>=a.windup,s=project(a.target.x,a.target.y);ctx.fillStyle=active?'#71bd5545':'#a3df7720';ctx.beginPath();ctx.ellipse(s.x,s.y,a.radius*ISOX*Math.SQRT2,a.radius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill();groundRing(a.target.x,a.target.y,a.radius,active?'#b8eb7c':'#d2ec9d',2);
   if(!active)groundRing(a.target.x,a.target.y,a.radius*clamp(e.elapsed/a.windup,0,1),'#b9e684',1);
  }else if(a.pattern==='serpentBite'&&!e.struck&&visibleAt(e.x,e.y)){
   ctx.fillStyle='#d7c06c30';ctx.strokeStyle='#f1d98d';ctx.lineWidth=2;let points=[[0,0]];for(let i=0;i<=16;i++){let angle=-.55+i*1.1/16;points.push([Math.cos(angle)*165,Math.sin(angle)*165]);}finalPolygon({center:a.origin,angle:a.angle},points);
  }ctx.restore();
 }
};
const serpentSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r1e7'?180:serpentSizeBase(e);
