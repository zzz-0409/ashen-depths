const ROOK_MOVES={knifeFan:{name:'三連投刃',hint:'横へ避けて接近'},kingCleave:{name:'断頭の大振り',hint:'背後へ回避して反撃'}};
function beginRookAttack(e,pattern){let phase=e.hp/e.max<.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x);e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern,bespoke:true,phase,angle,center:{x:e.x,y:e.y},target:{x:p.x,y:p.y},windup:phase===2?1.1:1.4,radius:phase===2?220:185,halfAngle:.95,count:phase===2?7:5,volleys:0}}
function rookCleaveContains(a,point){let dx=point.x-a.center.x,dy=point.y-a.center.y,diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-a.angle),Math.cos(Math.atan2(dy,dx)-a.angle));return Math.hypot(dx,dy)<=a.radius&&Math.abs(diff)<=a.halfAngle}
const rookAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0b2')return rookAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 let next=(e.rookCycle||0)%2?'kingCleave':'knifeFan';if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=(next==='knifeFan'?460:190)&&lineClear(e,p)){beginRookAttack(e,next);e.rookCycle=(e.rookCycle||0)+1}
 let a=e.attack;if(!ROOK_MOVES[a?.pattern]){
  // The next cleave must close into melee range, never fall back to the caster role.
  if(next==='kingCleave'&&e.state!=='attack'){
   e.anim+=dt;e.t-=dt;e.nav-=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);let d=dist(e,p),clear=lineClear(e,p);e.state='idle';if((d>750&&!e.bossProvoked)||(d<=190&&clear))return;
   if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let target=e.path?.[0];if(!target)return;let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10){e.path.shift();return;}let step=Math.min(len,95*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,12)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;return;
  }
  return rookAnimateBase(e,dt);
 }e.anim+=dt;e.elapsed+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(a.pattern==='knifeFan'){
  while(a.volleys<3&&e.elapsed>=a.windup+a.volleys*.4){a.volleys++;for(let i=0;i<a.count;i++){let angle=a.angle+(i-(a.count-1)/2)*.22;shots.push({x:e.x,y:e.y,vx:Math.cos(angle)*420,vy:Math.sin(angle)*420,life:1.3,damage:a.phase===2?45:35,enemy:true,art:'throwingKnife'})}if(typeof playSound==='function')playSound('arrow',e.x,e.y)}e.struck=a.volleys===3;
 }else if(e.elapsed>=a.windup&&!e.struck){e.struck=true;if(rookCleaveContains(a,p)&&lineClear(a.center,p))hurt(a.phase===2?95:75);if(typeof playSound==='function')playSound('slash',e.x,e.y)}
 if(e.elapsed>=a.windup+(a.pattern==='knifeFan'?.8:0)+1.2){e.attack=null;e.state='idle';e.t=.65}
};
const rookSheet=new Image();rookSheet.assetSrc='assets/bandit-king-anim.png';
const rookDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0b2')return rookDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(ROOK_MOVES[a?.pattern])frame={row:2,col:e.elapsed<a.windup?0:a.pattern==='knifeFan'?e.elapsed<a.windup+.9?2:3:e.elapsed<a.windup+.3?1:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,40,14,0,0,Math.PI*2);ctx.fill();if(rookSheet.complete&&rookSheet.naturalWidth){let sw=rookSheet.naturalWidth/4,sh=rookSheet.naturalHeight/3,w=185,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(rookSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.94,w,h)}ctx.restore();return true;
};
function drawThrowingKnife(s){let head=project(s.x,s.y),tail=project(s.x-s.vx*.05,s.y-s.vy*.05),angle=Math.atan2(head.y-tail.y,head.x-tail.x);ctx.save();ctx.globalCompositeOperation='source-over';ctx.translate(head.x,head.y-12);ctx.rotate(angle);ctx.strokeStyle='#ead8b488';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-26,0);ctx.lineTo(-8,0);ctx.stroke();ctx.fillStyle='#dce5e7';ctx.strokeStyle='#62737d';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-6,-4);ctx.lineTo(-3,0);ctx.lineTo(-6,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#9d7450';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(-12,0);ctx.stroke();ctx.restore()}
const rookGroundBase=drawGroundEffects;drawGroundEffects=()=>{rookGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r0b2'||e.hp<=0||!ROOK_MOVES[a?.pattern]||e.struck||!visibleAt(e.x,e.y))continue;ctx.save();ctx.strokeStyle='#ffc3a1';ctx.fillStyle='#ce713424';ctx.lineWidth=2;if(a.pattern==='knifeFan'){for(let i=0;i<a.count;i++){let angle=a.angle+(i-(a.count-1)/2)*.22,from=project(a.center.x,a.center.y),to=project(a.center.x+Math.cos(angle)*546,a.center.y+Math.sin(angle)*546);ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke()}}else{let points=[[0,0]];for(let i=0;i<=24;i++){let angle=-a.halfAngle+i*a.halfAngle*2/24;points.push([Math.cos(angle)*a.radius,Math.sin(angle)*a.radius])}finalPolygon(a,points)}ctx.restore()}};

