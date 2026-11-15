// Rock-armored mammal: fixed frontal slam, then an outer shock ring and recovery.
function beginRockBeastSlam(e){let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern:'rockBeastSlam',bespoke:true,center:{x:e.x,y:e.y},angle,windup:1.3,second:2.05,radius:200,halfAngle:.8,inner:130,outer:280,impacts:[false,false]};}
function rockBeastContains(a,point,ring=false){let dx=point.x-a.center.x,dy=point.y-a.center.y,d=Math.hypot(dx,dy);if(ring)return d>=a.inner&&d<=a.outer;let diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-a.angle),Math.cos(Math.atan2(dy,dx)-a.angle));return d<=a.radius&&Math.abs(diff)<=a.halfAngle;}
function rockBeastDamageFactor(e){let a=e.attack;return e.species!=='r1e4'||a?.pattern!=='rockBeastSlam'?1:e.elapsed<a.windup?.45:a.impacts?.[1]?1.5:1;}
const rockBeastHitBase=hit;hit=(e,d)=>rockBeastHitBase(e,d*rockBeastDamageFactor(e));
const rockBeastAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1e4')return rockBeastAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=220&&lineClear(e,p))beginRockBeastSlam(e);
 let a=e.attack;if(a?.pattern!=='rockBeastSlam')return rockBeastAnimateBase(e,dt);
 e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 for(let i=0;i<2;i++)if(e.elapsed>=(i?a.second:a.windup)&&!a.impacts[i]){a.impacts[i]=true;if(rockBeastContains(a,p,!!i)&&lineClear(a.center,p))hurt(i?35:55);if(typeof playSound==='function')playSound('impact',e.x,e.y);}
 e.struck=a.impacts[1];if(e.elapsed>=a.second+1.6){e.state='idle';e.attack=null;e.t=.9;}
};
const rockBeastSheet=new Image();rockBeastSheet.assetSrc='assets/cave-rock-beast-anim.png';
const rockBeastDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1e4')return rockBeastDrawBase(e,size);let s=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(a?.pattern==='rockBeastSlam')frame={row:2,col:e.elapsed<a.windup*.5?0:e.elapsed<a.windup?1:e.elapsed<(a.second||2.05)?2:3};
 ctx.save();ctx.translate(s.x,s.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,43,15,0,0,Math.PI*2);ctx.fill();
 if(rockBeastSheet.complete&&rockBeastSheet.naturalWidth){let sw=rockBeastSheet.naturalWidth/4,sh=rockBeastSheet.naturalHeight/3,w=180,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,rockBeastSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.77,w,h);else ctx.drawImage(rockBeastSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.77,w,h);}ctx.restore();return true;
};
function drawRockBeastArea(a,ring){let points=[];if(ring){for(let i=0;i<=48;i++){let t=i*Math.PI/24;points.push([Math.cos(t)*a.outer,Math.sin(t)*a.outer]);}for(let i=48;i>=0;i--){let t=i*Math.PI/24;points.push([Math.cos(t)*a.inner,Math.sin(t)*a.inner]);}}else{points.push([0,0]);for(let i=0;i<=24;i++){let t=-a.halfAngle+i*a.halfAngle/12;points.push([Math.cos(t)*a.radius,Math.sin(t)*a.radius]);}}finalPolygon(a,points);}
const rockBeastGroundBase=drawGroundEffects;drawGroundEffects=()=>{rockBeastGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r1e4'):enemies)){let a=e.attack;if(e.species!=='r1e4'||e.hp<=0||a?.pattern!=='rockBeastSlam'||!visibleAt(e.x,e.y))continue;ctx.save();ctx.lineWidth=2;
 for(let i=0;i<2;i++){let until=(i?a.second:a.windup)-e.elapsed;if(until<-.25)continue;ctx.fillStyle=until<=0?'#ffde9870':i?'#c48e4018':'#efb66130';ctx.strokeStyle=until<=0?'#fff0ca':i?'#a98753':'#ffce88';drawRockBeastArea(a,!!i);}ctx.restore();}};
const rockBeastEffectsBase=drawEffects;drawEffects=()=>{rockBeastEffectsBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r1e4'):enemies)){let a=e.attack;if(e.species!=='r1e4'||e.hp<=0||a?.pattern!=='rockBeastSlam'||!visibleAt(e.x,e.y))continue;
 let age=e.elapsed-a.second;if(age>=0&&age<.5){ctx.save();ctx.globalAlpha=1-age/.5;for(let j=0;j<14;j++){let t=j*Math.PI/7,r=a.inner+(a.outer-a.inner)*age/.5,pos=project(a.center.x+Math.cos(t)*r,a.center.y+Math.sin(t)*r),h=8+Math.sin(age/.5*Math.PI)*20;ctx.fillStyle=j%2?'#8a8475':'#b3a280';ctx.beginPath();ctx.moveTo(pos.x-5,pos.y);ctx.lineTo(pos.x-3,pos.y-h);ctx.lineTo(pos.x+6,pos.y-h*.6);ctx.lineTo(pos.x+5,pos.y);ctx.closePath();ctx.fill();}ctx.restore();}
 if(e.elapsed<a.windup||a.impacts[1]){let pos=project(e.x,e.y);ctx.save();ctx.strokeStyle=a.impacts[1]?'#ffbd66':'#9bc4d0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pos.x-7,pos.y-108);ctx.lineTo(pos.x+7,pos.y-108);ctx.lineTo(pos.x+6,pos.y-99);ctx.lineTo(pos.x,pos.y-94);ctx.lineTo(pos.x-6,pos.y-99);ctx.closePath();ctx.stroke();if(a.impacts[1]){ctx.beginPath();ctx.moveTo(pos.x+2,pos.y-110);ctx.lineTo(pos.x-2,pos.y-103);ctx.lineTo(pos.x+2,pos.y-102);ctx.lineTo(pos.x-3,pos.y-94);ctx.stroke();}ctx.restore();}
}};

