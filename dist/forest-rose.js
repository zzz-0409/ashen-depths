function roseAttackHint(e){return e.attack?.pattern==='roseTrellis'?(e.attack.phase===2?'茨の回廊 · 列の間へ。折り返しにも注意':'茨の回廊 · 迫る列の間へ移動'):'花冠の葬送 · 花を避け、中央の円から離れる';}
function beginRoseAttack(e){
 let phase=e.hp/e.max<.5?2:1,origin={x:e.x,y:e.y},target={x:p.x,y:p.y},angle=Math.atan2(p.y-e.y,p.x-e.x),pattern=(e.roseCycle||0)%2?'roseBloom':'roseTrellis';e.roseCycle=(e.roseCycle||0)+1;
 let waves=[];
 if(pattern==='roseTrellis'){
  let distance=clamp(dist(origin,target),120,320),rows=phase===2?[-80,0,80,80,0,-80]:[-80,0,80];
  waves=rows.map((offset,i)=>{let center={x:origin.x+Math.cos(angle)*(distance+offset),y:origin.y+Math.sin(angle)*(distance+offset)},sides=[-1,1].map(sign=>{let span=210;while(span>0&&!lineClear(center,{x:center.x-Math.sin(angle)*span*sign,y:center.y+Math.cos(angle)*span*sign}))span-=10;return span*sign});return{at:1.4+i*.6,hit:false,center,angle,min:sides[0],max:sides[1],blocked:!lineClear(origin,center)};});
 }else{
  let flowers=(count,radius)=>Array.from({length:count},(_,i)=>({x:target.x+Math.cos(angle+i*Math.PI*2/count)*radius,y:target.y+Math.sin(angle+i*Math.PI*2/count)*radius,radius:50})).filter(q=>lineClear(origin,q));
  waves=[{at:1.6,hit:false,marks:flowers(6,130)},{at:2.5,hit:false,marks:lineClear(origin,target)?[{...target,radius:95}]:[]}];
  if(phase===2)waves.push({at:3.4,hit:false,marks:flowers(8,200)});
 }
 e.state='attack';e.elapsed=0;e.struck=false;e.phase=phase;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern,bespoke:true,phase,origin,target,angle,windup:1.4,waves};
}
function roseWaveContains(a,wave,point){
 if(wave.marks)return wave.marks.some(q=>dist(q,point)<=q.radius);
 if(wave.blocked)return false;let dx=point.x-wave.center.x,dy=point.y-wave.center.y,along=dx*Math.cos(wave.angle)+dy*Math.sin(wave.angle),across=-dx*Math.sin(wave.angle)+dy*Math.cos(wave.angle);
 return Math.abs(along)<=22&&across>=wave.min&&across<=wave.max;
}
const roseAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2b1')return roseAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(!['roseTrellis','roseBloom'].includes(e.attack?.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(distance<=420&&clear&&e.t<=0)beginRoseAttack(e);
  else{e.state='idle';if(distance>900||distance<180&&clear)return;if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let next=e.path?.[0];if(next){let dx=next.x-e.x,dy=next.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,95*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,20)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;}
 }
 let a=e.attack;e.elapsed+=dt;for(let wave of a.waves)if(!wave.hit&&e.elapsed>=wave.at){wave.hit=true;if(roseWaveContains(a,wave,p)&&lineClear(a.origin,p))hurt(a.phase===2?100:78);playSound(wave.marks?'frost':'impact',e.x,e.y);}
 e.struck=a.waves.every(w=>w.hit);if(e.elapsed>=a.waves.at(-1).at+1.3){e.attack=null;e.state='idle';e.t=1.1;}
};
const roseSheet=new Image();roseSheet.assetSrc='assets/forest-rose-anim.png';
const roseDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2b1')return roseDrawBase(e,size);let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim),a=e.attack;
 if(e.hp>0&&a?.pattern?.startsWith('rose'))frame={row:2,col:e.elapsed<.65?0:e.elapsed<1.4?1:e.elapsed<a.waves.at(-1).at+.25?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,0,38,13,0,0,Math.PI*2);ctx.fill();
 if(roseSheet.complete&&roseSheet.naturalWidth){let sw=roseSheet.naturalWidth/4,sh=roseSheet.naturalHeight/3,w=230,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':e.phase===2?'saturate(1.5)':'none';ctx.drawImage(roseSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.98,w,h);}ctx.restore();return true;
};
const roseSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2b1'?230:roseSizeBase(e);
const roseGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 roseGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r2b1'||e.hp<=0||!a?.pattern?.startsWith('rose')||!visibleAt(e.x,e.y))continue;
  ctx.save();for(let [index,wave]of a.waves.entries()){
   let lead=wave.at-e.elapsed;if(lead<-.25)continue;let active=lead<=0,next=index===0||a.waves[index-1].hit;
   ctx.strokeStyle=active?'#fff1eb':next?'#ff91b6':'#a45c88';ctx.fillStyle=active?'#ff89b877':next?'#d85a8e40':'#b8709216';ctx.lineWidth=active?3:next?2:1;
   if(wave.marks){if(!next)continue;for(let mark of wave.marks){ctx.beginPath();eldraGroundCircle(mark,mark.radius);ctx.fill();groundRing(mark.x,mark.y,mark.radius,ctx.strokeStyle,ctx.lineWidth);let center=project(mark.x,mark.y);ctx.beginPath();for(let n=0;n<10;n++){let angle=n*Math.PI/5,r=(n%2?10:24)*(active?1.4:1),x=center.x+Math.cos(angle)*r,y=center.y+Math.sin(angle)*r*.6;if(!n)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();}}
   else if(!wave.blocked){finalPolygon({center:wave.center,angle:wave.angle},[[-22,wave.min],[22,wave.min],[22,wave.max],[-22,wave.max]]);if(active)for(let across=wave.min+10;across<wave.max;across+=45){let pos=project(wave.center.x-Math.sin(wave.angle)*across,wave.center.y+Math.cos(wave.angle)*across);rootBranch([[pos.x-7,pos.y],[pos.x,pos.y-33],[pos.x+10,pos.y-46]],3,'#ae697c');}}
  }ctx.restore();
 }
};
