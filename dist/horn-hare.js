// A bounded back-hop followed by a committed, narrow horn lunge.
function beginHareLunge(e){let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'hareLunge',bespoke:true,angle,retreat:dist(e,p)<160?80:0,windup:1.15,travel:.3,radius:30};}
function moveHareStraight(e,dx,dy,damage){let steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));for(let i=0;i<steps;i++){let before={x:e.x,y:e.y};moveActor(e,dx/steps,dy/steps,12);if(Math.hypot(e.x-before.x-dx/steps,e.y-before.y-dy/steps)>.1){e.x=before.x;e.y=before.y;return false}if(damage&&!e.struck&&dist(e,p)<=30&&lineClear(e,p)){e.struck=true;hurt(32);if(typeof playSound==='function')playSound('slash',e.x,e.y)}}return true;}
const hareAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0e1')return hareAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=300&&lineClear(e,p))beginHareLunge(e);
 let a=e.attack;if(a?.pattern!=='hareLunge')return hareAnimateBase(e,dt);
 let previous=e.elapsed;e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 let back=clamp(e.elapsed/.35,0,1)-clamp(previous/.35,0,1);
 if(back>0&&!a.retreatBlocked)a.retreatBlocked=!moveHareStraight(e,-Math.cos(a.angle)*a.retreat*back,-Math.sin(a.angle)*a.retreat*back,false);
 if(e.elapsed>=.35&&!a.origin){a.origin={x:e.x,y:e.y};a.angle=Math.atan2(p.y-e.y,p.x-e.x);let length=Math.min(330,dist(e,p)+45);a.target={x:e.x+Math.cos(a.angle)*length,y:e.y+Math.sin(a.angle)*length};e.facing=Math.cos(a.angle)-Math.sin(a.angle)<0?-1:1;}
 let progress=clamp((e.elapsed-a.windup)/a.travel,0,1)-clamp((previous-a.windup)/a.travel,0,1);
 if(progress>0&&!a.blocked)a.blocked=!moveHareStraight(e,(a.target.x-a.origin.x)*progress,(a.target.y-a.origin.y)*progress,true);
 if(e.elapsed>=2.35){e.attack=null;e.state='idle';e.t=1.1;}
};
const hareSheet=new Image();hareSheet.assetSrc='assets/horn-hare-anim.png';
const hareDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0e1')return hareDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim),lift=0;
 if(a?.pattern==='hareLunge'){frame=e.elapsed<.35?{row:1,col:Math.floor(e.elapsed/.35*4)%4}:{row:2,col:e.elapsed<.7?0:e.elapsed<1.15?1:e.elapsed<1.45?2:3};if(e.elapsed<.35)lift=Math.sin(e.elapsed/.35*Math.PI)*18;}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,21,7,0,0,Math.PI*2);ctx.fill();
 if(hareSheet.complete&&hareSheet.naturalWidth){let sw=hareSheet.naturalWidth/4,sh=hareSheet.naturalHeight/3,w=100,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,hareSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.94-lift,w,h);else ctx.drawImage(hareSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.94-lift,w,h)}ctx.restore();return true;
};
const hareEffectsBase=drawGroundEffects;drawGroundEffects=()=>{hareEffectsBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r0e1'):enemies)){let a=e.attack;if(e.species!=='r0e1'||e.hp<=0||a?.pattern!=='hareLunge'||!a.origin||e.elapsed>=a.windup+a.travel||!visibleAt(e.x,e.y))continue;ctx.save();ctx.strokeStyle='#f5d69f';ctx.fillStyle='#d6a55022';ctx.lineWidth=2;let length=dist(a.origin,a.target);finalPolygon({center:a.origin,angle:a.angle},[[0,a.radius],[length,a.radius],[length,-a.radius],[0,-a.radius]]);ctx.restore()}};


