function turtleDamageFactor(e){return e.species!=='r0e4'?1:e.shellGuard>0?.3:e.attack?.pattern==='turtleSnap'&&e.struck?1.5:1}
const turtleHitBase=hit;hit=(e,damage)=>turtleHitBase(e,damage*turtleDamageFactor(e));
const turtleSpawnBase=spawnSpecies;spawnSpecies=(spec,x,y)=>{let e=turtleSpawnBase(spec,x,y);if(e&&spec.id==='r0e4')e.shellGuard=2;return e};
function beginTurtleSnap(e){let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'turtleSnap',bespoke:true,windup:1,radius:70,target:{x:e.x+Math.cos(angle)*80,y:e.y+Math.sin(angle)*80}};e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1}
const turtleAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0e4')return turtleAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.shellGuard>0){e.shellGuard=Math.max(0,e.shellGuard-dt);e.state='idle';e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);return}
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<145&&lineClear(e,p))beginTurtleSnap(e);
 let a=e.attack;if(a?.pattern!=='turtleSnap')return turtleAnimateBase(e,dt);
 e.anim+=dt;e.elapsed+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.elapsed>=a.windup&&!e.struck){e.struck=true;if(dist(a.target,p)<=a.radius&&lineClear(e,p))hurt(36);burst(a.target.x,a.target.y,a.radius,'#bdb47c')}
 if(e.elapsed>=2.5){e.state='idle';e.attack=null;e.t=0;e.shellGuard=2}
};
const turtleSheet=new Image();turtleSheet.assetSrc='assets/moss-turtle-anim.png';
const turtleDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0e4')return turtleDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame={row:e.shellGuard>0?0:1,col:Math.floor(e.anim*3)%4};
 if(a?.pattern==='turtleSnap')frame={row:2,col:e.elapsed<1?0:e.elapsed<1.2?1:e.elapsed<2.2?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,34,12,0,0,Math.PI*2);ctx.fill();
 if(turtleSheet.complete&&turtleSheet.naturalWidth){let sw=turtleSheet.naturalWidth/4,sh=turtleSheet.naturalHeight/3,w=118,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,turtleSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.83,w,h);else ctx.drawImage(turtleSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.83,w,h)}ctx.restore();return true;
};
function drawTurtleEffects(ground){for(let e of enemies){if(e.species!=='r0e4'||e.hp<=0||!visibleAt(e.x,e.y))continue;let a=e.attack;if(ground&&a?.pattern==='turtleSnap'&&!e.struck)groundRing(a.target.x,a.target.y,a.radius,'#f2c487',2);if(!ground&&e.shellGuard>0){let s=project(e.x,e.y);ctx.save();ctx.strokeStyle='#a6d8d2';ctx.fillStyle='#4b8a8444';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s.x-8,s.y-108);ctx.lineTo(s.x+8,s.y-108);ctx.lineTo(s.x+7,s.y-98);ctx.lineTo(s.x,s.y-91);ctx.lineTo(s.x-7,s.y-98);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}else if(ground&&a?.pattern==='turtleSnap'&&e.struck)groundRing(e.x,e.y,42,'#f3c980',2)}};

const turtleGroundBase=drawGroundEffects;drawGroundEffects=()=>{turtleGroundBase();drawTurtleEffects(true)};
const turtleAirBase=drawEffects;drawEffects=()=>{turtleAirBase();drawTurtleEffects(false)};

