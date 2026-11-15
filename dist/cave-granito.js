// Locked twin fist strikes leave a central lane; phase two closes it with a delayed crush.
const GRANITO_MOVES={granitoFists:{name:'晶拳の連撃',hint:'左右の拳を避ける。激昂中は中央の追撃にも注意'},granitoCrush:{name:'両拳の地砕き',hint:'大きな円の外へ離れ、打撃後に反撃'}};
function beginGranitoAttack(e,pattern='granitoFists'){
 let angle=Math.atan2(p.y-e.y,p.x-e.x),phase=e.hp/e.max<.5?2:1,reach=clamp(dist(e,p),140,240),forward={x:Math.cos(angle),y:Math.sin(angle)},center={x:e.x,y:e.y};
 let marks=[-115,115].map((side,i)=>({x:e.x+forward.x*reach-forward.y*side,y:e.y+forward.y*reach+forward.x*side,radius:95,time:1.45+i*.6,hit:false}));
 if(phase===2)marks.push({x:e.x+forward.x*reach,y:e.y+forward.y*reach,radius:110,time:2.7,hit:false});
 if(pattern==='granitoCrush')marks=[{x:e.x,y:e.y,radius:phase===2?230:190,time:1.65,hit:false}];
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.facing=forward.x-forward.y<0?-1:1;
 e.attack={pattern,bespoke:true,phase,angle,center,windup:marks[0].time,marks,end:marks.at(-1).time+1.5};
}
function granitoDamageFactor(e){return e.species==='r1b0'&&GRANITO_MOVES[e.attack?.pattern]&&e.struck?1.35:1;}
const granitoHitBase=hit;hit=(e,d)=>granitoHitBase(e,d*granitoDamageFactor(e));
const granitoAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1b0')return granitoAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 let next=(e.granitoCycle||0)%2?'granitoCrush':'granitoFists',range=next==='granitoCrush'?250:290;
 if(e.state!=='attack'&&e.t<=dt&&dist(e,p)<=range&&lineClear(e,p)){beginGranitoAttack(e,next);e.granitoCycle=(e.granitoCycle||0)+1;}
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);let a=e.attack;
 if(!GRANITO_MOVES[a?.pattern]){
  e.t-=dt;e.nav-=dt;e.state='idle';let d=dist(e,p),clear=lineClear(e,p);if((d>750&&!e.bossProvoked)||(d<=range&&clear))return;
  if(e.nav<=0){e.nav=.5;e.path=clear?[{x:p.x,y:p.y}]:findPath(e,p);}let target=e.path?.[0];if(!target)return;let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10){e.path.shift();return;}let step=Math.min(len,65*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,20)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;return;
 }
 e.elapsed+=dt;
 for(let [i,mark]of a.marks.entries())if(e.elapsed>=mark.time&&!mark.hit){mark.hit=true;let clear=lineClear(a.center,mark);if(clear&&dist(mark,p)<=mark.radius&&lineClear(mark,p))hurt(a.pattern==='granitoCrush'?(a.phase===2?105:85):i===2?110:a.phase===2?90:70);if(clear&&typeof playSound==='function')playSound('impact',mark.x,mark.y);}
 e.struck=a.marks.every(mark=>mark.hit);
 if(e.elapsed>=a.end){e.attack=null;e.state='idle';e.t=.9;}
};
const granitoSheet=new Image();granitoSheet.assetSrc='assets/cave-granito-anim.png';
const granitoDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1b0')return granitoDrawBase(e,size);let pos=project(e.x,e.y),a=e.attack,frame=spriteFrame(e.state,e.anim);
 if(a?.pattern==='granitoCrush')frame={row:2,col:e.elapsed<a.windup?0:3};
 else if(a?.pattern==='granitoFists')frame={row:2,col:e.elapsed<1.45?0:e.elapsed<2.05?1:e.elapsed<2.7||a.phase!==2?2:3};
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,0,70,23,0,0,Math.PI*2);ctx.fill();
 if(granitoSheet.complete&&granitoSheet.naturalWidth){let sw=granitoSheet.naturalWidth/4,sh=granitoSheet.naturalHeight/3,w=340,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(granitoSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*.84,w,h);}ctx.restore();return true;
};
const granitoGroundBase=drawGroundEffects;drawGroundEffects=()=>{granitoGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r1b0'||e.hp<=0||!GRANITO_MOVES[a?.pattern]||!visibleAt(e.x,e.y))continue;for(let [i,mark]of a.marks.entries()){let until=mark.time-e.elapsed;if(until<-.3||!lineClear(a.center,mark))continue;let pos=project(mark.x,mark.y);ctx.save();ctx.lineWidth=2;ctx.fillStyle=until<=0?'#b8f7ff80':i===2?'#eaa45d26':'#69cce530';ctx.strokeStyle=until<=0?'#eaffff':i===2?'#ffce87':'#88e6f4';ctx.beginPath();ctx.ellipse(pos.x,pos.y,mark.radius*ISOX*Math.SQRT2,mark.radius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill();ctx.stroke();groundRing(mark.x,mark.y,mark.radius*clamp(e.elapsed/mark.time,0,1),i===2?'#ffd396':'#c1f7ff',1);ctx.restore();}}};
const granitoEffectsBase=drawEffects;drawEffects=()=>{granitoEffectsBase();for(let e of enemies){let a=e.attack;if(e.species!=='r1b0'||e.hp<=0||!GRANITO_MOVES[a?.pattern]||!visibleAt(e.x,e.y))continue;for(let mark of a.marks){let age=e.elapsed-mark.time;if(age<0||age>.55||!lineClear(a.center,mark)||!visibleAt(mark.x,mark.y))continue;ctx.save();ctx.globalAlpha=1-age/.55;for(let j=0;j<8;j++){let t=j*Math.PI/4,r=mark.radius*(.25+age),pos=project(mark.x+Math.cos(t)*r,mark.y+Math.sin(t)*r),h=12+Math.sin(age/.55*Math.PI)*(j%2?44:28);ctx.fillStyle=j%2?'#8de5ed':'#496c7e';ctx.strokeStyle='#c0f4f5';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pos.x-7,pos.y);ctx.lineTo(pos.x-2,pos.y-h);ctx.lineTo(pos.x+8,pos.y-h*.5);ctx.lineTo(pos.x+6,pos.y+3);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();}}};
