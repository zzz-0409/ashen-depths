const GARUDA_MOVES={garudaWings:{name:'双翼の暴風',hint:'正面の隙間へ'},garudaDive:{name:'嵐翼の急降下',hint:'進路の横へ回避'}};
function beginGarudaAttack(e,pattern){
 let phase=e.hp/e.max<.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x),length=clamp(dist(e,p)+100,220,480);
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern,bespoke:true,phase,angle,center:{x:e.x,y:e.y},target:{x:e.x+Math.cos(angle)*length,y:e.y+Math.sin(angle)*length},windup:phase===2?(pattern==='garudaDive'?1.25:1.3):1.5,travel:phase===2?.5:.6,radius:pattern==='garudaDive'?(phase===2?62:48):(phase===2?390:330),halfAngle:phase===2?.78:.65,impacts:[false,false],hit:false};
}
function garudaWingContains(a,point,index){let dx=point.x-a.center.x,dy=point.y-a.center.y,angle=a.angle+(index?-.95:.95),diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle));return Math.hypot(dx,dy)<=a.radius&&Math.abs(diff)<=a.halfAngle;}
const garudaAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r0b3')return garudaAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=520&&lineClear(e,p)){beginGarudaAttack(e,(e.garudaCycle||0)%2?'garudaDive':'garudaWings');e.garudaCycle=(e.garudaCycle||0)+1;}
 let a=e.attack;if(!GARUDA_MOVES[a?.pattern])return garudaAnimateBase(e,dt);
 let previous=e.elapsed;e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(a.pattern==='garudaWings'){
  for(let i=0;i<2;i++)if(e.elapsed>=a.windup+i*.55&&!a.impacts[i]){a.impacts[i]=true;if(garudaWingContains(a,p,i)&&lineClear(a.center,p))hurt(a.phase===2?85:65);if(typeof playSound==='function')playSound('vortex',e.x,e.y);}
  e.struck=a.impacts[1];
 }else{
  let delta=clamp((e.elapsed-a.windup)/a.travel,0,1)-clamp((previous-a.windup)/a.travel,0,1);
  if(delta>0&&!a.blocked){let dx=(a.target.x-a.center.x)*delta,dy=(a.target.y-a.center.y)*delta,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/6));
   for(let i=0;i<steps;i++){let before={x:e.x,y:e.y};moveActor(e,dx/steps,dy/steps,18);if(Math.hypot(e.x-before.x-dx/steps,e.y-before.y-dy/steps)>.1){e.x=before.x;e.y=before.y;a.blocked=true;break;}
    if(!a.hit&&projectileContact(before,e,p,a.radius)!==null&&lineClear(e,p)){a.hit=true;hurt(a.phase===2?110:85);}
   }
  }
  if(e.elapsed>=a.windup+a.travel&&!e.struck){e.struck=true;if(typeof playSound==='function')playSound('impact',e.x,e.y);}
 }
 if(e.elapsed>=a.windup+(a.pattern==='garudaWings'?.55:a.travel)+1.45){e.attack=null;e.state='idle';e.t=.8;}
};
function garudaVisualLift(e){if(e.hp<=0)return 0;let a=e.attack;if(a?.pattern==='garudaDive'){return e.elapsed<a.windup?34*Math.sin(clamp(e.elapsed/a.windup,0,1)*Math.PI/2):34*(1-clamp((e.elapsed-a.windup)/a.travel,0,1));}return e.state==='walk'?10+Math.sin(e.anim*9)*4:6+Math.sin(e.anim*3)*2;}
const garudaSheet=new Image();garudaSheet.assetSrc='assets/storm-garuda-anim.png';
const garudaDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r0b3')return garudaDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim),lift=garudaVisualLift(e);
 if(GARUDA_MOVES[a?.pattern])frame={row:2,col:e.elapsed<a.windup?0:a.pattern==='garudaDive'?(e.elapsed<a.windup+a.travel?2:3):(e.elapsed<a.windup+.8?1:3)};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,0,62-lift*.25,19-lift*.06,0,0,Math.PI*2);ctx.fill();
 if(garudaSheet.complete&&garudaSheet.naturalWidth){let sw=garudaSheet.naturalWidth/4,sh=garudaSheet.naturalHeight/3,w=310,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(garudaSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.9-lift,w,h);}ctx.restore();return true;
};
function drawGarudaWing(a,index){let points=[[0,0]],angle=index?-.95:.95;for(let j=0;j<=24;j++){let t=angle-a.halfAngle+a.halfAngle*2*j/24;points.push([Math.cos(t)*a.radius,Math.sin(t)*a.radius]);}finalPolygon(a,points);}
function drawGarudaLane(a){let length=dist(a.center,a.target),points=[];for(let j=0;j<=16;j++){let t=-Math.PI/2+j*Math.PI/16;points.push([length+Math.cos(t)*a.radius,Math.sin(t)*a.radius]);}for(let j=0;j<=16;j++){let t=Math.PI/2+j*Math.PI/16;points.push([Math.cos(t)*a.radius,Math.sin(t)*a.radius]);}finalPolygon(a,points);}
const garudaGroundBase=drawGroundEffects;drawGroundEffects=()=>{garudaGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r0b3'||e.hp<=0||!GARUDA_MOVES[a?.pattern]||!visibleAt(e.x,e.y))continue;ctx.save();ctx.lineWidth=2;
 if(a.pattern==='garudaWings'){for(let i=0;i<2;i++){let until=a.windup+i*.55-e.elapsed;if(until<-.25)continue;ctx.fillStyle=until<=0?'#d9f9ff77':'#77cde625';ctx.strokeStyle=until<=0?'#efffff':i?'#80bded':'#aedfe9';drawGarudaWing(a,i);}}
 else if(!e.struck&&!a.blocked){ctx.fillStyle='#93d7ee25';ctx.strokeStyle='#a4e3fa';drawGarudaLane(a);}
 ctx.restore();}};

