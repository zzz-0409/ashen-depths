// Pure combat state for Morga. Caller records each resolved attack only once.
function newMorgaShell(owner,world){return{owner,world,cracks:0,open:0,broken:false};}
function morgaShellFactor(shell,dot=false){return dot?1:shell.open>0?1.4:.45;}
function advanceMorgaShell(shell,dt,state){if(shell.owner!==state.player||shell.world!==state.world||!state.alive){shell.cracks=0;shell.open=0;shell.broken=false;return false;}if(state.paused||!Number.isFinite(dt)||dt<=0)return true;shell.open=Math.max(0,shell.open-dt);if(shell.open<=0)shell.broken=false;return true;}
function resolveMorgaImpact(shell,attack,covered,eligible=true){if(attack.resolved)return false;attack.resolved=true;if(!eligible||shell.open>0)return false;if(covered){shell.cracks=0;return false;}shell.cracks++;if(shell.cracks<3)return false;shell.cracks=0;shell.open=6;shell.broken=true;return true;}

const morgaSheet=new Image();morgaSheet.assetSrc='assets/morga-v1.png';
let morgaShells=new WeakMap();
function morgaShell(e){let s=morgaShells.get(e);if(!s||s.owner!==p||s.world!==dungeon){s=newMorgaShell(p,dungeon);morgaShells.set(e,s);}return s;}
const morgaHitBase=hit;hit=(e,d)=>morgaHitBase(e,e.species==='r3b2'&&e.hp>0&&Number.isFinite(d)&&d>0?d*morgaShellFactor(morgaShell(e),!!e.dotTick):d);
function beginMorga(e,pattern='morgaSmash'){
 let phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x),origin={x:e.x,y:e.y};e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 let range=Math.min(400,dist(e,p));e.attack={pattern,bespoke:true,phase,origin,owner:p,world:dungeon,angle,windup:1.5,end:2.5,fired:false,resolved:false,target:{x:e.x+Math.cos(angle)*range,y:e.y+Math.sin(angle)*range},radius:pattern==='morgaSmash'?(phase===2?140:110):pattern==='morgaSweep'?(phase===2?280:240):(phase===2?320:280)};morgaShell(e);
}
function morgaContains(a,q){if(!lineClear(a.origin,q))return false;if(a.pattern==='morgaSmash')return lineClear(a.origin,a.target)&&dist(a.target,q)<=a.radius;if(a.pattern==='morgaStomp')return dist(a.origin,q)>=90&&dist(a.origin,q)<=a.radius;let angle=Math.atan2(q.y-a.origin.y,q.x-a.origin.x)-a.angle;return dist(a.origin,q)<=a.radius&&Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=Math.PI*2/3;}
function cancelMorga(e){e.attack=null;e.state='idle';e.t=1;}
const morgaAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3b2')return morgaAnimateBase(e,dt);
 let shell=morgaShell(e),wasOpen=shell.open;if(!advanceMorgaShell(shell,dt,{player:p,world:dungeon,alive:e.hp>0&&!dead&&p.hp>0,paused:paused||!started})){cancelMorga(e);return;}if(paused||!started||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(wasOpen>0){e.attack=null;e.state='idle';e.t=1;dt=Math.max(0,dt-wasOpen);if(dt<=0)return;}if(shell.open>0){e.attack=null;e.state='idle';e.t=1;return;}if(e.reactionStun>0){cancelMorga(e);return;}
 let a=e.attack;if(!a||!['morgaSmash','morgaSweep','morgaStomp'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;let next=['morgaSmash','morgaSweep','morgaStomp'][(e.morgaCycle||0)%3],range=next==='morgaSmash'?400:260,d=dist(e,p),clear=lineClear(e,p);if(e.t<=0&&d<=range&&clear){beginMorga(e,next);e.morgaCycle=(e.morgaCycle||0)+1;return;}e.state='idle';if(d>850&&!e.bossProvoked||d<=range&&clear)return;
  if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let to=e.path?.[0];if(to){let dx=to.x-e.x,dy=to.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,70*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,32)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.origin)>24){cancelMorga(e);return;}e.elapsed+=dt;
 if(!a.fired&&e.elapsed+1e-8>=a.windup){a.fired=true;e.struck=true;let covered=morgaContains(a,p),eligible=dist(p,a.origin)<=500&&lineClear(a.origin,p);if(covered)hurt(a.phase===2?145:115);let broke=resolveMorgaImpact(shell,a,covered,eligible&&!dead&&p.hp>0);playSound('impact',e.x,e.y);if(broke){e.attack=null;e.state='idle';e.t=1;burst(e.x,e.y,140,'#e5ae65');return;}}
 if(e.elapsed>=a.end)cancelMorga(e);
};
const morgaResetBase=resetWorld;resetWorld=()=>{morgaShells=new WeakMap();return morgaResetBase();};
const morgaLoadBase=loadWorld;loadWorld=(...args)=>{morgaShells=new WeakMap();return morgaLoadBase(...args);};
const morgaDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{if(e.species!=='r3b2'||!morgaSheet.complete||!morgaSheet.naturalWidth||!morgaSheet.naturalHeight)return morgaDrawBase(e,size);let f=spriteFrame(e.state,e.anim||0),shell=morgaShells.get(e);if(e.hp<=0||shell?.open>0)f={row:2,col:3};else if(e.attack)f={row:2,col:e.elapsed<.5?0:e.elapsed<1.5?1:e.elapsed<1.85?2:3};let q=project(e.x,e.y),sw=morgaSheet.naturalWidth/4,sh=morgaSheet.naturalHeight/3,w=360,h=w*sh/sw;ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':shell?.open>0?'brightness(1.2)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,morgaSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.81,w,h);else ctx.drawImage(morgaSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*.81,w,h);ctx.restore();return true;};
const morgaSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3b2'?280:morgaSizeBase(e);
const morgaGroundBase=drawGroundEffects;drawGroundEffects=()=>{morgaGroundBase();for(let e of(typeof enemyRenderList==='function'?enemyRenderList('r3b2'):enemies)){if(e.species!=='r3b2'||e.hp<=0||!visibleAt(e.x,e.y))continue;let shell=morgaShells.get(e),a=e.attack;if(shell&&shell.owner===p&&shell.world===dungeon){if(shell.open>0){groundRing(e.x,e.y,85,'#ffcc7e',4);let q=project(e.x,e.y);ctx.save();ctx.strokeStyle='#ffcc7e';ctx.lineWidth=4;ctx.beginPath();ctx.arc(q.x,q.y-110,24,-Math.PI/2,-Math.PI/2+Math.PI*2*shell.open/6);ctx.stroke();ctx.restore();}else for(let i=0;i<shell.cracks;i++){let q=project(e.x,e.y);ctx.save();ctx.strokeStyle='#ffc476';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(q.x-10+i*16,q.y-105);ctx.lineTo(q.x-16+i*16,q.y-94);ctx.lineTo(q.x-8+i*16,q.y-90);ctx.stroke();ctx.restore();}}
 if(!a||a.fired||a.owner!==p||a.world!==dungeon)continue;if(a.pattern==='morgaSmash')groundRing(a.target.x,a.target.y,a.radius,'#efbd7b',2);else if(a.pattern==='morgaStomp'){groundRing(a.origin.x,a.origin.y,90,'#9bd7a7',2);groundRing(a.origin.x,a.origin.y,a.radius,'#efbd7b',2);}else if(a.pattern==='morgaSweep'){ctx.save();ctx.strokeStyle='#efbd7b';ctx.lineWidth=2;ctx.beginPath();let origin=project(a.origin.x,a.origin.y);ctx.moveTo(origin.x,origin.y);for(let i=0;i<=40;i++){let angle=a.angle-Math.PI*2/3+i/40*Math.PI*4/3,q=project(a.origin.x+Math.cos(angle)*a.radius,a.origin.y+Math.sin(angle)*a.radius);ctx.lineTo(q.x,q.y);}ctx.closePath();ctx.stroke();ctx.restore();}}};
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r3b2',animateEnemy,drawRegionEnemy);
