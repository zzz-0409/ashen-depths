function aulAttackHint(e){let a=e.attack,wave=a?.waves.find(w=>!w.hit);return wave?'風読みの回廊 · 斜線のない通路へ（残り'+a.waves.filter(w=>!w.hit).length+'波）':'翼を休めた隙に反撃';}
function beginAulGale(e){
 let phase=e.hp/e.max<.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x),origin={x:e.x,y:e.y};
 // Alternate the side of the second safe lane across casts, without random surprises.
 let side=(e.aulCycle||0)%2?1:3;e.aulCycle=(e.aulCycle||0)+1;
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern:'aulGale',bespoke:true,phase,origin,angle,windup:1.6,waves:(phase===2?[2,side,4-side]:[2,side]).map((safe,i)=>({safe,at:1.6+i*1.8,hit:false}))};
}
function aulWaveContains(a,wave,point){let dx=point.x-a.origin.x,dy=point.y-a.origin.y,along=dx*Math.cos(a.angle)+dy*Math.sin(a.angle),across=-dx*Math.sin(a.angle)+dy*Math.cos(a.angle);if(along< -80||along>440)return false;return [0,1,2,3,4].some(lane=>lane!==wave.safe&&Math.abs(across-(lane-2)*120)<=60);}
function aulLanePolygon(a,lane){return [[-80,(lane-2)*120-60],[440,(lane-2)*120-60],[440,(lane-2)*120+60],[-80,(lane-2)*120+60]].map(([along,across])=>{let dx=Math.cos(a.angle)*along-Math.sin(a.angle)*across,dy=Math.sin(a.angle)*along+Math.cos(a.angle)*across,length=Math.hypot(dx,dy),point={...a.origin};for(let d=0;d<=length+4;d+=4){let t=Math.min(1,d/length),q={x:a.origin.x+dx*t,y:a.origin.y+dy*t};if(!lineClear(a.origin,q))break;point=q;}return point;});}
const aulAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r2b3')return aulAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0||!Number.isFinite(dt)||dt<=0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.attack?.pattern!=='aulGale'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let distance=dist(e,p),clear=lineClear(e,p);
  if(distance<=420&&clear&&e.t<=0)beginAulGale(e);
  else{e.state='idle';if(distance>900||distance<180&&clear)return;if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let q=e.path?.[0];if(q){let dx=q.x-e.x,dy=q.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,90*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,22)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;}
 }
 let a=e.attack;e.elapsed+=dt;for(let wave of a.waves)if(!wave.hit&&e.elapsed>=wave.at){wave.hit=true;if(aulWaveContains(a,wave,p)&&lineClear(a.origin,p))hurt(a.phase===2?112:88);playSound('wind',e.x,e.y);}
 e.struck=a.waves.every(w=>w.hit);if(e.elapsed>=a.waves.at(-1).at+1.4){e.attack=null;e.state='idle';e.t=1.2;}
};
const aulSheet=new Image();aulSheet.assetSrc='assets/forest-aul-anim.png';
const aulDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r2b3')return aulDrawBase(e,size);let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim),a=e.attack,lift=e.hp>0?14+Math.sin(e.anim*3)*4:0;
 if(e.hp>0&&a?.pattern==='aulGale'){let next=a.waves.find(w=>!w.hit),lead=next?next.at-e.elapsed:-1;frame={row:2,col:e.struck?3:lead>.8?0:lead>.2?1:2};}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,45,15,0,0,Math.PI*2);ctx.fill();
 if(aulSheet.complete&&aulSheet.naturalWidth){let sw=aulSheet.naturalWidth/4,sh=aulSheet.naturalHeight/3,w=270,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':e.phase===2?'saturate(1.3)':'none';ctx.drawImage(aulSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.88-lift,w,h);}ctx.restore();return true;
};
const aulSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r2b3'?270:aulSizeBase(e);
const aulGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 aulGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r2b3'||e.hp<=0||a?.pattern!=='aulGale'||!visibleAt(e.x,e.y))continue;
 let wave=a.waves.find(w=>e.elapsed<w.at+.2);if(!wave)continue;ctx.save();
 for(let lane=0;lane<5;lane++){let safe=lane===wave.safe,points=aulLanePolygon(a,lane).map(q=>project(q.x,q.y));ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.strokeStyle=safe?'#98efd9':wave.hit?'#fff4ce':'#e9c284';ctx.fillStyle=safe?'#67cca51b':wave.hit?'#f9dba266':'#cda16b33';ctx.lineWidth=safe?2:1;ctx.setLineDash(safe?[8,6]:[]);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  if(!safe){for(let along=0;along<=400;along+=65){let across=(lane-2)*120,from={x:a.origin.x+Math.cos(a.angle)*along-Math.sin(a.angle)*(across-35),y:a.origin.y+Math.sin(a.angle)*along+Math.cos(a.angle)*(across-35)},to={x:from.x+Math.cos(a.angle)*35-Math.sin(a.angle)*70,y:from.y+Math.sin(a.angle)*35+Math.cos(a.angle)*70};if(!lineClear(a.origin,from)||!lineClear(from,to))continue;let f=project(from.x,from.y),t=project(to.x,to.y);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(t.x,t.y);ctx.stroke();}}
 }ctx.restore();
 }
};
