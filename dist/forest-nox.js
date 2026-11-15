function noxAttackHint(e){return e.attack?.leapTarget?'黒王の跳躍 · 新しい着地円から離れる':'影牙の狩り · 時間差で横切る影の帯を避ける';}
function noxClippedTarget(from,target,radius=18){let length=dist(from,target),end={x:from.x,y:from.y},steps=Math.max(1,Math.ceil(length/8));for(let i=1;i<=steps;i++){let q={x:from.x+(target.x-from.x)*i/steps,y:from.y+(target.y-from.y)*i/steps};if(!passable(q.x,q.y,radius)||!lineClear(end,q))break;end=q;}return end;}
function beginNoxHunt(e){
 let phase=e.hp/e.max<.5?2:1,origin={x:e.x,y:e.y},target={x:p.x,y:p.y},angle=Math.atan2(p.y-e.y,p.x-e.x),shadows=[];
 for(let i=0;i<(phase===2?3:2);i++){let direction=i<2?angle+Math.PI/2+i*Math.PI:angle;let start={x:target.x-Math.cos(direction)*220,y:target.y-Math.sin(direction)*220},end={x:target.x+Math.cos(direction)*220,y:target.y+Math.sin(direction)*220};let blocked=!passable(start.x,start.y,18)||!lineClear(origin,start);shadows.push({start,end:blocked?start:noxClippedTarget(start,end),at:1.2+i*.75,hit:false,blocked});}
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern:'noxHunt',bespoke:true,phase,origin,target,angle,shadows,travel:.55,lockAt:shadows.at(-1).at+.55,windup:.9,leapTravel:.4,landed:false};
}
function noxShadowPoint(shadow,elapsed,travel){let t=clamp((elapsed-shadow.at)/travel,0,1);return{x:shadow.start.x+(shadow.end.x-shadow.start.x)*t,y:shadow.start.y+(shadow.end.y-shadow.start.y)*t};}
const noxAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2b2')return noxAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='noxHunt'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(distance<=400&&clear&&e.t<=0)beginNoxHunt(e);
  else{e.state='idle';if(distance>900||distance<150&&clear)return;if(e.nav<=0){e.nav=.45;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let q=e.path?.[0];if(q){let dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,120*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,22)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;}
 }
 let a=e.attack,previous=e.elapsed;e.elapsed+=dt;
 for(let shadow of a.shadows)if(!shadow.blocked&&!shadow.hit&&e.elapsed>=shadow.at&&previous<shadow.at+a.travel){let from=noxShadowPoint(shadow,previous,a.travel),to=noxShadowPoint(shadow,e.elapsed,a.travel);if(projectileContact(from,to,p,34)!==null&&lineClear(from,p)){shadow.hit=true;hurt(a.phase===2?90:70);playSound('slash',p.x,p.y);}}
 if(!a.leapTarget&&e.elapsed>=a.lockAt){a.leapOrigin={x:e.x,y:e.y};let distance=Math.min(400,dist(e,p)),angle=Math.atan2(p.y-e.y,p.x-e.x);a.leapTarget=noxClippedTarget(e,{x:e.x+Math.cos(angle)*distance,y:e.y+Math.sin(angle)*distance},22);e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;}
 let leapAt=a.lockAt+a.windup;
 if(a.leapTarget){let from=clamp((previous-leapAt)/a.leapTravel,0,1),to=clamp((e.elapsed-leapAt)/a.leapTravel,0,1);if(to>from&&!a.blocked){let dx=(a.leapTarget.x-a.leapOrigin.x)*(to-from),dy=(a.leapTarget.y-a.leapOrigin.y)*(to-from),steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));for(let i=0;i<steps;i++){let q={x:e.x+dx/steps,y:e.y+dy/steps};if(!passable(q.x,q.y,22)||!lineClear(e,q)){a.blocked=true;break;}e.x=q.x;e.y=q.y;}}
  if(!a.landed&&e.elapsed>=leapAt+a.leapTravel){a.landed=true;if(!a.blocked&&dist(e,p)<=95&&lineClear(e,p))hurt(a.phase===2?125:100);burst(e.x,e.y,95,'#9ca9ff');playSound('impact',e.x,e.y);}
 }
 e.struck=a.landed;if(e.elapsed>=leapAt+a.leapTravel+1.2){e.attack=null;e.state='idle';e.t=1.2;}
};
const noxSheet=new Image();noxSheet.assetSrc='assets/forest-nox-anim.png';
function paintNoxSprite(point,frame,facing,width,lift=0,opacity=1,flash=false){let pos=project(point.x,point.y);ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(facing||1,1);ctx.globalAlpha*=opacity;if(opacity===1){ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,0,52,17,0,0,Math.PI*2);ctx.fill();}if(noxSheet.complete&&noxSheet.naturalWidth){let sw=noxSheet.naturalWidth/4,sh=noxSheet.naturalHeight/3,h=width*sh/sw;ctx.filter=flash?'brightness(1.8)':opacity<1?'brightness(1.6) saturate(.7)':'none';ctx.drawImage(noxSheet,frame.col*sw,frame.row*sh,sw,sh,-width/2,-h*(frame.row===2&&frame.col===1?.70:.88)-lift,width,h);}ctx.restore();}
const noxDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2b2')return noxDrawBase(e,size);let frame=spriteFrame(e.state,e.anim),a=e.attack,lift=0;
 if(e.hp>0&&a?.pattern==='noxHunt'){let t=e.elapsed-a.lockAt-a.windup;frame={row:2,col:t<0?0:t<a.leapTravel?1:t<a.leapTravel+.35?2:3};if(t>0&&t<a.leapTravel)lift=Math.sin(t/a.leapTravel*Math.PI)*65;}
 paintNoxSprite(e,frame,e.facing,260,lift,1,e.flash>0);return true;
};
const noxSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2b2'?260:noxSizeBase(e);
const noxGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 noxGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r2b2'||e.hp<=0||a?.pattern!=='noxHunt'||!visibleAt(e.x,e.y))continue;ctx.save();
  for(let shadow of a.shadows){if(shadow.blocked||e.elapsed>shadow.at+a.travel+.15)continue;let angle=Math.atan2(shadow.end.y-shadow.start.y,shadow.end.x-shadow.start.x),length=dist(shadow.start,shadow.end);ctx.strokeStyle=e.elapsed>=shadow.at?'#dedfff':'#9a9de0';ctx.fillStyle=e.elapsed>=shadow.at?'#9b9bed55':'#9b9bed20';ctx.lineWidth=1.5;finalPolygon({center:shadow.start,angle},[[0,-34],[length,-34],[length,34],[0,34]]);for(let cap of [shadow.start,shadow.end]){ctx.beginPath();eldraGroundCircle(cap,34);ctx.fill();groundRing(cap.x,cap.y,34,ctx.strokeStyle,1);}let point=noxShadowPoint(shadow,e.elapsed,a.travel);paintNoxSprite(point,{row:1,col:Math.floor(e.elapsed*10)%4},Math.cos(angle)-Math.sin(angle)<0?-1:1,190,0,.4);}
  if(a.leapTarget&&!a.landed&&!a.blocked){groundRing(a.leapTarget.x,a.leapTarget.y,95,'#d6b3ff',2);let from=project(e.x,e.y),to=project(a.leapTarget.x,a.leapTarget.y);ctx.strokeStyle='#c7a4f0';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();ctx.setLineDash([]);}ctx.restore();
 }
};

