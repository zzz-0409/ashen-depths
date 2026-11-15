// Roots advance along a committed line. Sidestepping escapes the whole sequence.
function beginRootMarch(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x),origin={x:e.x,y:e.y};
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'rootMarch',bespoke:true,origin,angle,windup:1.3,marks:[90,180,270,360].map((d,i)=>({x:e.x+Math.cos(angle)*d,y:e.y+Math.sin(angle)*d,at:1.3+i*.35,radius:65,hit:false})).filter(m=>lineClear(origin,m))};
}
const rootAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2e4')return rootAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=390&&lineClear(e,p))beginRootMarch(e);
 let a=e.attack;if(a?.pattern!=='rootMarch')return rootAnimateBase(e,dt);
 e.anim+=dt;e.elapsed+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 for(let m of a.marks)if(!m.hit&&e.elapsed>=m.at){m.hit=true;if(lineClear(a.origin,m)){if(dist(m,p)<=m.radius&&lineClear(m,p))hurt(58);burst(m.x,m.y,60,'#b2cf76');if(typeof playSound==='function')playSound('impact',m.x,m.y);}}
 e.struck=a.marks.every(m=>m.hit);if(e.elapsed>=3.6){e.attack=null;e.state='idle';e.t=1.3;}
};
function rootBranch(points,width,color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
const rootSheet=new Image();rootSheet.assetSrc='assets/forest-root-anim.png';
const rootDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2e4')return rootDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(a?.pattern==='rootMarch')frame={row:2,col:e.elapsed<a.windup*.45?0:e.elapsed<a.windup?1:e.elapsed<2.5?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(-(e.facing||1),1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,40,13,0,0,Math.PI*2);ctx.fill();
 if(rootSheet.complete&&rootSheet.naturalWidth){let sw=rootSheet.naturalWidth/4,sh=rootSheet.naturalHeight/3,w=230,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,rootSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*[.86,.84,.82][frame.row],w,h);else ctx.drawImage(rootSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*[.86,.84,.82][frame.row],w,h);}ctx.restore();return true;
};
const rootGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 rootGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r2e4'):enemies)){let a=e.attack;if(e.species!=='r2e4'||e.hp<=0||a?.pattern!=='rootMarch')continue;
 for(let m of a.marks){let age=e.elapsed-m.at;if(!visibleAt(m.x,m.y)||age>.55)continue;ctx.save();groundRing(m.x,m.y,m.radius,age<0?'#b8ce82':'#f0e8a2',2);
 if(age<0)groundRing(m.x,m.y,m.radius*clamp(e.elapsed/m.at,0,1),'#94af66',1);
 else{let s=project(m.x,m.y),height=Math.sin(age/.55*Math.PI)*65;ctx.globalAlpha=1-age/.55;for(let i=-1;i<=1;i++)rootBranch([[s.x+i*22,s.y+4],[s.x+i*16,s.y-height],[s.x+i*8,s.y-height-12]],8,'#adbc79');}ctx.restore();}
 }
};
const rootSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2e4'?230:rootSizeBase(e);
