const DRAGON_BREATHS={
 r1b3:['地走りの裂波','竜の前方340・幅70へ地割れ。並んだ敵を貫く。'],
 r4b0:['砂嵐の環','竜の周囲60～210の輪へ砂嵐。足元の敵には届かない。'],
 r5b3:['白霜の扇','前方250・120度の扇へ凍気。命中した敵を1.5秒減速。'],
 r7b1:['残炎の巣','標的の位置に半径100の炎を3秒残す。0.5秒後から0.75秒ごとに45%、計4回。最大3か所。'],
 r11b1:['星喰いの連鎖','標的から180以内の別の敵へ最大5体を連鎖。1体進むごとに威力15%減。']
};
let dragonFirePools=[];
function dragonBreathHit(e,power,element,context){let old=classHitKind,hp=e.hp,training=e.trainingHits||0;classHitKind='ultimate';try{hit(e,power);applyElements(e,[element],power);}finally{classHitKind=old}if(e.hp<hp||(e.trainingHits||0)>training)onDragonBreathDamage(context);}
function dragonBreathStrike(c,target,power,context){
 if(dead||paused||!target||target.hp<=0||!lineClear(c,target))return;
 let id=c.dragonId||p.activeDragon,angle=Math.atan2(target.y-c.y,target.x-c.x),color=ELEMENTS[c.element].color;
 if(id==='r7b1'){dragonFirePools.push({x:target.x,y:target.y,time:0,next:.5,power,element:c.element,context});if(dragonFirePools.length>3)dragonFirePools.shift();groundBurstDragon(target,100,color);return;}
 if(id==='r11b1'){
  let current=target,from=c,seen=new Set();for(let i=0;i<5&&current;i++){seen.add(current);dragonBreathHit(current,power*Math.pow(.85,i),c.element,context);paintlessDragonLink(from,current,color);from={x:current.x,y:current.y};current=enemies.filter(e=>e.hp>0&&!seen.has(e)&&dist(from,e)<=180&&lineClear(from,e)).sort((a,b)=>dist(from,a)-dist(from,b))[0];}return;
 }
 for(let e of enemies){if(e.hp<=0||!lineClear(c,e))continue;let dx=e.x-c.x,dy=e.y-c.y,length=Math.hypot(dx,dy),along=dx*Math.cos(angle)+dy*Math.sin(angle),side=-dx*Math.sin(angle)+dy*Math.cos(angle),inside=false;
  if(id==='r1b3')inside=along>=-1e-8&&along<=340+1e-8&&Math.abs(side)<=35+1e-8;
  if(id==='r4b0')inside=length>=60&&length<=210;
  if(id==='r5b3')inside=length<=250+1e-8&&(length===0||along/length>=.5-1e-9);
  if(inside){dragonBreathHit(e,power,c.element,context);if(id==='r5b3'&&e.hp>0)e.slow=Math.max(e.slow||0,1.5);}
 }
 if(id==='r1b3'){for(let d=30;d<=330;d+=30){let at={x:c.x+Math.cos(angle)*d,y:c.y+Math.sin(angle)*d};if(!lineClear(c,at))break;groundBurstDragon(at,24,color);}}
 if(id==='r4b0'){groundBurstDragon(c,60,color);groundBurstDragon(c,210,color);}
 if(id==='r5b3'){for(let i=-3;i<=3;i++){let a=angle+i*Math.PI/9;for(let d=50;d<=250;d+=50){let at={x:c.x+Math.cos(a)*d,y:c.y+Math.sin(a)*d};if(!lineClear(c,at))break;emit(at.x,at.y,2,color);}}}
}
function groundBurstDragon(at,r,color){burst(at.x,at.y,r,color);}
function paintlessDragonLink(from,to,color){let n=Math.max(1,Math.ceil(dist(from,to)/25));for(let i=0;i<=n;i++)emit(from.x+(to.x-from.x)*i/n,from.y+(to.y-from.y)*i/n,2,color);}
function advanceDragonFire(dt){if(dead||paused||!Number.isFinite(dt)||dt<=0)return;dragonFirePools=dragonFirePools.filter(pool=>{pool.time=Math.round((pool.time+dt)*1e6)/1e6;while(pool.next<=Math.min(pool.time,3)){pool.next+=.75;for(let e of enemies)if(e.hp>0&&dist(pool,e)<=100&&lineClear(pool,e))dragonBreathHit(e,pool.power*.45,pool.element,pool.context);groundBurstDragon(pool,100,ELEMENTS[pool.element].color);}return pool.time<3;});}
const breathPetStepBase=stepCompanions;stepCompanions=dt=>{advanceDragonFire(dt);return breathPetStepBase(dt)};
const breathPetResetBase=resetCompanions;resetCompanions=()=>{dragonFirePools=[];return breathPetResetBase()};
const breathGroundBase=drawGroundEffects;drawGroundEffects=()=>{breathGroundBase();for(let pool of dragonFirePools){if(!visibleAt(pool.x,pool.y))continue;let color=ELEMENTS[pool.element].color;groundRing(pool.x,pool.y,100,color,2);boundarySigil(pool,35+Math.sin(pool.time*7)*8,color,pool.time,6);}};
const breathBondMenuBase=showDragonBonds;showDragonBonds=()=>{breathBondMenuBase();for(let section of $('card').querySelectorAll('.job-detail')){let button=section.querySelector('button'),id=button?.getAttribute('onclick')?.match(/bondDragon\('([^']+)'\)/)?.[1],row=DRAGON_BREATHS[id];if(row){let p=document.createElement('p');p.textContent=row[0]+'：'+row[1];section.insertBefore(p,button);}}};

function onDragonBreathDamage(context){}
