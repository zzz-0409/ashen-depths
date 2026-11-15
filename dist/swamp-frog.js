const swampFrogSheet=new Image();swampFrogSheet.assetSrc='assets/swamp-frog-anim-v1.png';
function frogSafeStep(e,to){let from={x:e.x,y:e.y};if(!lineClear(from,to))return false;moveActor(e,to.x-e.x,to.y-e.y,22);if(Math.hypot(e.x-to.x,e.y-to.y)>1e-5){e.x=from.x;e.y=from.y;return false;}return true;}
function beginSwampFrog(e){let angle=Math.atan2(p.y-e.y,p.x-e.x),range=Math.min(300,dist(e,p)),probe={x:e.x,y:e.y};for(let d=10;d<range+10;d+=10){let step=Math.min(d,range),to={x:e.x+Math.cos(angle)*step,y:e.y+Math.sin(angle)*step};if(!frogSafeStep(probe,to))break;if(step===range)break;}
 e.state='attack';e.elapsed=0;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;e.attack={pattern:'frogLeap',bespoke:true,windup:.8,origin:{x:e.x,y:e.y},target:{x:probe.x,y:probe.y},angle,length:dist(e,probe),travelled:0,blocked:false,landed:false,rippleHit:false};
}
const frogAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r3e5')return frogAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||paused||dead||!Number.isFinite(dt)||dt<=0)return;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='frogLeap'){e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);if(e.t<=0&&distance<=330&&clear)beginSwampFrog(e);else{e.state='idle';if(distance>750&&!e.aware)return;if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,75*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,22)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;}}
 let a=e.attack,previous=e.elapsed;e.elapsed=Math.round((e.elapsed+dt)*1e6)/1e6;
 if(e.elapsed>=.8&&!a.blocked){let wanted=a.length*clamp((e.elapsed-.8)/.6,0,1);while(wanted-a.travelled>1e-7){let step=Math.min(10,wanted-a.travelled),to={x:e.x+Math.cos(a.angle)*step,y:e.y+Math.sin(a.angle)*step};if(!frogSafeStep(e,to)){a.blocked=true;break;}a.travelled+=step;}}
 if(!a.blocked&&e.elapsed>=1.4&&dist(e,a.target)<1e-5){e.x=a.target.x;e.y=a.target.y;a.travelled=a.length;}
 if(!a.landed&&e.elapsed>=1.4){a.landed=true;a.center={x:e.x,y:e.y};if(dist(a.center,p)<=65&&lineClear(a.center,p))hurt(45);playSound('impact',e.x,e.y);}
 if(a.landed&&!a.rippleHit&&e.elapsed>=1.6&&previous<2.6){let from=60+120*clamp(previous-1.6,0,1),to=60+120*clamp(e.elapsed-1.6,0,1),distance=dist(a.center,p);if(distance>=from-10&&distance<=to+10&&lineClear(a.center,p)){a.rippleHit=true;hurt(30);}}
 if(e.elapsed>=3.2){e.attack=null;e.state='idle';e.t=1.8;}
};
const frogDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r3e5'||!swampFrogSheet.complete||!swampFrogSheet.naturalWidth)return frogDrawBase(e,size);let a=e.attack,frame=spriteFrame(e.state,e.anim),height=0;
 if(a?.pattern==='frogLeap'){frame={row:2,col:e.elapsed<.8?0:e.elapsed<.95?1:e.elapsed<1.4?2:3};height=Math.sin(Math.PI*clamp((e.elapsed-.8)/.6,0,1))*85;}
 let q=project(e.x,e.y),sw=swampFrogSheet.naturalWidth/4,sh=swampFrogSheet.naturalHeight/3,w=120,h=w*sh/sw;ctx.save();ctx.translate(q.x,q.y-height);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,swampFrogSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.91,w,h);else ctx.drawImage(swampFrogSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.91,w,h);ctx.restore();return true;
};
const frogSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r3e5'?95:frogSizeBase(e);
const frogGroundBase=drawGroundEffects;drawGroundEffects=()=>{frogGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r3e5'):enemies)){let a=e.attack;if(e.species!=='r3e5'||e.hp<=0||a?.pattern!=='frogLeap')continue;let center=a.center||a.target;if(!visibleAt(center.x,center.y))continue;if(e.elapsed<1.4){groundRing(center.x,center.y,65,'#ffd69b',3);groundRing(center.x,center.y,65*clamp(e.elapsed/1.4,0,1),'#fff1cf',1);}else if(e.elapsed<1.6){groundRing(center.x,center.y,60,'#bcecff',3);}else if(e.elapsed<=2.6){let radius=60+120*(e.elapsed-1.6);groundRing(center.x,center.y,radius-10,'#6bb9d0',2);groundRing(center.x,center.y,radius+10,'#c3f6ff',3);}}};

