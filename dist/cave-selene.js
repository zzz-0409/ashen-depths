function seleneAttackHint(e){return e.attack?.phase===2?'六華の屈折 · 光線の隙間へ。最後は足元も爆発':'六華の屈折 · 角度が変わる光線の隙間へ'}
function beginSelenePrism(e){
 let phase=e.hp/e.max<.5?2:1,origin={x:e.x,y:e.y},angle=Math.atan2(p.y-e.y,p.x-e.x);
 let waves=(phase===2?[0,Math.PI/6,0]:[0,Math.PI/6]).map((offset,i)=>({at:1.7+i*.9,hit:false,centerBurst:phase===2&&i===2,angles:Array.from({length:6},(_,n)=>angle+offset+n*Math.PI/3)}));
 for(let wave of waves)wave.lengths=wave.angles.map(direction=>Math.min(430,wispBeamLength(origin,direction)));
 e.state='attack';e.elapsed=0;e.struck=false;e.phase=phase;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'selenePrism',bespoke:true,origin,phase,windup:1.7,inner:70,halfWidth:24,centerRadius:100,waves};
}
function seleneWaveContains(a,wave,point){
 if(wave.centerBurst&&dist(a.origin,point)<=a.centerRadius)return true;
 return wave.angles.some((angle,i)=>{let dx=point.x-a.origin.x,dy=point.y-a.origin.y,along=dx*Math.cos(angle)+dy*Math.sin(angle),across=-dx*Math.sin(angle)+dy*Math.cos(angle);return along>=a.inner&&along<=wave.lengths[i]&&Math.abs(across)<=a.halfWidth;});
}
const seleneAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1b1')return seleneAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=520&&lineClear(e,p))beginSelenePrism(e);
 let a=e.attack;if(a?.pattern!=='selenePrism')return seleneAnimateBase(e,dt);
 e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 for(let wave of a.waves)if(!wave.hit&&e.elapsed>=wave.at){wave.hit=true;if(seleneWaveContains(a,wave,p)&&lineClear(a.origin,p))hurt(a.phase===2?90:70);if(typeof playSound==='function')playSound('arc',e.x,e.y);}
 e.struck=a.waves.every(w=>w.hit);if(e.elapsed>=a.waves.at(-1).at+1.2){e.state='idle';e.attack=null;e.t=1.1;}
};
const seleneSheet=new Image();seleneSheet.assetSrc='assets/cave-selene-anim.png';
const seleneDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1b1')return seleneDrawBase(e,size);let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim),a=e.attack;
 if(a?.pattern==='selenePrism')frame={row:2,col:e.elapsed<.7?0:e.elapsed<a.windup?1:e.elapsed<a.waves.at(-1).at+.25?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,35,12,0,0,Math.PI*2);ctx.fill();
 if(seleneSheet.complete&&seleneSheet.naturalWidth){let sw=seleneSheet.naturalWidth/4,sh=seleneSheet.naturalHeight/3,w=245,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(seleneSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.91,w,h);}ctx.restore();return true;
};
const seleneGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 seleneGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r1b1'||e.hp<=0||a?.pattern!=='selenePrism'||!visibleAt(e.x,e.y))continue;
  ctx.save();for(let [index,wave]of a.waves.entries()){
   let lead=wave.at-e.elapsed;if(lead<-.25||e.elapsed<(index?a.waves[index-1].at:0))continue;
   let active=lead<=0;ctx.strokeStyle=active?'#fff0ff':index%2?'#88eaf3':'#d7a1ef';ctx.fillStyle=active?'#e2bbff80':index%2?'#88eaf32b':'#d7a1ef2b';ctx.lineWidth=active?3:1.5;
   for(let i=0;i<6;i++)if(wave.lengths[i]>a.inner)finalPolygon({center:a.origin,angle:wave.angles[i]},[[a.inner,-a.halfWidth],[wave.lengths[i],-a.halfWidth],[wave.lengths[i],a.halfWidth],[a.inner,a.halfWidth]]);
   if(wave.centerBurst){let s=project(a.origin.x,a.origin.y);ctx.beginPath();ctx.ellipse(s.x,s.y,a.centerRadius*ISOX*Math.SQRT2,a.centerRadius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill();groundRing(a.origin.x,a.origin.y,a.centerRadius,ctx.strokeStyle,ctx.lineWidth);}
  }ctx.restore();
 }
};
const seleneSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r1b1'?245:seleneSizeBase(e);
