// Damage and telegraphs share the same immutable geometry for each cast.
const FINAL_ATTACKS={
 riftBreath:{name:'虚滅のブレス',hint:'竜の側面へ回避',windup:1.9},
 riftRing:{name:'断界の環',hint:'内側の安全地帯へ',windup:1.65},
 riftCross:{name:'終焉の十字',hint:'十字の外へ移動',windup:1.55},
 riftStars:{name:'崩星',hint:'落星の円から離れる',windup:1.8}
};
function beginFinalAttack(e,pattern){
 e.finalProvoked=true;
 let phase=e.hp/e.max<.5?2:1,center={x:e.x,y:e.y},target={x:p.x,y:p.y},angle=Math.atan2(p.y-e.y,p.x-e.x);
 e.phase=phase;e.state='attack';e.elapsed=0;e.struck=false;e.attack={pattern,final:true,phase,center,target,angle,windup:FINAL_ATTACKS[pattern].windup,inner:phase===2?95:120,outer:phase===2?380:340,halfWidth:phase===2?60:45,length:phase===2?380:340,radius:phase===2?125:105};
 e.attack.marks=[target];if(pattern==='riftStars'&&phase===2)for(let side of [-1,1])e.attack.marks.push({x:target.x+Math.cos(angle+Math.PI/2)*220*side,y:target.y+Math.sin(angle+Math.PI/2)*220*side});
}
const finalHitBase=hit;hit=(e,damage)=>{if(e.exRank===100&&e.hp>0&&damage>0)e.finalProvoked=true;return finalHitBase(e,damage)};
function finalAttackContains(a,point){
 if(a.pattern==='riftBreath'){let dx=point.x-a.center.x,dy=point.y-a.center.y,d=Math.hypot(dx,dy),offset=Math.atan2(Math.sin(Math.atan2(dy,dx)-a.angle),Math.cos(Math.atan2(dy,dx)-a.angle));return d<=a.outer*1.45&&Math.abs(offset)<=.38}
 if(a.pattern==='riftRing'){let distance=dist(a.center,point);return distance>=a.inner&&distance<=a.outer}
 if(a.pattern==='riftCross'){let dx=point.x-a.center.x,dy=point.y-a.center.y,x=dx*Math.cos(a.angle)+dy*Math.sin(a.angle),y=-dx*Math.sin(a.angle)+dy*Math.cos(a.angle);return Math.abs(x)<=a.length&&Math.abs(y)<=a.halfWidth||Math.abs(y)<=a.length&&Math.abs(x)<=a.halfWidth}
 return a.pattern==='riftStars'&&a.marks.some(mark=>dist(mark,point)<=a.radius);
}
const finalEnemyAnimation=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.exRank===100&&e.hp>0&&!(e.reactionStun>0)&&e.state!=='attack'&&e.t<=dt&&dist(e,p)<650&&lineClear(e,p)){
  let patterns=['riftBreath','riftRing','riftCross','riftStars'];beginFinalAttack(e,patterns[(e.finalCycle||0)%patterns.length]);e.finalCycle=(e.finalCycle||0)+1;
 }
 finalEnemyAnimation(e,dt);
};
const finalAttackBase=worldAttack;worldAttack=e=>{
 let a=e.attack;if(!a?.final)return finalAttackBase(e);if(e.hp<=0||a.resolved)return;a.resolved=true;
 if(finalAttackContains(a,p)&&lineClear(a.center,p))hurt((22+SPECIES[e.species].region*7)*ENEMY_ROLES[e.role].damage*2.1*(a.phase===2?1.3:1)*(1+e.exRank/50));
 e.finalFlash={...a,life:.35};emit(a.center.x,a.center.y,32,'#d7a4ff');shake=Math.max(shake,6);if(typeof playSound==='function')playSound('vortex',a.center.x,a.center.y);
};
const finalEnemyTick=tickAilments;tickAilments=(e,dt)=>{finalEnemyTick(e,dt);if(e.finalFlash)e.finalFlash.life=Math.max(0,e.finalFlash.life-dt)};
function finalPolygon(a,coords){ctx.beginPath();for(let [i,[x,y]]of coords.entries()){let s=project(a.center.x+x*Math.cos(a.angle)-y*Math.sin(a.angle),a.center.y+x*Math.sin(a.angle)+y*Math.cos(a.angle));i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y)}ctx.closePath();ctx.fill();ctx.stroke()}
function drawFinalTelegraph(e){let flash=e.finalFlash?.life>0,a=flash?e.finalFlash:e.attack;if(!a?.final||!flash&&e.struck||!visibleAt(e.x,e.y))return;ctx.save();let progress=flash?1:clamp(e.elapsed/a.windup,0,1);ctx.strokeStyle=flash?'#fff4de':'#ffc5e0';ctx.fillStyle=flash?'#fbdfff66':'rgba(205,70,122,'+(.12+progress*.15)+')';ctx.lineWidth=flash?4:2;
 if(a.pattern==='riftBreath'){let points=[[0,0]],radius=a.outer*1.45;for(let i=0;i<=24;i++){let angle=-.38+i*.76/24;points.push([Math.cos(angle)*radius,Math.sin(angle)*radius])}finalPolygon(a,points)}
 else if(a.pattern==='riftRing'){let s=project(a.center.x,a.center.y);ctx.beginPath();ctx.ellipse(s.x,s.y,a.outer*ISOX*Math.SQRT2,a.outer*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.ellipse(s.x,s.y,a.inner*ISOX*Math.SQRT2,a.inner*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill('evenodd');groundRing(a.center.x,a.center.y,a.outer,ctx.strokeStyle,2);groundRing(a.center.x,a.center.y,a.inner,'#9fe6c3',3)}
 else if(a.pattern==='riftCross'){let l=a.length,w=a.halfWidth;finalPolygon(a,[[-l,-w],[l,-w],[l,w],[-l,w]]);finalPolygon(a,[[-w,-l],[w,-l],[w,l],[-w,l]])}
 else for(let mark of a.marks){let s=project(mark.x,mark.y);ctx.beginPath();ctx.ellipse(s.x,s.y,a.radius*ISOX*Math.SQRT2,a.radius*ISOY*Math.SQRT2,0,0,Math.PI*2);ctx.fill();ctx.stroke();groundRing(mark.x,mark.y,a.radius*progress,'#ffd6ef',2)}
 ctx.restore();
}
const finalEffectsBase=drawGroundEffects;drawGroundEffects=()=>{finalEffectsBase();for(let e of enemies)if(e.exRank===100&&e.hp>0)drawFinalTelegraph(e)};
const dragonSheet=new Image();dragonSheet.assetSrc='assets/void-dragon-anim.png';
const finalActorBase=drawRegionEnemy;drawRegionEnemy=(e,size)=>{if(e.exRank!==100)return finalActorBase(e,size);let pos=project(e.x,e.y);ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,0,size*.23,size*.095,0,0,Math.PI*2);ctx.fill();if(dragonSheet.complete&&dragonSheet.naturalWidth){let time=e.state==='attack'?e.elapsed/(e.attack?.windup||1)*.65:e.anim,f=spriteFrame(e.state,time),sw=dragonSheet.naturalWidth/4,sh=dragonSheet.naturalHeight/3,h=size*sh/sw;ctx.filter=e.flash>0?'brightness(1.8)':'none';ctx.drawImage(dragonSheet,f.col*sw,f.row*sh,sw,sh,-size/2,-h*.82,size,h)}ctx.restore();return true};

