// One directional sonar wave travels through three warned distance bands.
function beginBatSonar(e){let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern:'batSonar',bespoke:true,center:{x:e.x,y:e.y},target:{x:p.x,y:p.y},angle,windup:1.05,inner:20,width:110,halfAngle:.48,impacts:[false,false,false],hit:false};}
function batSonarContains(a,point,index){let dx=point.x-a.center.x,dy=point.y-a.center.y,d=Math.hypot(dx,dy),offset=Math.atan2(Math.sin(Math.atan2(dy,dx)-a.angle),Math.cos(Math.atan2(dy,dx)-a.angle)),inner=a.inner+a.width*index;return d>=inner&&d<inner+a.width&&Math.abs(offset)<=a.halfAngle;}
const batAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1e0')return batAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=340&&lineClear(e,p))beginBatSonar(e);
 let a=e.attack;if(a?.pattern!=='batSonar')return batAnimateBase(e,dt);e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 for(let i=0;i<3;i++)if(e.elapsed>=a.windup+i*.32&&!a.impacts[i]){a.impacts[i]=true;if(!a.hit&&batSonarContains(a,p,i)&&lineClear(a.center,p)){a.hit=true;hurt(34);}if(i===0&&typeof playSound==='function')playSound('screech',e.x,e.y);}
 e.struck=a.impacts[2];if(e.elapsed>=a.windup+.64+.9){e.attack=null;e.state='idle';e.t=1.15;}
};
const batSheet=new Image();batSheet.assetSrc='assets/cave-bat-anim.png';
const batDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1e0')return batDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim),lift=e.hp>0?10+Math.sin(e.anim*11)*3:0;
 if(a?.pattern==='batSonar')frame={row:2,col:e.elapsed<a.windup?0:e.elapsed<a.windup+.32?1:e.elapsed<a.windup+.8?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,20,6,0,0,Math.PI*2);ctx.fill();if(batSheet.complete&&batSheet.naturalWidth){let sw=batSheet.naturalWidth/4,sh=batSheet.naturalHeight/3,w=140,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,batSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.87-lift,w,h);else ctx.drawImage(batSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.87-lift,w,h);}ctx.restore();return true;
};
function drawBatBand(a,index){let inner=a.inner+a.width*index,outer=inner+a.width,points=[];for(let j=0;j<=20;j++){let angle=-a.halfAngle+a.halfAngle*2*j/20;points.push([Math.cos(angle)*outer,Math.sin(angle)*outer]);}for(let j=20;j>=0;j--){let angle=-a.halfAngle+a.halfAngle*2*j/20;points.push([Math.cos(angle)*inner,Math.sin(angle)*inner]);}finalPolygon(a,points);}
const batGroundBase=drawGroundEffects;drawGroundEffects=()=>{batGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r1e0'):enemies)){let a=e.attack;if(e.species!=='r1e0'||e.hp<=0||a?.pattern!=='batSonar'||!visibleAt(e.x,e.y))continue;ctx.save();for(let i=0;i<3;i++){let until=a.windup+i*.32-e.elapsed;if(until<-.2)continue;ctx.fillStyle=until<=0?'#d9bfff66':'#a878c41e';ctx.strokeStyle=until<=0?'#f4e8ff':'#c3a2e3';ctx.lineWidth=until<=0?3:1;drawBatBand(a,i);}ctx.restore();}};

