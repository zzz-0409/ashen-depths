// The owl commits two perpendicular feather lanes to the player's initial position.
function beginOwlCross(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x);
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'owlCross',bespoke:true,windup:1,origin:{x:e.x,y:e.y},target:{x:p.x,y:p.y},lanes:[{angle,at:1,fired:false},{angle:angle+Math.PI/2,at:1.55,fired:false}]};
}
function owlLaneContains(center,angle,point){let dx=point.x-center.x,dy=point.y-center.y;return Math.abs(dx*Math.cos(angle)+dy*Math.sin(angle))<=170+1e-8&&Math.abs(-dx*Math.sin(angle)+dy*Math.cos(angle))<=26+1e-8;}
const owlAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2e7')return owlAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='owlCross'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),clear=lineClear(e,p);
  if(d<=420&&clear&&e.t<=0)beginOwlCross(e);
  else{if(d>750&&!e.aware){e.state='idle';return;}if(d<=300&&clear){e.state='idle';return;}
   if(e.nav<=0){e.nav=.7;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,85*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,12)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 let a=e.attack;e.elapsed+=dt;
 for(let lane of a.lanes)if(!lane.fired&&e.elapsed>=lane.at){lane.fired=true;if(owlLaneContains(a.target,lane.angle,p)&&lineClear(a.origin,p)&&lineClear(a.target,p))hurt(46);burst(a.target.x,a.target.y,45,'#b2e8db');playSound('wind',e.x,e.y);}
 e.struck=a.lanes.every(l=>l.fired);if(e.elapsed>=2.5){e.attack=null;e.state='idle';e.t=1.6;}
};
function owlLanePolygon(a,lane){
 let points=[];for(let [along,side]of [[-170,-26],[170,-26],[170,26],[-170,26]]){
  let dx=Math.cos(lane.angle)*along-Math.sin(lane.angle)*side,dy=Math.sin(lane.angle)*along+Math.cos(lane.angle)*side,len=Math.hypot(dx,dy),point={...a.target};
  for(let i=0;i<=Math.ceil(len/4);i++){let d=Math.min(len,i*4),q={x:a.target.x+dx*d/len,y:a.target.y+dy*d/len};if(!lineClear(a.target,q))break;point=q;}points.push(point);
 }return points;
}
const owlGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 owlGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r2e7'):enemies)){let a=e.attack;if(e.species!=='r2e7'||e.hp<=0||a?.pattern!=='owlCross'||!visibleAt(e.x,e.y))continue;
  ctx.save();for(let [i,lane]of a.lanes.entries()){if(lane.fired&&e.elapsed>lane.at+.2)continue;let points=owlLanePolygon(a,lane).map(v=>project(v.x,v.y));ctx.beginPath();points.forEach((v,n)=>n?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.fillStyle=lane.fired?'#ddfff088':i?'#99d7f51c':'#bce8c633';ctx.strokeStyle=i?'#91c9ee':'#d0efbc';ctx.lineWidth=lane.fired?3:1.5;ctx.setLineDash(i&&!lane.fired?[6,5]:[]);ctx.fill();ctx.stroke();}ctx.restore();
 }
};
const owlSheet=new Image();owlSheet.assetSrc='assets/forest-owl-anim.png';
function owlSpriteFrame(e){
 if(e.hp<=0)return {row:0,col:0};
 if(e.attack?.pattern==='owlCross')return {row:2,col:e.elapsed<.45?0:e.elapsed<1?1:e.elapsed<1.75?2:3};
 return {row:e.state==='walk'?1:0,col:Math.floor((e.anim||0)*(e.state==='walk'?8:4))%4};
}
const owlDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2e7')return owlDrawBase(e,size);
 let pos=project(e.x,e.y),alive=e.hp>0,frame=owlSpriteFrame(e),lift=alive?14+Math.sin((e.anim||0)*3)*4:0;
 ctx.save();ctx.translate(pos.x,pos.y);ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,0,28,9,0,0,Math.PI*2);ctx.fill();ctx.scale(e.facing||1,1);
 if(owlSheet.complete&&owlSheet.naturalWidth){let sw=owlSheet.naturalWidth/4,sh=owlSheet.naturalHeight/3,w=150,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,owlSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.84-lift,w,h);else ctx.drawImage(owlSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.84-lift,w,h);}
 ctx.restore();return true;
};
const owlSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2e7'?150:owlSizeBase(e);
