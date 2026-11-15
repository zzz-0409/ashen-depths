// A committed leap followed by a rear claw punishes chasing immediately behind it.
function beginPantherLeap(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x),length=Math.min(350,dist(e,p)+60),target={x:e.x,y:e.y};
 for(let d=8;d<=length;d+=8){let next={x:e.x+Math.cos(angle)*d,y:e.y+Math.sin(angle)*d};if(!passable(next.x,next.y,16)||!lineClear(target,next))break;target=next;}
 e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'pantherLeap',bespoke:true,origin:{x:e.x,y:e.y},target,angle,windup:1.05,travel:.38,radius:80,landed:false,clawed:false};
}
function pantherClawContains(e,point){let a=e.attack,angle=Math.atan2(point.y-e.y,point.x-e.x)-(a.angle+Math.PI);return dist(e,point)<=120&&Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=.85;}
const pantherAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2e5')return pantherAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=360&&lineClear(e,p))beginPantherLeap(e);
 let a=e.attack;if(a?.pattern!=='pantherLeap')return pantherAnimateBase(e,dt);
 let previous=e.elapsed;e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 let from=clamp((previous-a.windup)/a.travel,0,1),to=clamp((e.elapsed-a.windup)/a.travel,0,1);
 if(to>from){let dx=(a.target.x-a.origin.x)*(to-from),dy=(a.target.y-a.origin.y)*(to-from),steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));for(let i=0;i<steps;i++){let x=e.x+dx/steps,y=e.y+dy/steps;if(!passable(x,y,16))break;e.x=x;e.y=y;}}
 if(!a.landed&&e.elapsed>=a.windup+a.travel){a.landed=true;if(dist(e,p)<=a.radius&&lineClear(e,p))hurt(65);burst(e.x,e.y,a.radius,'#b8d992');playSound('impact',e.x,e.y);}
 if(!a.clawed&&e.elapsed>=2.05){a.clawed=true;if(pantherClawContains(e,p)&&lineClear(e,p))hurt(42);burst(e.x,e.y,50,'#e3c582');playSound('slash',e.x,e.y);}
 e.struck=a.landed&&a.clawed;if(e.elapsed>=2.8){e.state='idle';e.t=1.4;e.attack=null;}
};
const pantherSheet=new Image();pantherSheet.assetSrc='assets/forest-panther-anim.png';
const pantherDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2e5')return pantherDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim),lift=0;
 if(e.hp>0&&a?.pattern==='pantherLeap'){let t=e.elapsed-a.windup;frame={row:2,col:t<0?0:t<a.travel*.35?1:t<a.travel?2:3};if(t>0&&t<a.travel)lift=Math.sin(t/a.travel*Math.PI)*45;}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(-(e.facing||1),1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,37,12,0,0,Math.PI*2);ctx.fill();
 if(pantherSheet.complete&&pantherSheet.naturalWidth){let sw=pantherSheet.naturalWidth/4,sh=pantherSheet.naturalHeight/3,w=155,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,pantherSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*[.84,.84,.86][frame.row]-lift,w,h);else ctx.drawImage(pantherSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*[.84,.84,.86][frame.row]-lift,w,h);}ctx.restore();return true;
};
const pantherGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 pantherGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r2e5'):enemies)){let a=e.attack;if(e.species!=='r2e5'||e.hp<=0||a?.pattern!=='pantherLeap'||!visibleAt(e.x,e.y))continue;ctx.save();
 if(!a.landed){let from=project(a.origin.x,a.origin.y),to=project(a.target.x,a.target.y);ctx.strokeStyle='#b8d992';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();ctx.setLineDash([]);groundRing(a.target.x,a.target.y,a.radius,'#cbe6a5',2);}
 if(!a.clawed){let center=a.landed?e:a.target,s=project(center.x,center.y);ctx.beginPath();ctx.moveTo(s.x,s.y);for(let i=0;i<=20;i++){let angle=a.angle+Math.PI-.85+1.7*i/20,q=project(center.x+Math.cos(angle)*120,center.y+Math.sin(angle)*120);ctx.lineTo(q.x,q.y);}ctx.closePath();ctx.fillStyle=a.landed?'#e3c58244':'#e3c58215';ctx.strokeStyle='#e3c582';ctx.lineWidth=1.5;ctx.fill();ctx.stroke();}ctx.restore();}
};
const pantherSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2e5'?155:pantherSizeBase(e);
