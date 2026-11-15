// A committed hammer strike sends three fissures forward; sidestepping beats chasing.
function beginMinerHammer(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x),center={x:e.x,y:e.y};
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'minerHammer',bespoke:true,center,angle,windup:1.45,marks:[80,175,270].map((length,i)=>({x:center.x+Math.cos(angle)*length,y:center.y+Math.sin(angle)*length,radius:i?58:82,at:1.45+i*.35,hit:false}))};
}
const minerAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1e2')return minerAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=290&&lineClear(e,p))beginMinerHammer(e);
 let a=e.attack;if(a?.pattern!=='minerHammer')return minerAnimateBase(e,dt);
 e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 for(let [i,mark]of a.marks.entries())if(!mark.hit&&e.elapsed>=mark.at){mark.hit=true;if(lineClear(a.center,mark)){if(dist(mark,p)<=mark.radius&&lineClear(mark,p))hurt(i?28:48);burst(mark.x,mark.y,mark.radius,'#e2b86c');if(typeof playSound==='function')playSound('impact',mark.x,mark.y);}}
 e.struck=a.marks.every(mark=>mark.hit);if(e.elapsed>=3.65){e.state='idle';e.attack=null;e.t=1.1;}
};
const minerSheet=new Image();minerSheet.assetSrc='assets/cave-miner-anim.png';
const minerDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1e2')return minerDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(a?.pattern==='minerHammer')frame={row:2,col:e.elapsed<.6?0:e.elapsed<a.windup?1:e.elapsed<a.windup+.35?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,28,10,0,0,Math.PI*2);ctx.fill();
 if(minerSheet.complete&&minerSheet.naturalWidth){let sw=minerSheet.naturalWidth/4,sh=minerSheet.naturalHeight/3,w=180,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,minerSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.9,w,h);else ctx.drawImage(minerSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.9,w,h);}ctx.restore();return true;
};
const minerGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 minerGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r1e2'):enemies)){let a=e.attack;if(e.species!=='r1e2'||e.hp<=0||a?.pattern!=='minerHammer'||!visibleAt(e.x,e.y))continue;
  ctx.save();for(let mark of a.marks){if(!lineClear(a.center,mark))continue;let until=mark.at-e.elapsed;if(until<-.25)continue;ctx.globalAlpha=until<0?1:Math.min(1,.35+e.elapsed/mark.at*.65);groundRing(mark.x,mark.y,mark.radius,until<0?'#ffe6a4':'#d5a857',until<0?3:1.5);if(until>0)groundRing(mark.x,mark.y,mark.radius*clamp(e.elapsed/mark.at,0,1),'#e1b86c',1);}ctx.restore();
 }
};
const minerSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r1e2'?180:minerSizeBase(e);
