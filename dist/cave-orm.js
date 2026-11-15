const ORM_MOVES={ormFracture:{name:'穿孔の地割れ',hint:'地割れの列から横へ'},ormTail:{name:'岩砕の尾薙ぎ',hint:'正面か足元の隙間へ'}};
function beginOrmAttack(e,pattern){
 let phase=e.hp/e.max<.5?2:1,angle=Math.atan2(p.y-e.y,p.x-e.x),count=phase===2?4:3;
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 e.attack={pattern,bespoke:true,phase,angle,center:{x:e.x,y:e.y},target:{x:p.x,y:p.y},windup:phase===2?1.35:1.65,radius:pattern==='ormTail'?(phase===2?300:260):(phase===2?85:70),inner:phase===2?60:70,frontGap:phase===2?.6:.8,marks:Array.from({length:count},(_,i)=>({x:e.x+Math.cos(angle)*(i+1)*120,y:e.y+Math.sin(angle)*(i+1)*120})),impacts:Array(count).fill(false)};
}
function ormTailContains(a,point){let dx=point.x-a.center.x,dy=point.y-a.center.y,d=Math.hypot(dx,dy),offset=Math.atan2(Math.sin(Math.atan2(dy,dx)-a.angle),Math.cos(Math.atan2(dy,dx)-a.angle));return d>=a.inner&&d<=a.radius&&Math.abs(offset)>=a.frontGap;}
const ormAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1b3')return ormAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 let next=(e.ormCycle||0)%2?'ormTail':'ormFracture',range=next==='ormTail'?285:450;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=range&&lineClear(e,p)){beginOrmAttack(e,next);e.ormCycle=(e.ormCycle||0)+1;}
 let a=e.attack;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(!ORM_MOVES[a?.pattern]){
  e.t-=dt;e.nav-=dt;e.state='idle';let d=dist(e,p),clear=lineClear(e,p);if((d>750&&!e.bossProvoked)||(d<=range&&clear))return;
  if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let target=e.path?.[0];if(!target)return;let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10){e.path.shift();return;}let step=Math.min(len,80*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,18)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;return;
 }
 e.elapsed+=dt;
 if(a.pattern==='ormFracture'){
  for(let i=0;i<a.marks.length;i++)if(e.elapsed>=a.windup+i*.38&&!a.impacts[i]){a.impacts[i]=true;let mark=a.marks[i];if(dist(mark,p)<=a.radius&&lineClear(a.center,mark)&&lineClear(mark,p))hurt(a.phase===2?85:65);if(typeof playSound==='function')playSound('impact',mark.x,mark.y);}
  e.struck=a.impacts.every(Boolean);
 }else if(e.elapsed>=a.windup&&!e.struck){e.struck=true;if(ormTailContains(a,p)&&lineClear(a.center,p))hurt(a.phase===2?115:90);if(typeof playSound==='function')playSound('slash',e.x,e.y);}
 if(e.elapsed>=a.windup+(a.pattern==='ormFracture'?(a.marks.length-1)*.38:0)+1.3){e.attack=null;e.state='idle';e.t=.85;}
};
const ormSheet=new Image();ormSheet.assetSrc='assets/cave-orm-anim.png';
const ormDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1b3')return ormDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(ORM_MOVES[a?.pattern])frame={row:2,col:e.elapsed<a.windup?0:a.pattern==='ormTail'?(e.elapsed<a.windup+.4?2:3):e.elapsed<a.windup+(a.phase===2?1.4:1)?1:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,78,25,0,0,Math.PI*2);ctx.fill();if(ormSheet.complete&&ormSheet.naturalWidth){let sw=ormSheet.naturalWidth/4,sh=ormSheet.naturalHeight/3,w=350,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(ormSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.88,w,h);}ctx.restore();return true;
};
function drawOrmTail(a){let points=[],span=Math.PI*2-a.frontGap*2;for(let i=0;i<=40;i++){let angle=a.frontGap+span*i/40;points.push([Math.cos(angle)*a.radius,Math.sin(angle)*a.radius]);}for(let i=40;i>=0;i--){let angle=a.frontGap+span*i/40;points.push([Math.cos(angle)*a.inner,Math.sin(angle)*a.inner]);}finalPolygon(a,points);}
const ormGroundBase=drawGroundEffects;drawGroundEffects=()=>{ormGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r1b3'||e.hp<=0||!ORM_MOVES[a?.pattern]||!visibleAt(e.x,e.y))continue;ctx.save();ctx.lineWidth=2;
 if(a.pattern==='ormFracture'){for(let i=0;i<a.marks.length;i++){let until=a.windup+i*.38-e.elapsed,mark=a.marks[i];if(until<-.3||!lineClear(a.center,mark))continue;let pos=project(mark.x,mark.y);ctx.fillStyle=until<=0?'#edc78966':'#b6974824';ctx.strokeStyle=until<=0?'#fff0c5':'#dcc17d';ctx.beginPath();ctx.ellipse(pos.x,pos.y,a.radius*ISOX*Math.SQRT2,a.radius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill();ctx.stroke();groundRing(mark.x,mark.y,a.radius*clamp(e.elapsed/(a.windup+i*.38),0,1),'#f3d295',1);}}
 else if(e.elapsed<a.windup+.3){ctx.fillStyle=e.struck?'#edd5a866':'#c1995524';ctx.strokeStyle=e.struck?'#fff0c9':'#e7c48b';drawOrmTail(a);}
 ctx.restore();}};
const ormEffectsBase=drawEffects;drawEffects=()=>{ormEffectsBase();for(let e of enemies){let a=e.attack;if(e.species!=='r1b3'||e.hp<=0||a?.pattern!=='ormFracture'||!visibleAt(e.x,e.y))continue;for(let i=0;i<a.marks.length;i++){let age=e.elapsed-a.windup-i*.38,mark=a.marks[i];if(age<0||age>.5||!lineClear(a.center,mark)||!visibleAt(mark.x,mark.y))continue;ctx.save();ctx.globalAlpha=1-age/.5;for(let j=0;j<5;j++){let angle=j*Math.PI*2/5,pos=project(mark.x+Math.cos(angle)*a.radius*.55,mark.y+Math.sin(angle)*a.radius*.55),height=Math.sin(age/.5*Math.PI)*(35+j*6);ctx.fillStyle=j%2?'#96917c':'#646a65';ctx.strokeStyle='#d5bc85';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pos.x-8,pos.y);ctx.lineTo(pos.x-3,pos.y-height-10);ctx.lineTo(pos.x+9,pos.y-height*.6);ctx.lineTo(pos.x+10,pos.y+3);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();}}};

