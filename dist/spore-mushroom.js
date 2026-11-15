// A rooted ranged enemy: three committed, staggered spore impacts.
function beginSporeVolley(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x)+Math.PI/2;
 e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'sporeVolley',bespoke:true,windup:.8,radius:80,origin:{x:e.x,y:e.y},target:{x:p.x,y:p.y},marks:[0,-1,1].map((side,i)=>({x:p.x+Math.cos(angle)*side*120,y:p.y+Math.sin(angle)*side*120,at:1.4+i*.55,done:false}))};
 e.facing=p.x-e.x-(p.y-e.y)<0?-1:1;
}
const sporeAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0e6')return sporeAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0)return;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.state!=='attack'){e.state='idle';e.t-=dt;if(e.t<=0&&dist(e,p)<=360&&lineClear(e,p))beginSporeVolley(e);return}
 let a=e.attack;if(a?.pattern!=='sporeVolley'){e.state='idle';e.attack=null;return}e.elapsed+=dt;
 for(let mark of a.marks)if(!mark.done&&e.elapsed>=mark.at){mark.done=true;if(dist(mark,p)<=a.radius&&lineClear(a.origin,mark)&&lineClear(mark,p))hurt(22);burst(mark.x,mark.y,a.radius,'#badb67');emit(mark.x,mark.y,12,'#d0ef77')}
 if(a.marks.every(mark=>mark.done))e.struck=true;
 if(e.elapsed>=3.3){e.state='idle';e.t=2;e.attack=null}
};
const sporeSheet=new Image();sporeSheet.assetSrc='assets/spore-mushroom-anim.png';
const sporeDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0e6')return sporeDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame={row:0,col:Math.floor(e.anim*3)%4};
 if(a?.pattern==='sporeVolley')frame=e.elapsed<.8?{row:1,col:Math.min(3,Math.floor(e.elapsed/.2))}:{row:2,col:e.elapsed>=2.5?3:Math.min(2,Math.floor(((e.elapsed-.8)%.55)/.55*3))};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,30,10,0,0,Math.PI*2);ctx.fill();
 if(sporeSheet.complete&&sporeSheet.naturalWidth){let sw=sporeSheet.naturalWidth/4,sh=sporeSheet.naturalHeight/3,w=105,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,sporeSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);else ctx.drawImage(sporeSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h)}ctx.restore();return true;
};
function drawSporeEffects(ground){for(let e of enemies){let a=e.attack;if(e.species!=='r0e6'||e.hp<=0||a?.pattern!=='sporeVolley'||!visibleAt(e.x,e.y))continue;ctx.save();for(let mark of a.marks){if(mark.done)continue;let s=project(mark.x,mark.y),progress=clamp(e.elapsed/mark.at,0,1);if(ground){ctx.fillStyle='#9abd3824';ctx.strokeStyle='#d3ec85';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y,a.radius*ISOX*Math.SQRT2,a.radius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill();ctx.stroke();groundRing(mark.x,mark.y,a.radius*progress,'#e2f4a3',1)}let flight=clamp((e.elapsed-(mark.at-.6))/.6,0,1);if(!ground&&flight>0&&flight<1){let from=project(a.origin.x,a.origin.y),x=from.x+(s.x-from.x)*flight,y=from.y+(s.y-from.y)*flight-35*(1-flight)-Math.sin(flight*Math.PI)*75;circle(x,y,7,'#b5db68');circle(x-2,y-2,3,'#efffc4')}}ctx.restore()}};

const sporeGroundBase=drawGroundEffects;drawGroundEffects=()=>{sporeGroundBase();drawSporeEffects(true)};
const sporeAirBase=drawEffects;drawEffects=()=>{sporeAirBase();drawSporeEffects(false)};

