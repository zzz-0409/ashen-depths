const sandSpiritSheet=new Image();sandSpiritSheet.assetSrc='assets/desert-sand-spirit-v1.png';
function beginSandSpirit(e){let dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'sandSpiritVortices',bespoke:true,windup:.9,origin:{x:e.x,y:e.y},beds:[0,-1,1].map((side,i)=>({x:p.x-dy/d*120*side,y:p.y+dx/d*120*side,start:i*.6,hits:0,valid:false}))};for(let b of e.attack.beds)b.valid=lineClear(e,b);}
const sandSpiritAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r4e7')return sandSpiritAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||paused||dead||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);let a=e.attack;
 if(a?.pattern!=='sandSpiritVortices'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),clear=lineClear(e,p);if(e.t<=0&&d<=480&&clear){beginSandSpirit(e);return;}
  e.state='idle';if(d>800&&!e.aware||d<=280)return;
  if(e.nav<=0){e.nav=.7;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let to=e.path?.[0];if(to){let dx=to.x-e.x,dy=to.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,68*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,16)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(dist(e,a.origin)>24){e.attack=null;e.state='idle';e.t=1.5;return;}
 e.elapsed=Math.round((e.elapsed+dt)*1e6)/1e6;
 for(let b of a.beds){while(b.hits<4&&e.elapsed>=b.start+.9+b.hits*.5){b.hits++;e.struck=true;if(!b.valid||!lineClear(a.origin,b))continue;if(dist(p,b)<=85+1e-8&&lineClear(b,p))hurt(18);burst(b.x,b.y,85,'#d4ac78');if(b.hits===1)playSound('impact',b.x,b.y);}}
 if(e.elapsed>=4.2){e.attack=null;e.state='idle';e.t=2.8;}
};
const sandSpiritDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r4e7'||!sandSpiritSheet.complete||!sandSpiritSheet.naturalWidth||!sandSpiritSheet.naturalHeight)return sandSpiritDrawBase(e,size);
 let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack?.pattern==='sandSpiritVortices')f={row:2,col:e.elapsed<.45?0:e.elapsed<.9?1:e.elapsed<3.6?2:3};
 let q=project(e.x,e.y),sw=sandSpiritSheet.naturalWidth/4,sh=sandSpiritSheet.naturalHeight/3,w=210,h=w*sh/sw,anchor=[.9,.85,.83][f.row];
 ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,sandSpiritSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);else ctx.drawImage(sandSpiritSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);ctx.restore();return true;
};
const sandSpiritSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r4e7'?140:sandSpiritSizeBase(e);
const sandSpiritGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 sandSpiritGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r4e7'):enemies)){let a=e.attack;if(e.species!=='r4e7'||e.hp<=0||a?.pattern!=='sandSpiritVortices')continue;
 for(let b of a.beds){let t=e.elapsed-b.start;if(!b.valid||t<0||t>2.6||!visibleAt(b.x,b.y))continue;groundRing(b.x,b.y,85,t<.9?'#edc086':'#73dce4',t<.9?2:3);if(t<.9)groundRing(b.x,b.y,85*Math.max(0,1-t/.9),'#ffe2b7',1);else for(let i=0;i<3;i++)groundRing(b.x,b.y,15+((t*55+i*23)%70),'#b5956d',1);}
 }
};
