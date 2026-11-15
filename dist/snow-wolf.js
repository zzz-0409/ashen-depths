const snowWolfSheet=new Image();snowWolfSheet.assetSrc='assets/snow-wolf-v1.png';
function beginSnowWolf(e){e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'snowHowlPounce',bespoke:true,windup:.8,origin:{x:e.x,y:e.y},last:{x:e.x,y:e.y},ice:{x:p.x,y:p.y},howled:false,target:null,landed:false,hit:false,blocked:false};}
function lockSnowWolfPounce(e,a){let dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),reach=Math.min(d,360);a.target={x:e.x,y:e.y};for(let s=6;s<reach+6;s+=6){let r=Math.min(s,reach),q={x:e.x+dx/(d||1)*r,y:e.y+dy/(d||1)*r};if(!passable(q.x,q.y,18)||!lineClear(a.target,q,18))break;a.target=q;}e.facing=dx-dy<0?-1:1;a.windup=1.55;}
const snowWolfAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r5e0')return snowWolfAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||paused||dead||!Number.isFinite(dt)||dt<=0)return;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);let a=e.attack;
 if(a?.pattern!=='snowHowlPounce'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),clear=lineClear(e,p);if(e.t<=0&&d<=340&&clear){beginSnowWolf(e);return;}
  e.state='idle';if(d>800&&!e.aware)return;if(e.nav<=0){e.nav=.6;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let to=e.path?.[0];if(to){let dx=to.x-e.x,dy=to.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,120*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,18)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;
 }
 if(dist(e,a.last)>24){e.attack=null;e.state='idle';e.t=1.5;return;}
 e.elapsed=Math.round((e.elapsed+dt)*1e6)/1e6;
 if(!a.howled&&e.elapsed>=.8){a.howled=true;if(dist(p,a.ice)<=100+1e-8&&lineClear(a.origin,a.ice)&&lineClear(a.ice,p))hurt(38);burst(a.ice.x,a.ice.y,100,'#9fe9f7');playSound('frost',e.x,e.y);lockSnowWolfPounce(e,a);}
 if(a.target&&e.elapsed>=1.55&&!a.blocked){let t=e.elapsed>=1.9?1:Math.max(0,(e.elapsed-1.55)/.35),q={x:a.origin.x+(a.target.x-a.origin.x)*t,y:a.origin.y+(a.target.y-a.origin.y)*t},dx=q.x-e.x,dy=q.y-e.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/6));for(let i=0;i<n;i++){let x=e.x+dx/n,y=e.y+dy/n;if(!passable(x,y,18)||!lineClear(e,{x,y},18)){a.blocked=true;break;}e.x=x;e.y=y;}a.last={x:e.x,y:e.y};a.landed=t===1&&!a.blocked&&dist(e,a.target)<.01;}
 if(!a.hit&&e.elapsed>=1.9){a.hit=true;e.struck=true;if(a.landed&&dist(p,a.target)<=65+1e-8&&lineClear(a.target,p))hurt(70);if(a.landed){burst(e.x,e.y,65,'#d8f5fa');playSound('impact',e.x,e.y);}}
 if(e.elapsed>=2.65){e.attack=null;e.state='idle';e.t=2.3;}
};
const snowWolfDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r5e0'||!snowWolfSheet.complete||!snowWolfSheet.naturalWidth||!snowWolfSheet.naturalHeight)return snowWolfDrawBase(e,size);
 let f=spriteFrame(e.state,e.anim||0);if(e.hp<=0)f={row:2,col:3};else if(e.attack?.pattern==='snowHowlPounce')f={row:2,col:e.elapsed<.8?0:e.elapsed<1.55?1:e.elapsed<1.9?2:3};let q=project(e.x,e.y),sw=snowWolfSheet.naturalWidth/4,sh=snowWolfSheet.naturalHeight/3,w=205,h=w*sh/sw,anchor=[.87,.8,.82][f.row];
 ctx.save();ctx.translate(q.x,q.y);ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,snowWolfSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);else ctx.drawImage(snowWolfSheet,f.col*sw,f.row*sh,sw,sh,-w/2,-h*anchor,w,h);ctx.restore();return true;
};
const snowWolfSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r5e0'?140:snowWolfSizeBase(e);
const snowWolfGroundBase=drawGroundEffects;drawGroundEffects=()=>{snowWolfGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r5e0'):enemies)){let a=e.attack;if(e.species!=='r5e0'||e.hp<=0||a?.pattern!=='snowHowlPounce')continue;if(e.elapsed<1&&visibleAt(a.ice.x,a.ice.y)){groundRing(a.ice.x,a.ice.y,100,'#9fddea',2);if(!a.howled)groundRing(a.ice.x,a.ice.y,100*Math.max(0,1-e.elapsed/.8),'#e1faff',1);}if(a.target&&!a.hit&&!a.blocked&&visibleAt(a.target.x,a.target.y)){groundRing(a.target.x,a.target.y,65,'#efb16e',2);groundRing(a.target.x,a.target.y,65*Math.min(1,Math.max(0,(e.elapsed-.8)/.75)),'#ffe8ad',1);}}};
