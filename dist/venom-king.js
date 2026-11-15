// Boss poison pools use bounded storage and one shared damage cadence.
function createVenomField(owner,world,player){return {owner,world,player,time:0,tick:0,pools:[]};}
function addVenomPool(field,point,damage=18){
 if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||!Number.isFinite(damage)||damage<=0)return false;
 field.pools.push({x:point.x,y:point.y,radius:70,damage,born:field.time,expires:field.time+12});
 if(field.pools.length>10)field.pools.splice(0,field.pools.length-10);
 return true;
}
function venomSegmentDistance(from,to,point){let dx=to.x-from.x,dy=to.y-from.y,length2=dx*dx+dy*dy,t=length2?Math.max(0,Math.min(1,((point.x-from.x)*dx+(point.y-from.y)*dy)/length2)):0;return Math.hypot(point.x-from.x-dx*t,point.y-from.y-dy*t);}
// Supply actual terrain-clipped movement, never an intended endpoint beyond a wall.
function clearVenomChargePath(field,from,to,radius=36){let before=field.pools.length;field.pools=field.pools.filter(pool=>venomSegmentDistance(from,to,pool)>pool.radius+radius+1e-8);return before-field.pools.length;}
function advanceVenomField(field,dt,state){
 if(field.owner.hp<=0||field.world!==state.world||field.player!==state.player||!state.enemies.includes(field.owner)||state.dead){field.pools=[];return;}
 if(!state.started||state.paused||!Number.isFinite(dt)||dt<=0)return;
 let end=field.time+dt,lastTick=Math.floor(end*2+1e-8),lastExpiry=field.pools.reduce((max,pool)=>Math.max(max,pool.expires),field.time);
 // At most 24 active ticks are possible because pools live for twelve seconds.
 let activeEnd=Math.min(lastTick,Math.ceil(lastExpiry*2));
 for(let tick=field.tick+1;tick<=activeEnd;tick++){
  let at=tick*.5,damage=0;
  if(!(state.player.inv>0))for(let pool of field.pools){if(at+1e-8<pool.born||at>=pool.expires-1e-8)continue;if(Math.hypot(pool.x-state.player.x,pool.y-state.player.y)<=pool.radius+1e-8&&state.lineClear(pool,state.player))damage=Math.max(damage,pool.damage);}
  if(damage>0){state.hurt(damage);if(state.player.hp<=0||state.dead){field.pools=[];break;}}
 }
 field.time=end;field.tick=lastTick;field.pools=field.pools.filter(pool=>pool.expires>end+1e-8);
}

// Fixed-direction boss charge; uses venom hazard helpers and injected world collision.
function planVenomCharge(owner,target,state,phase=1){
 let angle=Math.atan2(target.y-owner.y,target.x-owner.x),ux=Math.cos(angle),uy=Math.sin(angle),wanted=Math.min(420,Math.max(160,Math.hypot(target.x-owner.x,target.y-owner.y)+90)),origin={x:owner.x,y:owner.y},end={...origin},length=0;
 for(let distance=6;distance<wanted+6;distance+=6){let along=Math.min(distance,wanted),point={x:origin.x+ux*along,y:origin.y+uy*along};if(!state.passable(point.x,point.y,32)||!state.lineClear(end,point,32))break;end=point;length=along;}
 return {origin,end,angle,ux,uy,length,elapsed:0,last:{...origin},windup:1.4,duration:.6,phase,damage:phase===2?135:115,hit:false,cancelled:false,stopped:false,done:false};
}
function advanceVenomCharge(plan,owner,field,dt,state){
 if(plan.cancelled||plan.done||state.paused||state.dead||!state.started||!Number.isFinite(dt)||dt<=0)return;
 if(owner.hp<=0||owner.reactionStun>0||Math.hypot(owner.x-plan.last.x,owner.y-plan.last.y)>24){plan.cancelled=true;return;}
 let before=plan.elapsed;plan.elapsed+=dt;
 let progress=time=>Math.max(0,Math.min(1,(time-plan.windup)/plan.duration));
 let budget=(progress(plan.elapsed)-progress(before))*plan.length;
 while(!plan.stopped&&budget>1e-8){
  let step=Math.min(6,budget),from={x:owner.x,y:owner.y};
  let proposed={x:owner.x+plan.ux*step,y:owner.y+plan.uy*step};
  if(!state.passable(proposed.x,proposed.y,32)||!state.lineClear(from,proposed,32)){plan.stopped=true;break;}
  state.moveActor(owner,plan.ux*step,plan.uy*step,32);
  let to={x:owner.x,y:owner.y},travel=Math.hypot(to.x-from.x,to.y-from.y);
  if(travel>1e-8){clearVenomChargePath(field,from,to,36);if(!plan.hit&&venomSegmentDistance(from,to,state.player)<=36+1e-8&&state.lineClear(to,state.player)){plan.hit=true;if(!(state.player.inv>0))state.hurt(plan.damage);}}
  budget-=step;if(travel<step-1e-6)plan.stopped=true;
  if(state.player.hp<=0||state.dead)break;
 }
 plan.last={x:owner.x,y:owner.y};
 if(plan.elapsed+1e-8>=plan.windup+plan.duration+.9)plan.done=true;
}

