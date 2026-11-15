// A fixed light field strikes its outer ring first, then its center.
function beginLanternField(e){
 e.state='attack';e.elapsed=0;e.struck=false;
 e.attack={pattern:'lanternField',bespoke:true,center:{x:p.x,y:p.y},windup:1.5,second:2.5,inner:110,outer:200,impacts:[false,false]};
 e.facing=(p.x-e.x)-(p.y-e.y)<0?-1:1;
}
function lanternFieldContains(a,point,inner){let d=dist(a.center,point);return inner?d<a.inner:d>=a.inner&&d<=a.outer;}
const lanternAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1e6')return lanternAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=370&&lineClear(e,p))beginLanternField(e);
 let a=e.attack;if(a?.pattern!=='lanternField')return lanternAnimateBase(e,dt);
 e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 for(let i=0;i<2;i++)if(!a.impacts[i]&&e.elapsed>=(i?a.second:a.windup)){
  a.impacts[i]=true;if(lanternFieldContains(a,p,!!i)&&lineClear(e,a.center)&&lineClear(a.center,p))hurt(i?44:32);
  if(typeof playSound==='function')playSound(i?'arc':'vortex',a.center.x,a.center.y);
 }
 e.struck=a.impacts[1];if(e.elapsed>=a.second+1.4){e.state='idle';e.attack=null;e.t=1.3;}
};
const lanternSheet=new Image();lanternSheet.assetSrc='assets/cave-lantern-anim.png';
const lanternDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1e6')return lanternDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim),lift=e.hp>0?10+Math.sin(e.anim*3)*3:0;
 if(a?.pattern==='lanternField')frame={row:2,col:e.elapsed<.65?0:e.elapsed<a.windup?1:e.elapsed<a.second+.2?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,23,8,0,0,Math.PI*2);ctx.fill();
 if(lanternSheet.complete&&lanternSheet.naturalWidth){let sw=lanternSheet.naturalWidth/4,sh=lanternSheet.naturalHeight/3,w=150,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,lanternSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.85-lift,w,h);else ctx.drawImage(lanternSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.85-lift,w,h);}ctx.restore();return true;
};
function drawLanternField(a,inner,active){let s=project(a.center.x,a.center.y),r=inner?a.inner:a.outer;ctx.fillStyle=active?'#e0b2ff60':inner?'#ef8edc20':'#b88eff20';ctx.strokeStyle=active?'#f9deff':inner?'#ec9bda':'#bf9af2';ctx.lineWidth=active?3:1.5;ctx.beginPath();ctx.ellipse(s.x,s.y,r*ISOX*Math.SQRT2,r*ISOY*Math.SQRT2,0,0,Math.PI*2);if(!inner)ctx.ellipse(s.x,s.y,a.inner*ISOX*Math.SQRT2,a.inner*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill('evenodd');groundRing(a.center.x,a.center.y,r,ctx.strokeStyle,ctx.lineWidth);if(!inner)groundRing(a.center.x,a.center.y,a.inner,ctx.strokeStyle,1);}
const lanternGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 lanternGroundBase();for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r1e6'):enemies)){let a=e.attack;if(e.species!=='r1e6'||e.hp<=0||a?.pattern!=='lanternField'||!visibleAt(a.center.x,a.center.y))continue;ctx.save();
  if(e.elapsed<=a.windup+.25)drawLanternField(a,false,e.elapsed>=a.windup);
  if(e.elapsed>=a.windup&&e.elapsed<=a.second+.25)drawLanternField(a,true,e.elapsed>=a.second);
  ctx.restore();
 }
};
const lanternSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r1e6'?150:lanternSizeBase(e);
