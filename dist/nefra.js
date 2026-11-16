const nefraSheet=new Image();nefraSheet.assetSrc='assets/nefra-v1.png';
function beginNefra(e,pattern='nefraRings'){
 const phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x);e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 const a=e.attack={pattern,bespoke:true,owner:p,world:dungeon,origin:{x:e.x,y:e.y},angle,phase,windup:pattern==='nefraRings'?1.4:1.6,waves:[],marks:[],end:4};
 if(pattern==='nefraRings'){a.waves=[{start:1.4,gap:angle,hit:false,sounded:false}];if(phase===2)a.waves.push({start:4.2,gap:angle+Math.PI/2,hit:false,sounded:false});a.end=a.waves.at(-1).start+3;}
 else{const ux=Math.cos(angle),uy=Math.sin(angle);for(const [x,y]of [[0,0],[0,120],[0,-120],...(phase===2?[[120,0],[-120,0]]:[])]){const q={x:p.x+ux*x-uy*y,y:p.y+uy*x+ux*y};if(passable(q.x,q.y,8)&&lineClear(e,q))a.marks.push({...q,at:1.6+a.marks.length*.4,fired:false});}a.end=(a.marks.at(-1)?.at||1.6)+1.4;}
}
function nefraRadius(w,time){return 80+360*Math.max(0,Math.min(1,(time-w.start)/2));}
function nefraRingTouches(a,w,q,before,after){
 if(after+1e-8<w.start||before>w.start+2+1e-8||!lineClear(a.origin,q))return false;
 const d=dist(a.origin,q),lo=nefraRadius(w,Math.max(before,w.start))-16,hi=nefraRadius(w,Math.min(after,w.start+2))+16;
 const angle=Math.atan2(q.y-a.origin.y,q.x-a.origin.x)-w.gap,delta=Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)));
 return d>=lo-1e-8&&d<=hi+1e-8&&delta>Math.PI/8;
}
function cancelNefra(e){e.attack=null;e.state='idle';e.t=1.5;}
const nefraAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r4b1')return nefraAnimateBase(e,dt);
 if(e.hp<=0||dead||p.hp<=0){cancelNefra(e);return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 e.anim=(e.anim||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(e.reactionStun>0){cancelNefra(e);return;}
 const a=e.attack;
 if(!a||!['nefraRings','nefraPillars'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;const d=dist(e,p),clear=lineClear(e,p);e.state='idle';
  if(e.t<=0&&d<=460&&clear){beginNefra(e,(e.nefraCycle||0)%2?'nefraPillars':'nefraRings');e.nefraCycle=(e.nefraCycle||0)+1;return;}
  if(d>900&&!e.bossProvoked||d<=280&&clear)return;
  if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}const q=e.path?.[0];if(q){const dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{const step=Math.min(len,95*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,30)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.origin)>24){cancelNefra(e);return;}
 const before=e.elapsed;e.elapsed+=dt;
 if(a.pattern==='nefraRings')for(const wave of a.waves){if(!wave.sounded&&e.elapsed+1e-8>=wave.start){wave.sounded=true;e.struck=true;playSound('impact',e.x,e.y);}if(!wave.hit&&nefraRingTouches(a,wave,p,before,e.elapsed)){wave.hit=true;hurt(a.phase===2?120:90);}}
 else for(const mark of a.marks)if(!mark.fired&&e.elapsed+1e-8>=mark.at){mark.fired=true;e.struck=true;if(dist(p,mark)<=80&&lineClear(a.origin,mark)&&lineClear(mark,p))hurt(a.phase===2?125:95);burst(mark.x,mark.y,80,'#e6b16d');playSound('impact',mark.x,mark.y);}
 if(e.elapsed+1e-8>=a.end)cancelNefra(e);
};
const nefraDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r4b1'||!nefraSheet.complete||!nefraSheet.naturalWidth)return nefraDrawBase(e,size);
 let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack){let t=e.elapsed;const second=e.attack.waves?.[1];if(second&&t>=second.start-.8)t-=second.start-e.attack.windup;f={row:2,col:t<.5?0:t<e.attack.windup?1:e.elapsed<e.attack.end-1?2:3};}
 const q=project(e.x,e.y),sw=nefraSheet.naturalWidth/4,sh=nefraSheet.naturalHeight/3,w=220,h=w*sh/sw;ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';drawPreparedEnemySprite(ctx,nefraSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.97,w,h);ctx.restore();return true;
};
function drawNefraRing(a,w,time){
 const active=time>=w.start,r=active?nefraRadius(w,time):80;ctx.save();if(active){ctx.fillStyle='#d58f3d44';ctx.beginPath();for(const [radius,reverse]of [[r+16,false],[Math.max(0,r-16),true]])for(let j=0;j<=48;j++){const i=reverse?48-j:j,angle=w.gap+Math.PI/8+i/48*(Math.PI*2-Math.PI/4),q=project(a.origin.x+Math.cos(angle)*radius,a.origin.y+Math.sin(angle)*radius);if(!reverse&&j===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);}ctx.closePath();ctx.fill();}ctx.strokeStyle=active?'#f2ad58':'#c6a779';ctx.lineWidth=active?4:2;ctx.beginPath();for(let i=0;i<=48;i++){const angle=w.gap+Math.PI/8+i/48*(Math.PI*2-Math.PI/4),q=project(a.origin.x+Math.cos(angle)*r,a.origin.y+Math.sin(angle)*r);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}ctx.stroke();ctx.strokeStyle='#8bdfb4';ctx.lineWidth=2;for(const side of [-1,1]){const angle=w.gap+side*Math.PI/8,q=project(a.origin.x+Math.cos(angle)*456,a.origin.y+Math.sin(angle)*456),o=project(a.origin.x,a.origin.y);ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(q.x,q.y);ctx.stroke();}ctx.restore();
}
const nefraGroundBase=drawGroundEffects;drawGroundEffects=()=>{nefraGroundBase();for(const e of(typeof enemyRenderList==='function'?enemyRenderList('r4b1'):enemies)){const a=e.attack;if(e.species!=='r4b1'||e.hp<=0||!a||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y))continue;if(a.pattern==='nefraRings'){for(const w of a.waves)if(e.elapsed>=w.start-1.4&&e.elapsed<=w.start+2)drawNefraRing(a,w,e.elapsed);}else for(const m of a.marks)if(!m.fired){groundRing(m.x,m.y,80,'#e6b16d',2);groundRing(m.x,m.y,80*Math.max(0,1-e.elapsed/m.at),'#ffe1a5',2);}}};
const nefraSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r4b1'?270:nefraSizeBase(e);
const nefraRadiusBase=enemyHitRadius;enemyHitRadius=e=>e.species==='r4b1'?30:nefraRadiusBase(e);
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r4b1',animateEnemy,drawRegionEnemy);


function nefraAttackHint(e){const a=e.attack;if(!a)return '詠唱後の隙に攻撃';if(a.pattern==='nefraRings'){const w=a.waves.find(w=>e.elapsed<w.start+2);if(!w)return '砂環が消えた今が反撃の隙';return (a.waves.indexOf(w)?'二波目：隙間が90度変わる':'砂環')+' · 緑の線の間へ';}return a.marks.some(m=>!m.fired)?'砂柱 · 固定された予告円から離れる':'砂柱の後の隙に攻撃';}
