const crocSheet=new Image();crocSheet.assetSrc='assets/swamp-croc-anim.png';
function beginCrocAttack(e){let angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern:'crocJawTail',bespoke:true,angle,windup:.85,bite:false,tail:false};}
function crocConeContains(e,point,tail=false){let a=e.attack,dx=point.x-e.x,dy=point.y-e.y,radius=tail?145:120,angle=a.angle+(tail?Math.PI:0),half=tail?Math.PI/2:Math.PI/4;return Math.hypot(dx,dy)<=radius&&Math.cos(Math.atan2(dy,dx)-angle)>=Math.cos(half)-1e-8;}
const crocAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3e0')return crocAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='crocJawTail'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(distance<=110&&clear&&e.t<=0)beginCrocAttack(e);
  else{
   if(distance>750&&!e.aware){e.state='idle';return;}
   if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,108*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,19)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 e.elapsed+=dt;let a=e.attack;
 for(let [key,time,damage,tail]of [['bite',.85,52,false],['tail',1.75,44,true]])if(!a[key]&&e.elapsed>=time){a[key]=true;if(crocConeContains(e,p,tail)&&lineClear(e,p))hurt(damage);playSound('slash',e.x,e.y);}
 if(e.elapsed>=2.5){e.attack=null;e.state='idle';e.struck=true;e.t=1.4;}
};
const crocDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r3e0')return crocDrawBase(e,size);
 let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim);
 if(e.hp>0&&e.attack?.pattern==='crocJawTail'){let t=e.elapsed;frame={row:2,col:t<.85?0:t<1.1?1:t<2?2:3};}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,48,15,0,0,Math.PI*2);ctx.fill();
 if(crocSheet.complete&&crocSheet.naturalWidth){let sw=crocSheet.naturalWidth/4,sh=crocSheet.naturalHeight/3,w=180,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,crocSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*(frame.row===2?.78:.75),w,h);else ctx.drawImage(crocSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*(frame.row===2?.78:.75),w,h);}
 ctx.restore();return true;
};
const crocSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3e0'?110:crocSizeBase(e);
// Picking follows the wide body rather than the shorter HP-bar anchor height.
// Keep this separate from the ground-space combat hit radius.
const crocPickBase=enemyScreenContains;enemyScreenContains=(e,x,y)=>{
 if(e.species!=='r3e0')return crocPickBase(e,x,y);
 if(e.hp<=0)return false;
 let pos=project(e.x,e.y),localX=(x-pos.x)*(e.facing||1),localY=y-pos.y,windup=e.attack?.pattern==='crocJawTail'&&e.elapsed<.85;
 return [[-12,-27,54,28],[63,windup?-41:-30,28,windup?28:18],[-65,-40,24,17]].some(([cx,cy,rx,ry])=>((localX-cx)/rx)**2+((localY-cy)/ry)**2<=1);
};
const crocGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 crocGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r3e0'):enemies)){let a=e.attack;if(e.species!=='r3e0'||e.hp<=0||a?.pattern!=='crocJawTail'||!visibleAt(e.x,e.y)||a.tail)continue;
  let tail=a.bite,radius=tail?145:120,angle=a.angle+(tail?Math.PI:0),half=tail?Math.PI/2:Math.PI/4,origin=project(e.x,e.y);
  ctx.save();ctx.beginPath();ctx.moveTo(origin.x,origin.y);
  for(let i=0;i<=24;i++){let theta=angle-half+half*2*i/24,last={x:e.x,y:e.y};for(let j=1;j<=Math.ceil(radius/4);j++){let d=Math.min(radius,j*4),q={x:e.x+Math.cos(theta)*d,y:e.y+Math.sin(theta)*d};if(!lineClear(e,q))break;last=q;}let pos=project(last.x,last.y);ctx.lineTo(pos.x,pos.y);}
  ctx.closePath();ctx.fillStyle=tail?'#f4c28433':'#e4ae7933';ctx.strokeStyle=tail?'#ffe1a0':'#ffb782';ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore();
 }
};

