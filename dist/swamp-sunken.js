const sunkenSheet=new Image();sunkenSheet.assetSrc='assets/swamp-sunken-anim.png';
function beginSunkenAttack(e){let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern:'sunkenHook',bespoke:true,angle,windup:.85,thrust:false,sweep:false};}
function sunkenContains(e,point,sweep=false){let angle=e.attack.angle,dx=point.x-e.x,dy=point.y-e.y,forward=dx*Math.cos(angle)+dy*Math.sin(angle),side=-dx*Math.sin(angle)+dy*Math.cos(angle);return sweep?Math.hypot(dx,dy)<=130&&forward>=-1e-8:forward>=0&&forward<=200&&Math.abs(side)<=24;}
const sunkenAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3e2')return sunkenAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='sunkenHook'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(distance<=160&&clear&&e.t<=0)beginSunkenAttack(e);
  else{e.state='idle';if(distance>750&&!e.aware)return;
   if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,95*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,15)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 e.elapsed=Math.round((e.elapsed+dt)*1000000)/1000000;let a=e.attack;
 for(let [key,time,amount,sweep]of [['thrust',.85,42,false],['sweep',1.65,36,true]])if(!a[key]&&e.elapsed>=time){a[key]=true;if(sunkenContains(e,p,sweep)&&lineClear(e,p))hurt(amount);playSound('slash',e.x,e.y);}
 if(e.elapsed>=2.5){e.attack=null;e.state='idle';e.struck=true;e.t=1.4;}
};
// Align the feet, not the spear's bounding box, to the ground position in each cell.
const SUNKEN_ANCHOR_X=[[.38,.41,.47,.41],[.40,.38,.40,.36],[.37,.35,.40,.42]];
const sunkenDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r3e2')return sunkenDrawBase(e,size);let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim);
 if(e.hp>0&&e.attack?.pattern==='sunkenHook')frame={row:2,col:e.elapsed<.85?0:e.elapsed<1.2?1:e.elapsed<1.95?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,25,9,0,0,Math.PI*2);ctx.fill();
 if(sunkenSheet.complete&&sunkenSheet.naturalWidth){let sw=sunkenSheet.naturalWidth/4,sh=sunkenSheet.naturalHeight/3,w=132,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,sunkenSheet,frame.col*sw,frame.row*sh,sw,sh,-w*SUNKEN_ANCHOR_X[frame.row][frame.col],-h*.9,w,h);else ctx.drawImage(sunkenSheet,frame.col*sw,frame.row*sh,sw,sh,-w*SUNKEN_ANCHOR_X[frame.row][frame.col],-h*.9,w,h);}ctx.restore();return true;
};
const sunkenSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3e2'?108:sunkenSizeBase(e);
function sunkenWarningPoints(e){let a=e.attack,points=[];
 if(!a.thrust){for(let [forward,side]of [[0,-24],[200,-24],[200,24],[0,24]])points.push({x:e.x+Math.cos(a.angle)*forward-Math.sin(a.angle)*side,y:e.y+Math.sin(a.angle)*forward+Math.cos(a.angle)*side});}
 else{points.push({x:e.x,y:e.y});for(let i=0;i<=20;i++){let angle=a.angle-Math.PI/2+i*Math.PI/20;points.push({x:e.x+Math.cos(angle)*130,y:e.y+Math.sin(angle)*130});}}
 return points.map(point=>{let length=dist(e,point),last={x:e.x,y:e.y};for(let d=8;d<length+8;d+=8){let t=Math.min(1,d/length),q={x:e.x+(point.x-e.x)*t,y:e.y+(point.y-e.y)*t};if(!lineClear(e,q))break;last=q;}return last;});
}
const sunkenGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 sunkenGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r3e2'):enemies)){let a=e.attack;if(e.species!=='r3e2'||e.hp<=0||a?.pattern!=='sunkenHook'||a.sweep||!visibleAt(e.x,e.y))continue;
  ctx.save();ctx.beginPath();sunkenWarningPoints(e).forEach((point,i)=>{let q=project(point.x,point.y);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});ctx.closePath();ctx.fillStyle=a.thrust?'#d6d69b33':'#c5e6cd33';ctx.strokeStyle=a.thrust?'#f0e2a5':'#d4f2de';ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore();
 }
};
