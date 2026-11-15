// Side-step, commit to a facing, then two independently telegraphed blade sweeps.
function beginScoutCombo(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x),side=(e.scoutCycle||0)%2?1:-1;e.scoutCycle=(e.scoutCycle||0)+1;
 e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern:'scoutCombo',bespoke:true,windup:1.2,travel:.45,radius:115,halfAngle:.75,angle,side,center:{x:e.x,y:e.y},target:{x:p.x,y:p.y},impacts:[false,false]};
}
function scoutConeContains(a,point,index){let dx=point.x-a.center.x,dy=point.y-a.center.y,angle=a.angle+(index?-.18:.18),diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle));return Math.hypot(dx,dy)<=a.radius&&Math.abs(diff)<=a.halfAngle}
const scoutAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0e2')return scoutAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=165&&lineClear(e,p))beginScoutCombo(e);
 let a=e.attack;if(a?.pattern!=='scoutCombo')return scoutAnimateBase(e,dt);
 let previous=e.elapsed;e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 let travel=clamp(e.elapsed/a.travel,0,1)-clamp(previous/a.travel,0,1);
 if(travel>0&&!a.blocked){let distance=60*travel*(e.slow>0?.35:1),steps=Math.ceil(distance/6),step=distance/steps;
  for(let i=0;i<steps;i++){let dx=-Math.sin(a.angle)*a.side*step,dy=Math.cos(a.angle)*a.side*step,before={x:e.x,y:e.y};moveActor(e,dx,dy,12);if(Math.hypot(e.x-before.x-dx,e.y-before.y-dy)>.1){e.x=before.x;e.y=before.y;a.blocked=true;break}}
 }
 if(e.elapsed>=a.travel&&!a.locked){a.locked=true;a.center={x:e.x,y:e.y};a.target={x:p.x,y:p.y};a.angle=Math.atan2(p.y-e.y,p.x-e.x);e.facing=Math.cos(a.angle)-Math.sin(a.angle)<0?-1:1}
 for(let i=0;i<2;i++)if(e.elapsed>=a.windup+i*.45&&!a.impacts[i]){a.impacts[i]=true;if(scoutConeContains(a,p,i)&&lineClear(e,p))hurt(24);if(typeof playSound==='function')playSound('slash',e.x,e.y)}
 e.struck=a.impacts[1];if(e.elapsed>=2.65){e.attack=null;e.state='idle';e.t=1.1}
};
const scoutSheet=new Image();scoutSheet.assetSrc='assets/grass-scout-anim.png';
const scoutDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0e2')return scoutDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(a?.pattern==='scoutCombo')frame=e.elapsed<.45?{row:1,col:Math.floor(e.anim*12)%4}:{row:2,col:e.elapsed<1.2?0:e.elapsed<1.65?1:e.elapsed<1.9?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,21,8,0,0,Math.PI*2);ctx.fill();
 if(scoutSheet.complete&&scoutSheet.naturalWidth){let sw=scoutSheet.naturalWidth/4,sh=scoutSheet.naturalHeight/3,w=108,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,scoutSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.96,w,h);else ctx.drawImage(scoutSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.96,w,h)}ctx.restore();return true;
};
function drawScoutCone(a,index){let angle=a.angle+(index?-.18:.18),s=project(a.center.x,a.center.y);ctx.beginPath();ctx.moveTo(s.x,s.y);for(let j=0;j<=18;j++){let t=angle-a.halfAngle+a.halfAngle*2*j/18,pos=project(a.center.x+Math.cos(t)*a.radius,a.center.y+Math.sin(t)*a.radius);ctx.lineTo(pos.x,pos.y)}ctx.closePath();ctx.fill();ctx.stroke()}
const scoutEffectsBase=drawGroundEffects;drawGroundEffects=()=>{scoutEffectsBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r0e2'):enemies)){let a=e.attack;if(e.species!=='r0e2'||e.hp<=0||a?.pattern!=='scoutCombo'||!a.locked||!visibleAt(e.x,e.y))continue;ctx.save();for(let i=0;i<2;i++){let until=a.windup+i*.45-e.elapsed;if(until<-.16||until>.8)continue;ctx.strokeStyle=until<=0?'#fff0c6':i?'#ffb38b':'#f6d7a1';ctx.fillStyle=until<=0?'#ffe5b955':'#d68b3824';ctx.lineWidth=until<=0?4:2;drawScoutCone(a,i)}ctx.restore()}};

