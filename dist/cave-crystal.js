// A transverse crystal ridge commits to the player's position at cast time.
function beginCrystalRidge(e){
 let angle=Math.atan2(p.y-e.y,p.x-e.x)+Math.PI/2,origin={x:e.x,y:e.y};
 e.state='attack';e.elapsed=0;e.struck=false;
 e.attack={pattern:'crystalRidge',bespoke:true,origin,windup:1.65,radius:52,marks:[-200,-100,0,100,200].map(d=>({x:p.x+Math.cos(angle)*d,y:p.y+Math.sin(angle)*d})).filter(m=>lineClear(origin,m))};
}
const crystalAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1e1')return crystalAnimateBase(e,dt);
 if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=380&&lineClear(e,p))beginCrystalRidge(e);
 let a=e.attack;if(a?.pattern!=='crystalRidge')return crystalAnimateBase(e,dt);
 e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(!e.struck&&e.elapsed>=a.windup){
  e.struck=true;
  // Adjacent circles slightly overlap: one ridge is still only one hit.
  if(a.marks.some(m=>dist(m,p)<=a.radius&&lineClear(a.origin,m)&&lineClear(m,p)))hurt(42);
  for(let m of a.marks)if(lineClear(a.origin,m))burst(m.x,m.y,45,'#8de5ed');
  if(typeof playSound==='function')playSound('frost',e.x,e.y);
 }
 if(e.elapsed>=2.9){e.state='idle';e.attack=null;e.t=1.4;}
};
// Faceted geometry keeps the rotating shards crisp at every zoom level.
function crystalFacet(x,y,w,h,glow){
 ctx.fillStyle=glow?'#defcff':'#71c9d6';ctx.strokeStyle='#d5fcff';ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x+w,y-h*.35);ctx.lineTo(x,y);ctx.lineTo(x-w,y-h*.35);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=glow?'#9de9f5':'#346c92';ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x,y-h*.25);ctx.lineTo(x-w,y-h*.35);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#efffff';ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x,y-h*.25);ctx.lineTo(x+w,y-h*.35);ctx.stroke();
}
const caveCrystalSheet=new Image();caveCrystalSheet.assetSrc='assets/cave-crystal-spirit-v1.png';
function caveCrystalFrame(e){if(e.hp>0&&e.attack?.pattern==='crystalRidge')return{row:2,col:e.elapsed<.55?0:e.elapsed<1.65?1:e.elapsed<2.1?2:3};return spriteFrame(e.state,e.anim);}
const crystalDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1e1')return crystalDrawBase(e,size);
 let pos=project(e.x,e.y),alive=e.hp>0,a=e.attack,charge=alive&&a?.pattern==='crystalRidge'?clamp(e.elapsed/a.windup,0,1):0;
 ctx.save();ctx.translate(pos.x,pos.y);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,29,11,0,0,Math.PI*2);ctx.fill();
 if(!alive){crystalFacet(-14,0,9,19,false);crystalFacet(7,4,12,25,false);ctx.restore();return true;}
 let lift=12+Math.sin(e.anim*3)*4+charge*10;
 if(caveCrystalSheet.complete&&caveCrystalSheet.naturalWidth){let frame=caveCrystalFrame(e),sw=caveCrystalSheet.naturalWidth/4,sh=caveCrystalSheet.naturalHeight/3,w=130,h=w*sh/sw;ctx.scale(e.facing||1,1);ctx.filter=e.flash>0?'brightness(1.8)':'none';if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,caveCrystalSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.88-lift,w,h);else ctx.drawImage(caveCrystalSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.88-lift,w,h);ctx.restore();return true;}
 for(let i=0;i<4;i++){let angle=e.anim*.8+i*Math.PI/2;crystalFacet(Math.cos(angle)*(27+charge*12),Math.sin(angle)*9-lift,8,24,e.flash>0);}
 crystalFacet(0,-lift,19,65,e.flash>0||charge>.85);ctx.restore();return true;
};
const caveRidgeSheet=new Image();caveRidgeSheet.assetSrc='assets/cave-crystal-ridge-v1.png';
function paintCaveRidge(m,age){
 if(!Number.isFinite(age)||age<0||age>=.6||(typeof presentationPrefs!=='undefined'&&presentationPrefs.reduced)||!caveRidgeSheet.complete||!caveRidgeSheet.naturalWidth||!caveRidgeSheet.naturalHeight)return false;
 let q=project(m.x,m.y),w=120,h=w*caveRidgeSheet.naturalHeight/3/(caveRidgeSheet.naturalWidth/4);if(q.x<-w||q.x>W+w||q.y<-h||q.y>H+h)return false;
 let light=typeof effectQuality!=='undefined'&&effectQuality==='low',frame=light?Math.min(5,Math.floor(age/.6*6))*2:Math.min(11,Math.floor(age/.6*12)),sw=caveRidgeSheet.naturalWidth/4,sh=caveRidgeSheet.naturalHeight/3;
 ctx.save();ctx.globalAlpha=1-Math.max(0,(age-.35)/.25);if(typeof drawPreparedEnemySprite==='function')drawPreparedEnemySprite(ctx,caveRidgeSheet,frame%4*sw,Math.floor(frame/4)*sh,sw,sh,q.x-w/2,q.y-h*.9,w,h);else ctx.drawImage(caveRidgeSheet,frame%4*sw,Math.floor(frame/4)*sh,sw,sh,q.x-w/2,q.y-h*.9,w,h);ctx.restore();return true;
}
const crystalGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 crystalGroundBase();let ridgeRemaining=typeof effectQuality!=='undefined'&&effectQuality==='low'?5:10;for(let e of (typeof enemyRenderList==='function'?enemyRenderList('r1e1'):enemies)){let a=e.attack;if(e.species!=='r1e1'||e.hp<=0||a?.pattern!=='crystalRidge')continue;
  for(let m of a.marks){if(!visibleAt(m.x,m.y))continue;let age=e.elapsed-a.windup;
   ctx.save();if(age<0){groundRing(m.x,m.y,a.radius,'#a6f0f5',2);groundRing(m.x,m.y,a.radius*clamp(e.elapsed/a.windup,0,1),'#80dae6',1);}
   else if(age<.6){let s=project(m.x,m.y),height=75*Math.min(1,age/.08)*(1-age/.6);ctx.globalAlpha=1-age/.6;groundRing(m.x,m.y,a.radius,'#ecffff',2);if(ridgeRemaining>0&&paintCaveRidge(m,age))ridgeRemaining--;else{crystalFacet(s.x,s.y,22,height,true);crystalFacet(s.x-23,s.y+5,12,height*.65,false);crystalFacet(s.x+20,s.y+4,10,height*.8,false);}}
   ctx.restore();
  }
 }
};
const crystalSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r1e1'?115:crystalSizeBase(e);
