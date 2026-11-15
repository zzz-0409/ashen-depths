const rotMotherSheet=new Image();rotMotherSheet.assetSrc='assets/rot-mother-v2.png';
function beginRotMother(e,pattern='rotSweep'){
 let phase=e.hp/e.max<=.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x);e.state='attack';e.elapsed=0;e.struck=false;e.phase=phase;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern,bespoke:true,phase,owner:p,world:dungeon,origin:{x:e.x,y:e.y},angle,windup:1.6,duration:pattern==='rotSweep'?2:2.4,end:pattern==='rotSweep'?4.6:5.8,hit:false,coreFired:false};
}
function rotMotherAngleInSweep(theta,from,to,half){for(let k=-2;k<=2;k++){let a=theta+k*Math.PI*2;if(a>=from-half-1e-8&&a<=to+half+1e-8)return true;}return false;}
function rotMotherContains(a,q,before,after){
 if(after+1e-8<a.windup||before>a.windup+a.duration+1e-8||!lineClear(a.origin,q))return false;
 let t0=Math.max(0,Math.min(1,(before-a.windup)/a.duration)),t1=Math.max(0,Math.min(1,(after-a.windup)/a.duration)),r=dist(a.origin,q);
 if(a.pattern==='rotCage'){let outer=440-t0*360,inner=440-t1*360;return r>=inner-22&&r<=outer+22;}
 if(r<80||r>400)return false;
 let theta=Math.atan2(q.y-a.origin.y,q.x-a.origin.x),count=a.phase===2?3:2,arc=a.phase===2?Math.PI*2/3:Math.PI/2,half=Math.asin(Math.min(1,20/r));
 for(let i=0;i<count;i++){let base=a.angle+i*Math.PI*2/count;if(rotMotherAngleInSweep(theta,base+t0*arc,base+t1*arc,half))return true;}return false;
}
function cancelRotMother(e){e.attack=null;e.state='idle';e.t=1.2;}
const rotMotherAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3b3')return rotMotherAnimateBase(e,dt);
 if(e.hp<=0||dead||p.hp<=0){cancelRotMother(e);return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 e.anim=(e.anim||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(e.reactionStun>0){cancelRotMother(e);return;}
 let a=e.attack;if(!a||!['rotSweep','rotCage'].includes(a.pattern)){
  e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),clear=lineClear(e,p);if(e.t<=0&&d<=390&&clear){beginRotMother(e,(e.rotMotherCycle||0)%2?'rotCage':'rotSweep');e.rotMotherCycle=(e.rotMotherCycle||0)+1;return;}e.state='idle';if(d>850&&!e.bossProvoked||d<=300&&clear)return;
  if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let q=e.path?.[0];if(q){let dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,65*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,32)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(a.owner!==p||a.world!==dungeon||dist(e,a.origin)>24){cancelRotMother(e);return;}
 let before=e.elapsed;e.elapsed+=dt;if(!a.hit&&rotMotherContains(a,p,before,e.elapsed)){a.hit=true;hurt(a.phase===2?135:105);playSound('impact',p.x,p.y);}if(before<a.windup&&e.elapsed>=a.windup){e.struck=true;playSound('fire',e.x,e.y);}if(a.pattern==='rotCage'&&!a.coreFired&&e.elapsed+1e-8>=4.8){a.coreFired=true;if(dist(a.origin,p)<=120&&lineClear(a.origin,p))hurt(a.phase===2?155:125);playSound('impact',e.x,e.y);}if(e.elapsed>=a.end)cancelRotMother(e);
};
const rotMotherDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r3b3'||!rotMotherSheet.complete||!rotMotherSheet.naturalWidth||!rotMotherSheet.naturalHeight)return rotMotherDrawBase(e,size);
 let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack)f={row:2,col:e.elapsed<.6?0:e.elapsed<1.6?1:e.elapsed<3.6?2:3};let q=project(e.x,e.y),sw=rotMotherSheet.naturalWidth/4,sh=rotMotherSheet.naturalHeight/3,w=440,h=w*sh/sw;
 ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,rotMotherSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*([.83,.80,.76][f.row]),w,h);else ctx.drawImage(rotMotherSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*([.83,.80,.76][f.row]),w,h);ctx.restore();return true;
};
const rotMotherSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3b3'?280:rotMotherSizeBase(e);
const rotMotherGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 rotMotherGroundBase();for(let e of(typeof enemyRenderList==='function'?enemyRenderList('r3b3'):enemies)){let a=e.attack;if(e.species!=='r3b3'||e.hp<=0||!a||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y)||e.elapsed>a.end)continue;
 let progress=Math.max(0,Math.min(1,(e.elapsed-a.windup)/a.duration)),color=e.elapsed<a.windup?'#e1c98d':'#d98657';
 if(a.pattern==='rotCage'){if(e.elapsed>=3.4&&!a.coreFired)groundRing(a.origin.x,a.origin.y,120,'#f0b36d',3);if(e.elapsed>a.windup+a.duration)continue;let r=440-progress*360;groundRing(a.origin.x,a.origin.y,r-22,color,2);groundRing(a.origin.x,a.origin.y,r+22,color,2);groundRing(a.origin.x,a.origin.y,58,'#91d9b1',1);}
 else if(a.pattern==='rotSweep'){if(e.elapsed>a.windup+a.duration)continue;let count=a.phase===2?3:2,arc=a.phase===2?Math.PI*2/3:Math.PI/2;groundRing(a.origin.x,a.origin.y,80,'#91d9b1',1);for(let i=0;i<count;i++){let angle=a.angle+i*Math.PI*2/count+progress*arc,ux=Math.cos(angle),uy=Math.sin(angle);for(let side of [-1,1]){let from=project(a.origin.x+ux*80-uy*20*side,a.origin.y+uy*80+ux*20*side),to=project(a.origin.x+ux*400-uy*20*side,a.origin.y+uy*400+ux*20*side);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();ctx.restore();}}}
 }
};
if(typeof registerDirectEnemy==='function')registerDirectEnemy('r3b3',animateEnemy,drawRegionEnemy);
