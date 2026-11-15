const VAL_MOVES={valCharges:{name:'坑道の連鎖爆破',hint:'火薬の円から離れる'},valHammer:{name:'監督の大槌',hint:'薙ぎ払いの外へ。後半は足元の追撃にも注意'}};
function beginValAttack(e,charges){
 let phase=e.hp/e.max<.5?2:1,origin={x:e.x,y:e.y},angle=Math.atan2(p.y-e.y,p.x-e.x);
 e.state='attack';e.elapsed=0;e.struck=false;e.phase=phase;e.valCycle=(e.valCycle||0)+1;e.facing=Math.cos(angle)-Math.sin(angle)<0?-1:1;
 let marks=(phase===2?[0,-150,150,-300,300]:[0,-150,150]).map((offset,i)=>({x:p.x+Math.cos(angle+Math.PI/2)*offset,y:p.y+Math.sin(angle+Math.PI/2)*offset,at:1.8+i*.4,hit:false})).filter(m=>lineClear(origin,m));
 e.attack={pattern:charges?'valCharges':'valHammer',bespoke:true,phase,origin,angle,windup:charges?1.8:1.4,radius:100,marks,swings:[{angle,at:1.4,hit:false},{angle:angle+Math.PI,at:2.2,hit:false},...(phase===2?[{angle,at:3,hit:false,stomp:true}]:[])]};
}
function valSwingContains(a,swing,point){let d=dist(a.origin,point);if(swing.stomp)return d<=135;let angle=Math.atan2(point.y-a.origin.y,point.x-a.origin.x)-swing.angle;return d<=220&&Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=1.05;}
const valAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!=='r1b2')return valAnimateBase(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
 if(e.state!=='attack'){
  e.t-=dt;e.nav=(e.nav||0)-dt;let d=dist(e,p),charges=(e.valCycle||0)%2===0,range=charges?480:210;
  if(e.t<=0&&d<=range&&lineClear(e,p))beginValAttack(e,charges);
  else{e.state='idle';if(d<=range*.8&&lineClear(e,p)||(d>750&&!e.bossProvoked))return;if(e.nav<=0){e.nav=.6;e.path=lineClear(e,p)?[{x:p.x,y:p.y}]:findPath(e,p);}let target=e.path?.[0];if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,85*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,14)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}return;}
 }
 let a=e.attack;if(!a?.pattern?.startsWith('val'))return;e.elapsed+=dt;
 let impacts=a.pattern==='valCharges'?a.marks:a.swings;
 for(let impact of impacts)if(!impact.hit&&e.elapsed>=impact.at){impact.hit=true;
  if(a.pattern==='valCharges'){if(lineClear(a.origin,impact)){if(dist(impact,p)<=a.radius&&lineClear(impact,p))hurt(a.phase===2?85:65);burst(impact.x,impact.y,90,'#e7ad68');if(typeof playSound==='function')playSound('fire',impact.x,impact.y);}}
  else{if(valSwingContains(a,impact,p)&&lineClear(a.origin,p))hurt(impact.stomp?95:75);if(typeof playSound==='function')playSound('impact',e.x,e.y);}
 }
 e.struck=impacts.every(i=>i.hit);let end=(impacts.at(-1)?.at||a.windup)+1.2;if(e.elapsed>=end){e.state='idle';e.attack=null;e.t=1.2;}
};
const valSheet=new Image();valSheet.assetSrc='assets/cave-val-anim.png';
const valDrawBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{
 if(e.species!=='r1b2')return valDrawBase(e,size);let pos=project(e.x,e.y),frame=spriteFrame(e.state,e.anim),a=e.attack,facing=e.facing||1;
 if(a?.pattern?.startsWith('val'))frame={row:2,col:e.elapsed<a.windup*.45?0:e.elapsed<a.windup?1:e.elapsed<a.windup+.35?2:3};
 if(a?.pattern==='valHammer'){let index=a.swings.findIndex(s=>e.elapsed<s.at+.25);if(index>=0){let swing=a.swings[index],start=index?a.swings[index-1].at+.25:0,progress=(e.elapsed-start)/(swing.at-start);frame={row:2,col:progress<.45?0:progress<1?1:2};if(index===1)facing*=-1;}}
 ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(facing,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,34,12,0,0,Math.PI*2);ctx.fill();
 if(valSheet.complete&&valSheet.naturalWidth){let sw=valSheet.naturalWidth/4,sh=valSheet.naturalHeight/3,w=235,h=w*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(valSheet,frame.col*sw,frame.row*sh,sw,sh,-w/2,-h*[.9,.84,.79][frame.row],w,h);}ctx.restore();return true;
};
const valGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 valGroundBase();for(let e of enemies){let a=e.attack;if(e.species!=='r1b2'||e.hp<=0||!a?.pattern?.startsWith('val'))continue;ctx.save();
  if(a.pattern==='valCharges')for(let mark of a.marks){if(!visibleAt(mark.x,mark.y)||e.elapsed>mark.at+.25)continue;let active=e.elapsed>=mark.at;groundRing(mark.x,mark.y,a.radius,active?'#fff1be':'#e9aa69',active?3:2);if(!active){groundRing(mark.x,mark.y,a.radius*clamp(e.elapsed/mark.at,0,1),'#db8851',1);drawValCharge(mark);}}
  else if(visibleAt(e.x,e.y))for(let [index,swing]of a.swings.entries()){
   if(e.elapsed>swing.at+.2||e.elapsed<(index?a.swings[index-1].at:0))continue;ctx.strokeStyle=e.elapsed>=swing.at?'#fff5c9':'#e8bc7a';ctx.fillStyle=e.elapsed>=swing.at?'#ffde8f66':'#e8bc7a28';ctx.lineWidth=2;
   if(swing.stomp)groundRing(a.origin.x,a.origin.y,135,ctx.strokeStyle,3);
   else{let points=[[0,0]];for(let i=0;i<=18;i++){let angle=-1.05+i*2.1/18;points.push([Math.cos(angle)*220,Math.sin(angle)*220]);}finalPolygon({center:a.origin,angle:swing.angle},points);}
  }ctx.restore();
 }
};
const valSizeBase=enemyVisualSize;enemyVisualSize=e=>e.species==='r1b2'?235:valSizeBase(e);

function drawValCharge(mark){let s=project(mark.x,mark.y);ctx.save();ctx.translate(s.x,s.y);ctx.fillStyle='#62432c';ctx.fillRect(-9,-18,18,18);ctx.beginPath();ctx.ellipse(0,0,9,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#987048';ctx.beginPath();ctx.ellipse(0,-18,9,4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#262c31';ctx.lineWidth=3;for(let y of [-13,-3]){ctx.beginPath();ctx.ellipse(0,y,9,3,0,0,Math.PI);ctx.stroke();}ctx.strokeStyle='#ddc38b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(1,-18);ctx.lineTo(3,-26);ctx.stroke();ctx.fillStyle='#ffdc87';ctx.beginPath();ctx.arc(3,-27,2.5,0,Math.PI*2);ctx.fill();ctx.restore();}
