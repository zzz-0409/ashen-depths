function eldraAttackHint(e){return e.attack?.pattern==='eldraRoots'?'根の奔流 · 放射状の円の間へ':e.attack?.phase===2?'森の鼓動 · 内→外→内へ移動':'森の鼓動 · 内側へ入り、次は外へ';}
function beginEldraAttack(e){
 let phase=e.hp/e.max<.5?2:1,origin={x:e.x,y:e.y},angle=Math.atan2(p.y-e.y,p.x-e.x),pattern=(e.eldraCycle||0)%2?'eldraPulse':'eldraRoots';e.eldraCycle=(e.eldraCycle||0)+1;
 let waves=pattern==='eldraRoots'?[100,200,300,400].map((radius,i)=>({at:1.5+i*.5,hit:false,marks:Array.from({length:phase===2?8:5},(_,n)=>{let dir=angle+n*Math.PI*2/(phase===2?8:5);return {x:origin.x+Math.cos(dir)*radius,y:origin.y+Math.sin(dir)*radius,radius:42};}).filter(q=>lineClear(origin,q))})):(phase===2?[true,false,true]:[true,false]).map((outer,i)=>({at:1.5+i*1.1,hit:false,outer,inner:outer?180:0,radius:outer?380:180}));
 e.state='attack';e.elapsed=0;e.struck=false;e.phase=phase;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern,bespoke:true,phase,origin,angle,windup:1.5,waves};
}
function eldraWaveContains(a,wave,point){if(wave.marks)return wave.marks.some(mark=>dist(mark,point)<=mark.radius&&lineClear(a.origin,mark));let length=dist(a.origin,point);return length<=wave.radius&&(wave.outer?length>=wave.inner:true);}
const eldraAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2b0')return eldraAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(!['eldraRoots','eldraPulse'].includes(e.attack?.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  let attackRange=(e.eldraCycle||0)%2?360:420;
  if(distance<=attackRange&&clear&&e.t<=0)beginEldraAttack(e);
  else{
   if(distance>900||distance<180&&clear){e.state='idle';return;}
   if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}
   let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,80*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,24)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
  }
 }
 let a=e.attack;e.elapsed+=dt;for(let wave of a.waves)if(!wave.hit&&e.elapsed>=wave.at){wave.hit=true;if(eldraWaveContains(a,wave,p)&&lineClear(a.origin,p))hurt(a.phase===2?115:90);playSound('impact',e.x,e.y);}
 e.struck=a.waves.every(w=>w.hit);if(e.elapsed>=a.waves.at(-1).at+1.3){e.attack=null;e.state='idle';e.t=1.4;}
};
const eldraSheet=new Image();eldraSheet.assetSrc='assets/forest-eldra-anim.png';
const eldraDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2b0')return eldraDrawBase(e,size);let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim),a=e.attack;
 if(e.hp>0&&a?.pattern?.startsWith('eldra'))frame={row:2,col:e.elapsed<.65?0:e.elapsed<1.5?1:e.elapsed<a.waves.at(-1).at+.25?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,0,58,19,0,0,Math.PI*2);ctx.fill();
 if(eldraSheet.complete&&eldraSheet.naturalWidth){let sw=eldraSheet.naturalWidth/4,sh=eldraSheet.naturalHeight/3,w=300,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':e.phase===2?'saturate(1.35)':'none';ctx.drawImage(eldraSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.94,w,h);}ctx.restore();return true;
};
const eldraSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2b0'?300:eldraSizeBase(e);
function eldraGroundCircle(origin,radius){let s=project(origin.x,origin.y);ctx.ellipse(s.x,s.y,radius*ISOX*Math.SQRT2,radius*ISOY*Math.SQRT2,0,0,Math.PI*2);}
const eldraGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 eldraGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r2b0'||e.hp<=0||!a?.pattern?.startsWith('eldra')||!visibleAt(e.x,e.y))continue;
  ctx.save();for(let [index,wave]of a.waves.entries()){
   let until=wave.at-e.elapsed;if(until<-.25)continue;let active=until<=0,next=index===0||a.waves[index-1].hit;
   ctx.strokeStyle=active?'#fff0bd':next?'#efc67c':'#a3b980';ctx.fillStyle=active?'#e9d78577':next?'#e2bd5e30':'#b7c38914';ctx.lineWidth=active?3:next?2:1;
   if(wave.marks){for(let mark of wave.marks){ctx.beginPath();eldraGroundCircle(mark,mark.radius);ctx.fill();groundRing(mark.x,mark.y,mark.radius,ctx.strokeStyle,ctx.lineWidth);if(active){let s=project(mark.x,mark.y);rootBranch([[s.x-12,s.y+2],[s.x-5,s.y-27],[s.x+9,s.y-42]],5,'#86724b');rootBranch([[s.x+7,s.y+3],[s.x+12,s.y-19],[s.x+4,s.y-32]],3,'#b6c48c');}}}
   else if(next){ctx.beginPath();eldraGroundCircle(a.origin,wave.radius);if(wave.outer){let s=project(a.origin.x,a.origin.y);ctx.moveTo(s.x+wave.inner*ISOX*Math.SQRT2,s.y);eldraGroundCircle(a.origin,wave.inner);}ctx.fill('evenodd');groundRing(a.origin.x,a.origin.y,wave.radius,ctx.strokeStyle,ctx.lineWidth);if(wave.outer)groundRing(a.origin.x,a.origin.y,wave.inner,ctx.strokeStyle,ctx.lineWidth);}
  }ctx.restore();
 }
};
