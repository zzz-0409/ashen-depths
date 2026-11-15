// Grass fang wolf: committed crouch, visible leap, then a punishable landing.
function beginWolfPounce(e){
 let length=Math.min(220,dist(e,p)),angle=Math.atan2(p.y-e.y,p.x-e.x);
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'wolfPounce',bespoke:true,windup:.9,travel:.32,recovery:.75,radius:55,origin:{x:e.x,y:e.y},target:{x:e.x+Math.cos(angle)*length,y:e.y+Math.sin(angle)*length}};
}
const wolfAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0e0'||e.hp<=0)return wolfAnimateBase(e,dt);
 if(!(e.reactionStun>0)&&e.state!=='attack'&&e.t<=dt&&dist(e,p)<=230&&lineClear(e,p))beginWolfPounce(e);
 let a=e.attack;if(a?.pattern!=='wolfPounce')return wolfAnimateBase(e,dt);
 if(e.reactionStun>0)return;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 let previous=e.elapsed;e.elapsed+=dt;
 let oldProgress=clamp((previous-a.windup)/a.travel,0,1),progress=clamp((e.elapsed-a.windup)/a.travel,0,1);
 if(progress>oldProgress){let dx=(a.target.x-a.origin.x)*(progress-oldProgress),dy=(a.target.y-a.origin.y)*(progress-oldProgress),steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));for(let i=0;i<steps;i++)moveActor(e,dx/steps,dy/steps,12)}
 if(e.elapsed>=a.windup+a.travel&&!e.struck){e.struck=true;if(dist(e,p)<=a.radius&&lineClear(e,p))hurt(28);burst(e.x,e.y,a.radius,'#cbb67d')}
 if(e.elapsed>=a.windup+a.travel+a.recovery){e.state='idle';e.t=1.2;e.attack=null}
};
const wolfSheet=new Image();wolfSheet.assetSrc='assets/grass-wolf-anim.png';
const wolfDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0e0')return wolfDrawBase(e,size);let s=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim),lift=0;
 if(a?.pattern==='wolfPounce'){let t=e.elapsed-a.windup;frame={row:2,col:t<0?0:t<a.travel*.4?1:t<a.travel?2:3};lift=t>0&&t<a.travel?Math.sin(t/a.travel*Math.PI)*24:0}
 ctx.save();ctx.translate(s.x,s.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,30,10,0,0,Math.PI*2);ctx.fill();
 if(wolfSheet.complete&&wolfSheet.naturalWidth){let sw=wolfSheet.naturalWidth/4,sh=wolfSheet.naturalHeight/3,w=112,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,wolfSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86-lift,w,h);else ctx.drawImage(wolfSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86-lift,w,h)}ctx.restore();return true;
};
const wolfEffectsBase=drawGroundEffects;drawGroundEffects=()=>{wolfEffectsBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r0e0'):enemies)){let a=e.attack;if(e.species!=='r0e0'||e.hp<=0||a?.pattern!=='wolfPounce'||e.struck||!visibleAt(e.x,e.y))continue;let from=project(a.origin.x,a.origin.y),to=project(a.target.x,a.target.y);ctx.save();ctx.strokeStyle='#ffd49b';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();ctx.setLineDash([]);groundRing(a.target.x,a.target.y,a.radius,'#ffd49b',2);ctx.restore()}};

