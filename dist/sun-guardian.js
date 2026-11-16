const sunGuardianSheet=new Image();sunGuardianSheet.assetSrc='assets/sun-guardian-v2.png';
function beginSunGuardian(e,pattern='sunGates'){
 const phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x);e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;
 const a=e.attack={pattern,bespoke:true,owner:p,world:dungeon,origin:{x:e.x,y:e.y},angle,phase,windup:pattern==='sunGates'?1.4:1.3,pulses:[],legs:[],nextTick:1.4,nextHit:-Infinity,end:5};
 if(pattern==='sunGates'){a.legs=[{start:1.4,duration:2,from:angle,to:angle+Math.PI/2}];if(phase===2)a.legs.push({start:4,duration:2,from:angle+Math.PI/2,to:angle});a.end=a.legs.at(-1).start+3.4;}
 else{a.pulses=Array.from({length:phase===2?5:3},(_,i)=>({at:1.3+i*1.2,inner:i%2===0,fired:false}));a.end=a.pulses.at(-1).at+1.5;}
}
function cancelSunGuardian(e){e.attack=null;e.state='idle';e.t=1.2;}
function sunGateAngle(leg,time){return leg.from+(leg.to-leg.from)*clamp((time-leg.start)/leg.duration,0,1);}
function sunGateTouches(a,angle,q){const dx=q.x-a.origin.x,dy=q.y-a.origin.y,r=Math.hypot(dx,dy);return r>=70&&r<=420&&Math.abs(dx*Math.sin(angle)-dy*Math.cos(angle))<=26&&lineClear(a.origin,q);}
function sunEclipseTouches(a,pulse,q){const r=dist(a.origin,q);return(pulse.inner?r<=140:r>140&&r<=360)&&lineClear(a.origin,q);}
const sunGuardianAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r4b3')return sunGuardianAnimateBase(e,dt);
 if(e.hp<=0||dead||p.hp<=0){cancelSunGuardian(e);return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 e.anim=(e.anim||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(e.reactionStun>0){cancelSunGuardian(e);return;}
 const a=e.attack;
 if(!a||!['sunGates','sunEclipse'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;e.state='idle';const distance=dist(e,p),clear=lineClear(e,p);
  if(e.t<=0&&distance<=420&&clear){beginSunGuardian(e,(e.sunCycle||0)%2?'sunEclipse':'sunGates');e.sunCycle=(e.sunCycle||0)+1;return;}
  if(distance>900&&!e.bossProvoked||distance<110)return;
  if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}const q=e.path?.[0];if(q){const dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{const step=Math.min(len,80*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,45)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.origin)>16){cancelSunGuardian(e);return;}e.elapsed+=dt;
 if(a.pattern==='sunGates'){
  while(a.nextTick<=e.elapsed+1e-8&&a.nextTick<=a.legs.at(-1).start+2+1e-8){const t=a.nextTick;a.nextTick=Math.round((a.nextTick+.025)*1e6)/1e6;const leg=a.legs.find(l=>t>=l.start-1e-8&&t<=l.start+l.duration+1e-8);if(leg&&t>=a.nextHit-1e-8&&sunGateTouches(a,sunGateAngle(leg,t),p)){a.nextHit=t+.65;e.struck=true;hurt(a.phase===2?110:90);playSound('arc',e.x,e.y);}if(dead||p.hp<=0){cancelSunGuardian(e);return;}}
 }else for(const pulse of a.pulses)if(!pulse.fired&&e.elapsed+1e-8>=pulse.at){pulse.fired=true;e.struck=true;if(sunEclipseTouches(a,pulse,p))hurt(a.phase===2?130:105);playSound('impact',e.x,e.y);if(dead||p.hp<=0){cancelSunGuardian(e);return;}}
 if(e.elapsed+1e-8>=a.end)cancelSunGuardian(e);
};
const sunGuardianDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r4b3'||!sunGuardianSheet.complete||!sunGuardianSheet.naturalWidth)return sunGuardianDrawBase(e,size);
 let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack){const a=e.attack,active=a.pattern==='sunGates'?a.legs.some(l=>e.elapsed>=l.start&&e.elapsed<=l.start+l.duration):a.pulses.some(p=>p.fired&&e.elapsed<p.at+.3);f={row:2,col:active?(a.pattern==='sunGates'?2:1):e.elapsed>=a.end-1.4?3:0};}
 const q=project(e.x,e.y),sw=sunGuardianSheet.naturalWidth/4,sh=sunGuardianSheet.naturalHeight/3,w=300,h=w*sh/sw;ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';drawPreparedEnemySprite(ctx,sunGuardianSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.89,w,h);ctx.restore();return true;
};
function paintSunEclipse(a,pulse,time){const center=project(a.origin.x,a.origin.y),impact=pulse.fired&&time<pulse.at+.22,inner=pulse.inner?0:140,outer=pulse.inner?140:360;ctx.save();ctx.beginPath();ctx.ellipse(center.x,center.y,outer*ISOX*Math.SQRT2,outer*ISOY*Math.SQRT2,0,0,Math.PI*2);if(inner){ctx.moveTo(center.x+inner*ISOX*Math.SQRT2,center.y);ctx.ellipse(center.x,center.y,inner*ISOX*Math.SQRT2,inner*ISOY*Math.SQRT2,0,0,Math.PI*2);}ctx.fillStyle=impact?'#ffe4a577':'#eeb86122';ctx.strokeStyle=impact?'#fff5d5':'#eeb861';ctx.lineWidth=impact?4:2;ctx.fill('evenodd');ctx.stroke();ctx.restore();}
const sunGuardianGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 sunGuardianGroundBase();for(const e of(typeof enemyRenderList==='function'?enemyRenderList('r4b3'):enemies)){const a=e.attack;if(e.species!=='r4b3'||e.hp<=0||!a||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y))continue;
  if(a.pattern==='sunEclipse'){const next=a.pulses.find(p=>!p.fired);if(next)paintSunEclipse(a,next,e.elapsed);for(const pulse of a.pulses)if(pulse.fired&&e.elapsed>=pulse.at&&e.elapsed<pulse.at+.22)paintSunEclipse(a,pulse,e.elapsed);}
  else if(a.pattern==='sunGates'){const leg=a.legs.find(l=>e.elapsed<=l.start+l.duration);if(!leg)continue;const angle=sunGateAngle(leg,e.elapsed),active=e.elapsed>=leg.start;groundRing(e.x,e.y,70,'#9ee8db',2);for(const side of [-1,1]){const from={x:e.x+Math.cos(angle)*70*side,y:e.y+Math.sin(angle)*70*side},to={x:e.x+Math.cos(angle)*420*side,y:e.y+Math.sin(angle)*420*side},nx=-Math.sin(angle)*26,ny=Math.cos(angle)*26;for(const edge of [-1,1])paintLinkLine({x:from.x+nx*edge,y:from.y+ny*edge},{x:to.x+nx*edge,y:to.y+ny*edge},'#efc47d',1);paintLinkLine(from,to,active?'#ffd68a':'#aa874d',active?7:2);if(active)paintLinkLine(from,to,'#fff3d0',2);const ahead=angle+Math.sign(leg.to-leg.from)*.15;paintLinkLine({x:e.x+Math.cos(angle)*230*side,y:e.y+Math.sin(angle)*230*side},{x:e.x+Math.cos(ahead)*230*side,y:e.y+Math.sin(ahead)*230*side},'#9ee8db',3);}}
 }
};
function sunGuardianAttackHint(e){const a=e.attack;if(!a)return '攻撃後の隙を狙う';if(a.pattern==='sunEclipse'){const next=a.pulses.find(p=>!p.fired);return next?(next.inner?'中心が炸裂 · 外側へ':'外周が炸裂 · 中心へ'):'日蝕後の隙に反撃';}const leg=a.legs.find(l=>e.elapsed<=l.start+l.duration);return leg?(leg.to<leg.from?'逆回転 · 首元か光の後ろへ':'日輪が回転 · 首元か光の後ろへ'):'日輪が消えたら反撃';}
const sunGuardianSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r4b3'?280:sunGuardianSizeBase(e);
const sunGuardianRadiusBase=enemyHitRadius;enemyHitRadius=e=>e.species==='r4b3'?45:sunGuardianRadiusBase(e);
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r4b3',animateEnemy,drawRegionEnemy);
