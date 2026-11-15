function beginThornVolley(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x),origin={x:e.x,y:e.y};
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'thornVolley',bespoke:true,windup:1.2,origin,angle,arrows:[-.3,.3,0].map((offset,i)=>({angle:angle+offset,at:1.2+i*.45,fired:false}))};
}
const thornAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2e3')return thornAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=460&&lineClear(e,p))beginThornVolley(e);
 let a=e.attack;if(a?.pattern!=='thornVolley')return thornAnimateBase(e,dt);
 e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 for(let arrow of a.arrows)if(!arrow.fired&&e.elapsed>=arrow.at){arrow.fired=true;shots.push({x:a.origin.x,y:a.origin.y,vx:Math.cos(arrow.angle)*360,vy:Math.sin(arrow.angle)*360,life:500/360,damage:44,enemy:true,art:'woodArrow',thorn:true});if(typeof playSound==='function')playSound('arrow',e.x,e.y);}
 e.struck=a.arrows.every(arrow=>arrow.fired);if(e.elapsed>=3.25){e.state='idle';e.attack=null;e.t=1.2;}
};
const thornSheet=new Image();thornSheet.assetSrc='assets/forest-thorn-anim.png';
const thornDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2e3')return thornDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(e.hp>0&&a?.pattern==='thornVolley'){let next=a.arrows.findIndex(arrow=>e.elapsed<arrow.at+.15);if(next<0)frame={row:2,col:3};else{let arrow=a.arrows[next],start=next?a.arrows[next-1].at+.15:0;frame={row:2,col:e.elapsed>=arrow.at?2:e.elapsed<start+(arrow.at-start)*.4?0:1};}}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(-(e.facing||1),1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,22,8,0,0,Math.PI*2);ctx.fill();
 if(thornSheet.complete&&thornSheet.naturalWidth){let sw=thornSheet.naturalWidth/4,sh=thornSheet.naturalHeight/3,w=150,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,thornSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*[.89,.86,.88][frame.row],w,h);else ctx.drawImage(thornSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*[.89,.86,.88][frame.row],w,h);}ctx.restore();return true;
};
function thornLaneOutline(origin,angle,length){
 let points=[],forward={x:Math.cos(angle),y:Math.sin(angle)};
 for(let end of [1,0])for(let i=0;i<=12;i++){let a=angle+(end?-.5:.5)*Math.PI+i*Math.PI/12;points.push({x:origin.x+forward.x*length*end+Math.cos(a)*ENEMY_PROJECTILE_HIT_RADIUS,y:origin.y+forward.y*length*end+Math.sin(a)*ENEMY_PROJECTILE_HIT_RADIUS});}
 return points;
}
const thornGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 thornGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r2e3'):enemies)){let a=e.attack;if(e.species!=='r2e3'||e.hp<=0||a?.pattern!=='thornVolley'||!visibleAt(e.x,e.y))continue;
 let next=a.arrows.find(arrow=>!arrow.fired);ctx.save();for(let arrow of a.arrows){if(arrow.fired)continue;let length=wispBeamLength(a.origin,arrow.angle),from=project(a.origin.x,a.origin.y),to=project(a.origin.x+Math.cos(arrow.angle)*length,a.origin.y+Math.sin(arrow.angle)*length);ctx.fillStyle=arrow===next?'#efd39722':'#8da77812';ctx.beginPath();thornLaneOutline(a.origin,arrow.angle,length).forEach((point,i)=>{let s=project(point.x,point.y);i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y)});ctx.closePath();ctx.fill();ctx.strokeStyle=arrow===next?'#efd397':'#8da778';ctx.lineWidth=arrow===next?2:1;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();}ctx.restore();
 }
};
const thornArrowBase=drawWoodArrow;drawWoodArrow=s=>{
 if(!s.thorn)return thornArrowBase(s);let length=Math.hypot(s.vx,s.vy)||1,head=project(s.x,s.y),tail=project(s.x-s.vx/length*32,s.y-s.vy/length*32),angle=Math.atan2(head.y-tail.y,head.x-tail.x);
 ctx.save();ctx.globalCompositeOperation='source-over';ctx.translate(head.x,head.y);ctx.rotate(angle);ctx.strokeStyle='#c1cf85';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-32,0);ctx.lineTo(0,0);ctx.moveTo(-12,0);ctx.lineTo(-19,-5);ctx.moveTo(-21,0);ctx.lineTo(-27,5);ctx.stroke();ctx.fillStyle='#e7dfb3';ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(-8,-4);ctx.lineTo(-6,0);ctx.lineTo(-8,4);ctx.closePath();ctx.fill();ctx.restore();
};
const thornSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2e3'?150:thornSizeBase(e);
