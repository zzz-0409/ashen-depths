const FEN_MOVES={fenHowl:{name:'三連咆哮',hint:'衝撃波を越えて内側へ'},fenLeap:{name:'王狼の跳躍',hint:'着地の円から離れる'}};
function beginFenAttack(e,pattern){
 let phase=e.hp/e.max<.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x),length=Math.min(400,dist(e,p));
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern,bespoke:true,phase,center:{x:e.x,y:e.y},target:{x:e.x+Math.cos(angle)*length,y:e.y+Math.sin(angle)*length},windup:pattern==='fenHowl'?1.3:1.15,travel:.45,radius:phase===2?110:85,inner:phase===2?65:80,width:phase===2?90:70,impacts:[false,false,false]};
}
function fenWaveContains(a,point,index){let d=dist(a.center,point),inner=a.inner+a.width*index;return d>=inner&&d<inner+a.width}
const fenAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0b0')return fenAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=440&&lineClear(e,p)){beginFenAttack(e,(e.fenCycle||0)%2?'fenLeap':'fenHowl');e.fenCycle=(e.fenCycle||0)+1}
 let a=e.attack;if(!FEN_MOVES[a?.pattern])return fenAnimateBase(e,dt);
 let previous=e.elapsed;e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(a.pattern==='fenHowl'){
  for(let i=0;i<3;i++)if(e.elapsed>=a.windup+i*.45&&!a.impacts[i]){a.impacts[i]=true;if(fenWaveContains(a,p,i)&&lineClear(a.center,p))hurt(a.phase===2?55:45);if(typeof playSound==='function')playSound('vortex',e.x,e.y)}
  e.struck=a.impacts[2];
 }else{
  let delta=clamp((e.elapsed-a.windup)/a.travel,0,1)-clamp((previous-a.windup)/a.travel,0,1);
  if(delta>0&&!a.blocked){let dx=(a.target.x-a.center.x)*delta,dy=(a.target.y-a.center.y)*delta,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/6));for(let i=0;i<steps;i++){let before={x:e.x,y:e.y};moveActor(e,dx/steps,dy/steps,18);if(Math.hypot(e.x-before.x-dx/steps,e.y-before.y-dy/steps)>.1){e.x=before.x;e.y=before.y;a.blocked=true;break}}}
  if(e.elapsed>=a.windup+a.travel&&!e.struck){e.struck=true;if(!a.blocked&&dist(a.target,p)<=a.radius&&lineClear(e,p))hurt(a.phase===2?75:60);burst(e.x,e.y,a.radius,'#c7e4ef');if(typeof playSound==='function')playSound('impact',e.x,e.y)}
 }
 if(e.elapsed>=a.windup+(a.pattern==='fenHowl'?.9:a.travel)+1.1){e.attack=null;e.state='idle';e.t=.8}
};
const fenSheet=new Image();fenSheet.assetSrc='assets/wolf-king-anim.png';
const fenDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0b0')return fenDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim),lift=0;
 if(FEN_MOVES[a?.pattern]){let t=e.elapsed-a.windup;frame={row:2,col:a.pattern==='fenHowl'?3:t<0?0:t<a.travel?1:2};if(a.pattern==='fenLeap'&&t>0&&t<a.travel)lift=Math.sin(t/a.travel*Math.PI)*48}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,55,18,0,0,Math.PI*2);ctx.fill();
 if(fenSheet.complete&&fenSheet.naturalWidth){let sw=fenSheet.naturalWidth/4,sh=fenSheet.naturalHeight/3,w=220,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(fenSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.9-lift,w,h)}ctx.restore();return true;
};
const fenEffectsBase=drawGroundEffects;drawGroundEffects=()=>{fenEffectsBase();for(let e of enemies){let a=e.attack;if(e.species!=='r0b0'||e.hp<=0||!FEN_MOVES[a?.pattern]||!visibleAt(e.x,e.y))continue;ctx.save();if(a.pattern==='fenHowl'){for(let i=0;i<3;i++){let until=a.windup+i*.45-e.elapsed;if(until<-.2)continue;let inner=a.inner+a.width*i,outer=inner+a.width,s=project(a.center.x,a.center.y);ctx.fillStyle=until<=0?'#cdefff66':'#9ddfff18';ctx.strokeStyle=until<=0?'#f1fcff':'#a3d8eb';ctx.lineWidth=until<=0?3:1;ctx.beginPath();ctx.ellipse(s.x,s.y,outer*ISOX*Math.SQRT2,outer*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.ellipse(s.x,s.y,inner*ISOX*Math.SQRT2,inner*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill('evenodd');groundRing(a.center.x,a.center.y,outer,ctx.strokeStyle,ctx.lineWidth)}}else if(!e.struck&&!a.blocked){groundRing(a.target.x,a.target.y,a.radius,'#c9ebfc',2);groundRing(a.target.x,a.target.y,a.radius*clamp(e.elapsed/(a.windup+a.travel),0,1),'#c9ebfc',1)}ctx.restore()}};

