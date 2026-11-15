const swampArcherSheet=new Image();swampArcherSheet.assetSrc='assets/swamp-archer-anim.png';
let marshPoisonPools=[];
function beginMarshArcher(e){let target={x:p.x,y:p.y};e.state='attack';e.elapsed=0;e.struck=false;e.facing=target.x-e.x-(target.y-e.y)<0?-1:1;e.attack={pattern:'marshVolley',bespoke:true,windup:.9,target,origin:{x:e.x,y:e.y},fired:false};}
function stepMarshPoison(pool,dt){
 pool.age=Math.round((pool.age+dt)*1e6)/1e6;
 if(!pool.hit&&pool.age>=.35){pool.hit=true;if(dist(pool.target,p)<=75&&lineClear(pool.target,p))hurt(44);playSound('poison',pool.target.x,pool.target.y);}
 while(pool.next<=2.35+1e-8&&pool.age+1e-8>=pool.next){pool.next=Math.round((pool.next+.5)*1e6)/1e6;if(dist(pool.target,p)<=75&&lineClear(pool.target,p))hurt(12);}
 return pool.age<2.35;
}
function advanceMarshPoison(dt,skipFresh=false){if(!started||paused||dead||!Number.isFinite(dt)||dt<=0)return;marshPoisonPools=marshPoisonPools.filter(pool=>pool.owner===p&&(skipFresh&&pool.spawnClock===clock||stepMarshPoison(pool,dt)));}
const marshArcherAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3e3')return marshArcherAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='marshVolley'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(e.t<=0&&distance<=420&&clear)beginMarshArcher(e);
  else{e.state='idle';if(distance>750&&!e.aware||distance<=320&&clear)return;
   if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,100*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,14)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 e.elapsed=Math.round((e.elapsed+dt)*1e6)/1e6;let a=e.attack;
 if(!a.fired&&e.elapsed>=.9){a.fired=true;e.struck=true;if(lineClear(a.origin,a.target)){let pool={owner:p,origin:a.origin,target:a.target,age:0,hit:false,next:.85,spawnClock:clock};if(stepMarshPoison(pool,e.elapsed-.9))marshPoisonPools.push(pool);}playSound('arrow',e.x,e.y);}
 if(e.elapsed>=1.6){e.attack=null;e.state='idle';e.t=2.2;}
};
const marshArcherUpdateBase=update;update=dt=>{let active=started&&!paused&&!dead;marshArcherUpdateBase(dt);if(active)advanceMarshPoison(dt,true);};
const marshArcherLoadBase=loadWorld;loadWorld=(...args)=>{marshPoisonPools=[];return marshArcherLoadBase(...args);};
const marshArcherDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r3e3'||!swampArcherSheet.complete||!swampArcherSheet.naturalWidth)return marshArcherDrawBase(e,size);
 let frame=spriteFrame(e.state,e.anim);if(e.hp>0&&e.attack?.pattern==='marshVolley')frame={row:2,col:e.elapsed<.35?0:e.elapsed<.9?1:e.elapsed<1.15?2:3};
 let s=project(e.x,e.y),sw=swampArcherSheet.naturalWidth/4,sh=swampArcherSheet.naturalHeight/3,w=110,h=w*sh/sw;
 ctx.save();ctx.translate(s.x,s.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,swampArcherSheet,frame.col*sw,frame.row*sh,sw,sh,-w*.5,-h*.97,w,h);else ctx.drawImage(swampArcherSheet,frame.col*sw,frame.row*sh,sw,sh,-w*.5,-h*.97,w,h);ctx.restore();return true;
};
const marshArcherSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3e3'?100:marshArcherSizeBase(e);
function drawMarshWarning(target,progress,poison=false){
 ctx.save();let pos=project(target.x,target.y);ctx.beginPath();ctx.ellipse(pos.x,pos.y,75*ISOX*1.42,75*ISOY*1.42,0,0,Math.PI*2);ctx.fillStyle=poison?'#78ac4538':'#ffe19315';ctx.fill();
 groundRing(target.x,target.y,75,poison?'#a9ce65':'#ffe193',2);groundRing(target.x,target.y,75*Math.max(.1,progress),poison?'#80bd57':'#ffe193',1);
 if(poison){for(let i=0;i<3;i++){let angle=i*Math.PI*2/3+progress*2;groundRing(target.x+Math.cos(angle)*28,target.y+Math.sin(angle)*28,18,'#97c56d',2);}}ctx.restore();
}
const marshArcherGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 marshArcherGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r3e3'):enemies)){let a=e.attack;if(e.hp>0&&e.species==='r3e3'&&a?.pattern==='marshVolley'&&!a.fired&&visibleAt(a.target.x,a.target.y))drawMarshWarning(a.target,e.elapsed/1.25);}
 for(let pool of marshPoisonPools)if(pool.owner===p&&visibleAt(pool.target.x,pool.target.y))drawMarshWarning(pool.target,pool.age<.35?(.9+pool.age)/1.25:1-pool.age/2.35,pool.age>=.35);
};
const marshArcherEffectsBase=drawEffects;drawEffects=()=>{
 marshArcherEffectsBase();ctx.save();ctx.strokeStyle='#ceef8a';ctx.lineWidth=3;
 for(let pool of marshPoisonPools){if(pool.owner!==p||pool.age>=.35||!visibleAt(pool.target.x,pool.target.y))continue;let t=pool.age/.35,q=project(pool.origin.x+(pool.target.x-pool.origin.x)*t,pool.origin.y+(pool.target.y-pool.origin.y)*t);q.y-=Math.sin(t*Math.PI)*90+20*(1-t);ctx.beginPath();ctx.moveTo(q.x-8,q.y-16);ctx.lineTo(q.x,q.y);ctx.stroke();}ctx.restore();
};
