// Each seed locks the player's position at a different time, then blooms in place.
function forestSporeMark(e,time){
 let a=e.attack;if(!lineClear(a.origin,p)||dist(a.origin,p)>420)return;
 a.marks.push({x:p.x,y:p.y,placed:time,at:time+1.1,pulses:0});
}
function beginForestBloom(e){
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=p.x-e.x-(p.y-e.y)<0?-1:1;
 e.attack={pattern:'forestBloom',bespoke:true,windup:1.1,origin:{x:e.x,y:e.y},radius:65,marks:[],seeds:1};forestSporeMark(e,0);
}
const forestBloomAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2e6')return forestBloomAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='forestBloom'){e.state='idle';e.t-=dt;if(e.t<=0&&dist(e,p)<=380&&lineClear(e,p))beginForestBloom(e);else return;}
 let a=e.attack;e.elapsed+=dt;
 while(a.seeds<3&&e.elapsed>=a.seeds*.75){forestSporeMark(e,a.seeds*.75);a.seeds++;}
 for(let mark of a.marks)while(mark.pulses<3&&e.elapsed+1e-8>=mark.at+mark.pulses*.5){
  mark.pulses++;if(dist(mark,p)<=a.radius&&lineClear(a.origin,mark)&&lineClear(mark,p))hurt(18);
  burst(mark.x,mark.y,a.radius,'#9bd360');if(mark.pulses===1)playSound('poison',mark.x,mark.y);
 }
 e.struck=a.seeds===3&&a.marks.every(m=>m.pulses===3);
 if(e.elapsed>=4.2){e.state='idle';e.attack=null;e.t=2;}
};
const forestBloomDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2e6')return forestBloomDrawBase(e,size);
 let pos=project(e.x,e.y),a=e.attack,frame={row:0,col:Math.floor(e.anim*3)%4};
 if(e.hp>0&&a?.pattern==='forestBloom')frame=e.elapsed<1.5?{row:1,col:Math.floor(e.elapsed/.2)%4}:{row:2,col:e.elapsed<2.6?1:e.elapsed<3.6?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,32,11,0,0,Math.PI*2);ctx.fill();
 if(sporeSheet.complete&&sporeSheet.naturalWidth){let sw=sporeSheet.naturalWidth/4,sh=sporeSheet.naturalHeight/3,w=125,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'hue-rotate(25deg)';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,sporeSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);else ctx.drawImage(sporeSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.86,w,h);}
 ctx.restore();return true;
};
const forestBloomSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2e6'?125:forestBloomSizeBase(e);
const forestBloomGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 forestBloomGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r2e6'):enemies)){let a=e.attack;if(e.species!=='r2e6'||e.hp<=0||a?.pattern!=='forestBloom')continue;
  for(let mark of a.marks){if(mark.pulses===3||!visibleAt(mark.x,mark.y))continue;let pos=project(mark.x,mark.y),active=e.elapsed>=mark.at,progress=clamp((e.elapsed-mark.placed)/1.1,0,1);
   ctx.save();ctx.beginPath();ctx.ellipse(pos.x,pos.y,a.radius*ISOX*Math.SQRT2,a.radius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fillStyle=active?'#82c34255':'#b2d76e18';ctx.fill();groundRing(mark.x,mark.y,a.radius,active?'#aee96e':'#dbeaa8',active?2.5:1.5);
   if(!active)groundRing(mark.x,mark.y,a.radius*progress,'#cde996',1);
   else for(let i=0;i<5;i++){let angle=i*Math.PI*2/5+e.elapsed,r=25+8*Math.sin(i+e.elapsed*3),q=project(mark.x+Math.cos(angle)*r,mark.y+Math.sin(angle)*r);circle(q.x,q.y-8-(e.elapsed*15+i*7)%24,2.5,'#c2ee80');}
   ctx.restore();
  }
 }
};
