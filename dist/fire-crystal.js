const fireCrystalSheet=new Image();fireCrystalSheet.assetSrc='assets/fire-crystal-v1.png';
let fireWardMembers=new Set(),fireWardTargets=new WeakMap(),fireWardSources=[],fireWardRefresh=0;
function fireWardEligible(e){return e.hp>0&&!e.boss&&!e.secret&&!e.ex&&!e.dummy&&e.species!=='r7e1';}
function fireWardActive(e){return e.hp>0&&!(e.reactionStun>0)&&!(e.fireVent>0)&&fireWardMembers.has(e);}
function rebuildFireWards(dt){
 fireWardMembers=new Set(enemies);fireWardRefresh-=dt;
 let sources=enemies.filter(e=>e.species==='r7e1'&&e.hp>0);
 if(fireWardRefresh>0&&sources.length===fireWardSources.length&&sources.every((e,i)=>e===fireWardSources[i]))return;
 fireWardRefresh=.25;fireWardSources=sources;fireWardTargets=new WeakMap();
 for(let source of sources){source.fireLinks=enemies.filter(e=>fireWardEligible(e)&&dist(source,e)<=260&&lineClear(source,e)).sort((a,b)=>dist(source,a)-dist(source,b)).slice(0,3);for(let target of source.fireLinks){let list=fireWardTargets.get(target)||[];list.push(source);fireWardTargets.set(target,list);}}
}
function fireWardProtects(e){return fireWardEligible(e)&&fireWardMembers.has(e)&&(fireWardTargets.get(e)||[]).some(source=>fireWardActive(source)&&dist(source,e)<=260&&lineClear(source,e));}
const fireCrystalHitBase=hit;hit=(e,d)=>fireCrystalHitBase(e,d*(!e.dotTick&&fireWardProtects(e)?.7:1));
const fireCrystalUpdateBase=update;update=dt=>{if(started&&!paused&&!dead&&Number.isFinite(dt)&&dt>0)rebuildFireWards(dt);return fireCrystalUpdateBase(dt);};
const fireCrystalResetBase=resetWorld;resetWorld=()=>{fireWardMembers=new Set();fireWardTargets=new WeakMap();fireWardSources=[];fireWardRefresh=0;return fireCrystalResetBase();};
function beginFireCrystal(e){e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'fireWardPulse',bespoke:true,windup:1.4,origin:{x:e.x,y:e.y},fired:false};}
const fireCrystalAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r7e1')return fireCrystalAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||paused||dead||!Number.isFinite(dt)||dt<=0)return;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.fireVent>0){e.fireVent=Math.max(0,Math.round((e.fireVent-dt)*1e6)/1e6);e.state='idle';e.attack=null;return;}
 let a=e.attack;if(a?.pattern!=='fireWardPulse'){e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),clear=lineClear(e,p);if(e.t<=0&&d<=200&&clear){beginFireCrystal(e);return;}e.state='idle';if(d>800&&!e.aware||d<=140)return;if(e.nav<=0){e.nav=.7;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let to=e.path?.[0];if(to){let dx=to.x-e.x,dy=to.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,62*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,18)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;}
 if(dist(e,a.origin)>24){e.attack=null;e.state='idle';e.t=1.5;return;}e.elapsed=Math.round((e.elapsed+dt)*1e6)/1e6;
 if(!a.fired&&e.elapsed>=1.4){a.fired=true;e.struck=true;e.fireVent=Math.max(0,1.8-Math.max(0,e.elapsed-1.4));if(dist(p,a.origin)<=160+1e-8&&lineClear(a.origin,p))hurt(48);burst(a.origin.x,a.origin.y,160,'#ffbc78');playSound('fire',e.x,e.y);e.attack=null;e.state='idle';e.t=1.2;}
};
const fireCrystalDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{if(e.species!=='r7e1'||!fireCrystalSheet.complete||!fireCrystalSheet.naturalWidth||!fireCrystalSheet.naturalHeight)return fireCrystalDrawBase(e,size);let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0||e.fireVent>0)f={row:2,col:3};else if(e.attack?.pattern==='fireWardPulse')f={row:2,col:e.elapsed<.5?0:e.elapsed<1?1:2};let q=project(e.x,e.y),sw=fireCrystalSheet.naturalWidth/4,sh=fireCrystalSheet.naturalHeight/3,w=220,h=w*sh/sw,anchor=.82;ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,fireCrystalSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);else ctx.drawImage(fireCrystalSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);ctx.restore();return true;};
const fireCrystalSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r7e1'?145:fireCrystalSizeBase(e);
const fireCrystalGroundBase=drawGroundEffects;drawGroundEffects=()=>{fireCrystalGroundBase();for(let e of fireWardSources){if(e.hp<=0||!fireWardMembers.has(e))continue;if(fireWardActive(e))for(let target of e.fireLinks||[]){if(!fireWardEligible(target)||!fireWardMembers.has(target)||dist(e,target)>260||!lineClear(e,target)||!visibleAt(target.x,target.y))continue;groundRing(target.x,target.y,26,'#ffc978',2);let q=project(e.x,e.y),r=project(target.x,target.y);ctx.save();ctx.strokeStyle='#ffc97866';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(r.x,r.y);ctx.stroke();ctx.restore();}if(!visibleAt(e.x,e.y))continue;let a=e.attack;if(a?.pattern==='fireWardPulse')groundRing(a.origin.x,a.origin.y,160,'#ff9158',2);if(e.fireVent>0)groundRing(e.x,e.y,34,'#9bddcf',2);}};