const venomKingSheet=new Image();venomKingSheet.assetSrc='assets/venom-king-v2.png';
let venomKingFields=new WeakMap();
function venomKingState(){return {player:p,world:dungeon,enemies,started,paused,dead,passable,lineClear,moveActor,hurt};}
function venomKingField(e){let field=venomKingFields.get(e);if(!field||field.world!==dungeon||field.player!==p){field=createVenomField(e,dungeon,p);venomKingFields.set(e,field);}return field;}
function beginVenomKing(e,pattern='venomSpit',extra=false){
 let phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x),origin={x:e.x,y:e.y};
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 let a={pattern,bespoke:true,phase,angle,origin,windup:pattern==='venomSpit'?1.5:1.4,fired:false,end:pattern==='venomSpit'?2.5:2.9};
 if(pattern==='venomSpit'){let offsets=phase===2?[[0,0],[-100,80],[100,80],[-100,-80],[100,-80]]:[[0,0],[-100,80],[100,80]];a.marks=offsets.map(([x,y])=>({x:p.x+x,y:p.y+y,radius:70}));}
 if(pattern==='venomCharge'){a.charge=planVenomCharge(e,p,venomKingState(),phase);if(phase===2&&!extra)e.venomExtraCharge=true;}
 if(pattern==='venomTail')a.radius=phase===2?260:220;
 e.attack=a;venomKingField(e);
}
function venomTailContains(a,point){let dx=point.x-a.origin.x,dy=point.y-a.origin.y,angle=Math.atan2(dy,dx)-a.angle-Math.PI;angle=Math.atan2(Math.sin(angle),Math.cos(angle));return Math.hypot(dx,dy)<=a.radius&&Math.abs(angle)<=Math.PI*2/3&&lineClear(a.origin,point);}
const venomKingAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3b0')return venomKingAnimateBase(e,dt);
 let field=venomKingField(e);advanceVenomField(field,dt,venomKingState());
 if(e.hp<=0||paused||dead||!started||!Number.isFinite(dt)||dt<=0)return;
 if(e.reactionStun>0){if(e.attack){e.attack=null;e.venomExtraCharge=false;e.state='idle';e.t=1;}return;}
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);let a=e.attack;
 if(!a||!['venomSpit','venomCharge','venomTail'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;let next=e.venomExtraCharge?'venomCharge':['venomSpit','venomCharge','venomTail'][(e.venomCycle||0)%3],range=next==='venomTail'?260:450,d=dist(e,p),clear=lineClear(e,p);
  if(e.t<=0&&d<=range&&clear){let extra=!!e.venomExtraCharge;e.venomExtraCharge=false;beginVenomKing(e,next,extra);if(!extra)e.venomCycle=(e.venomCycle||0)+1;return;}
  e.state='idle';if(d>850&&!e.bossProvoked||d<=range&&clear)return;
  if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let to=e.path?.[0];if(to){let dx=to.x-e.x,dy=to.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,75*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,32)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.pattern!=='venomCharge'&&dist(e,a.origin)>24){e.attack=null;e.state='idle';e.t=1;e.venomExtraCharge=false;return;}
 e.elapsed+=dt;
 if(a.pattern==='venomCharge'){advanceVenomCharge(a.charge,e,field,dt,venomKingState());e.struck=a.charge.hit;if(a.charge.cancelled){e.attack=null;e.state='idle';e.t=1;e.venomExtraCharge=false;return;}}
 else if(!a.fired&&e.elapsed+1e-8>=a.windup){a.fired=true;e.struck=true;if(a.pattern==='venomSpit'){for(let mark of a.marks)if(passable(mark.x,mark.y,0)&&lineClear(a.origin,mark))addVenomPool(field,mark,a.phase===2?24:18);}else if(venomTailContains(a,p))hurt(a.phase===2?130:100);playSound('impact',e.x,e.y);}
 if(e.elapsed+1e-8>=a.end){e.attack=null;e.state='idle';e.t=.8;}
};
const venomKingResetBase=resetWorld;resetWorld=()=>{venomKingFields=new WeakMap();return venomKingResetBase();};
const venomKingLoadBase=loadWorld;loadWorld=(...args)=>{venomKingFields=new WeakMap();return venomKingLoadBase(...args);};
const venomKingDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{if(e.species!=='r3b0'||!venomKingSheet.complete||!venomKingSheet.naturalWidth||!venomKingSheet.naturalHeight)return venomKingDrawBase(e,size);let f=spriteFrame(e.state,e.anim||0),a=e.attack;if(e.hp<=0)f={row:2,col:3};else if(a){let col=a.pattern==='venomSpit'?(e.elapsed<1?0:e.elapsed<1.8?1:3):a.pattern==='venomCharge'?(e.elapsed<1.4?1:e.elapsed<2?2:3):(e.elapsed<1.4?0:3);f={row:2,col};}let q=project(e.x,e.y),sw=venomKingSheet.naturalWidth/4,sh=venomKingSheet.naturalHeight/3,w=470,h=w*sh/sw,anchor=[[.78,.78,.78,.78],[.75,.73,.71,.75],[.73,.73,.73,.73]][f.row][f.col];ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,venomKingSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);else ctx.drawImage(venomKingSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);ctx.restore();return true;};
const venomKingSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3b0'?330:venomKingSizeBase(e);
function venomKingPolygon(points,color){ctx.save();ctx.beginPath();points.forEach((point,i)=>{let q=project(point.x,point.y);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});ctx.closePath();ctx.fillStyle=color;ctx.strokeStyle='#ccec8b';ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore();}
const venomKingGroundBase=drawGroundEffects;drawGroundEffects=()=>{venomKingGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r3b0'):enemies)){if(e.species!=='r3b0'||e.hp<=0)continue;let field=venomKingFields.get(e);if(field&&field.player===p&&field.world===dungeon)for(let pool of field.pools){if(!visibleAt(pool.x,pool.y))continue;let q=project(pool.x,pool.y);ctx.save();ctx.fillStyle='#568a3d55';ctx.beginPath();ctx.ellipse(q.x,q.y,pool.radius*ISOX*Math.SQRT2,pool.radius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill();ctx.restore();groundRing(pool.x,pool.y,pool.radius,'#83c34a',3);groundRing(pool.x,pool.y,pool.radius*.65,'#b4df64',1);}let a=e.attack;if(!a||!visibleAt(e.x,e.y))continue;if(a.pattern==='venomSpit'&&!a.fired){for(let mark of a.marks)if(passable(mark.x,mark.y,0)&&lineClear(a.origin,mark))groundRing(mark.x,mark.y,70,'#d6ed8c',2);}else if(a.pattern==='venomCharge'&&e.elapsed<2){let c=a.charge,ux=c.ux,uy=c.uy;venomKingPolygon([{x:c.origin.x-uy*36,y:c.origin.y+ux*36},{x:c.end.x-uy*36,y:c.end.y+ux*36},{x:c.end.x+uy*36,y:c.end.y-ux*36},{x:c.origin.x+uy*36,y:c.origin.y-ux*36}],'#dcbd5a33');}else if(a.pattern==='venomTail'&&e.elapsed<1.7){let points=[a.origin];for(let i=0;i<=24;i++){let angle=a.angle+Math.PI-Math.PI*2/3+i/24*Math.PI*4/3;points.push({x:a.origin.x+Math.cos(angle)*a.radius,y:a.origin.y+Math.sin(angle)*a.radius});}venomKingPolygon(points,a.fired?'#e6d38a88':'#d9ac5c33');}}};
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r3b0',animateEnemy,drawRegionEnemy);
