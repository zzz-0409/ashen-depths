const azimSheet=new Image();azimSheet.assetSrc='assets/azim-v2.png';
function beginAzim(e,pattern='azimCuts'){
 const phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x);e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 const a=e.attack={pattern,bespoke:true,owner:p,world:dungeon,origin:{x:e.x,y:e.y},expected:{x:e.x,y:e.y},angle,phase,cuts:[],legs:[],windup:pattern==='azimCuts'?1:1.3,end:4};
 if(pattern==='azimCuts'){a.cuts=[-.7,.7,0,...(phase===2?[Math.PI]:[])].map((offset,i)=>({angle:angle+offset,at:1+i*.7,fired:false}));a.end=a.cuts.at(-1).at+1.2;}
 else{let end={...a.origin};for(let d=8;d<=420;d+=8){const q={x:e.x+Math.cos(angle)*d,y:e.y+Math.sin(angle)*d};if(!passable(q.x,q.y,30)||!lineClear(end,q,30))break;end=q;}const duration=dist(a.origin,end)/700;a.legs=[{from:{...a.origin},to:end,start:1.3,duration,hit:false,sounded:false}];if(phase===2)a.legs.push({from:{...end},to:{...a.origin},start:1.3+duration+.9,duration,hit:false,sounded:false});a.end=a.legs.at(-1).start+duration+1.2;}
}
function cancelAzim(e){e.attack=null;e.state='idle';e.t=1.5;}
function azimCutTouches(a,cut,q){const angle=Math.atan2(q.y-a.origin.y,q.x-a.origin.x)-cut.angle;return dist(a.origin,q)<=(a.phase===2?280:240)&&Math.cos(angle)>=Math.cos(.65)&&lineClear(a.origin,q);}
function azimSegmentDistance(q,a,b){const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,t=len?clamp(((q.x-a.x)*dx+(q.y-a.y)*dy)/len,0,1):0;return Math.hypot(q.x-a.x-dx*t,q.y-a.y-dy*t);}
const azimAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r4b2')return azimAnimateBase(e,dt);
 if(e.hp<=0||dead||p.hp<=0){cancelAzim(e);return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 e.anim=(e.anim||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(e.reactionStun>0){cancelAzim(e);return;}
 const a=e.attack;
 if(!a||!['azimCuts','azimRush'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;e.state='idle';const distance=dist(e,p),clear=lineClear(e,p),rush=(e.azimCycle||0)%2;
  if(e.t<=0&&distance<=(rush?480:240)&&clear){beginAzim(e,rush?'azimRush':'azimCuts');e.azimCycle=(e.azimCycle||0)+1;return;}
  if(distance>900&&!e.bossProvoked||distance<80)return;
  if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}const q=e.path?.[0];if(q){const dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{const step=Math.min(len,120*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,30)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.expected)>24){cancelAzim(e);return;}const before=e.elapsed;e.elapsed+=dt;
 if(a.pattern==='azimCuts'){for(const cut of a.cuts)if(!cut.fired&&e.elapsed+1e-8>=cut.at){cut.fired=true;e.struck=true;if(azimCutTouches(a,cut,p))hurt(a.phase===2?110:85);playSound('slash',e.x,e.y);}}
 else for(const leg of a.legs){if(e.elapsed<leg.start||before>leg.start+leg.duration)continue;if(!leg.sounded){leg.sounded=true;playSound('dash',e.x,e.y);}const ratio=leg.duration?clamp((e.elapsed-leg.start)/leg.duration,0,1):1,dest={x:leg.from.x+(leg.to.x-leg.from.x)*ratio,y:leg.from.y+(leg.to.y-leg.from.y)*ratio};let remaining=dist(e,dest);const steps=Math.ceil(remaining/8);for(let i=0;i<steps;i++){const old={x:e.x,y:e.y},dx=(dest.x-e.x)/(steps-i),dy=(dest.y-e.y)/(steps-i);moveActor(e,dx,dy,30);if(!leg.hit&&azimSegmentDistance(p,old,e)<=48&&lineClear(e,p)){leg.hit=true;e.struck=true;hurt(a.phase===2?145:115);}if(dist(e,{x:old.x+dx,y:old.y+dy})>.5){cancelAzim(e);return;}if(dead||p.hp<=0){cancelAzim(e);return;}}a.expected={x:e.x,y:e.y};e.facing=leg.to.x-leg.from.x-(leg.to.y-leg.from.y)<0?-1:1;}
 if(e.elapsed+1e-8>=a.end)cancelAzim(e);
};
const azimDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{if(e.species!=='r4b2'||!azimSheet.complete||!azimSheet.naturalWidth)return azimDrawBase(e,size);let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack){const a=e.attack,active=a.pattern==='azimRush'?a.legs.some(l=>e.elapsed>=l.start&&e.elapsed<l.start+l.duration):a.cuts.some(c=>e.elapsed>=c.at&&e.elapsed<c.at+.25);f={row:2,col:active?(a.pattern==='azimRush'?2:1):e.elapsed>=a.end-1?3:0};}const q=project(e.x,e.y),sw=azimSheet.naturalWidth/4,sh=azimSheet.naturalHeight/3,w=220,h=w*sh/sw;ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';drawPreparedEnemySprite(ctx,azimSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.97,w,h);ctx.restore();return true;};
function drawAzimSector(a,cut,time){const r=a.phase===2?280:240,origin=project(a.origin.x,a.origin.y);ctx.save();ctx.beginPath();ctx.moveTo(origin.x,origin.y);for(let i=0;i<=24;i++){const angle=cut.angle-.65+i/24*1.3,q=project(a.origin.x+Math.cos(angle)*r,a.origin.y+Math.sin(angle)*r);ctx.lineTo(q.x,q.y);}ctx.closePath();ctx.fillStyle='#f2a56222';ctx.strokeStyle='#f2b777';ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore();}
const azimGroundBase=drawGroundEffects;drawGroundEffects=()=>{azimGroundBase();for(const e of(typeof enemyRenderList==='function'?enemyRenderList('r4b2'):enemies)){const a=e.attack;if(e.species!=='r4b2'||e.hp<=0||!a||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y))continue;if(a.pattern==='azimCuts'){const next=a.cuts.find(c=>!c.fired);if(next)drawAzimSector(a,next,e.elapsed);}else{const leg=a.legs.find(l=>e.elapsed<l.start+l.duration);if(!leg)continue;const len=dist(leg.from,leg.to);if(!len)continue;const nx=-(leg.to.y-leg.from.y)/len*48,ny=(leg.to.x-leg.from.x)/len*48;for(const side of [-1,1])paintLinkLine({x:leg.from.x+nx*side,y:leg.from.y+ny*side},{x:leg.to.x+nx*side,y:leg.to.y+ny*side},'#ffba81',2);paintLinkLine(leg.from,leg.to,'#ed9161',1);}}};
function azimAttackHint(e){const a=e.attack;if(!a)return '攻撃後の隙を狙う';if(a.pattern==='azimCuts'){const next=a.cuts.findIndex(c=>!c.fired);return next<0?'連斬り後の隙に反撃':next===3?'激昂：背後への返し斬り':'連斬り '+(next+1)+'/3 · 扇の外へ';}const index=a.legs.findIndex(l=>e.elapsed<l.start+l.duration);return index<0?'突進後の隙に反撃':index===1?'折り返し突進 · 線から横へ':'突進 · 予告線から横へ';}
const azimSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r4b2'?270:azimSizeBase(e);
const azimRadiusBase=enemyHitRadius;enemyHitRadius=e=>e.species==='r4b2'?30:azimRadiusBase(e);
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r4b2',animateEnemy,drawRegionEnemy);

