// Keep battles responsive without slowing attacks, ailments or projectiles.
const populationLimit=region=>[24,32,40][region]||48;
let populationClock=0;
const populationLoadBase=loadWorld;
loadWorld=()=>{
 populationLoadBase();populationClock=0;
 if(villageOpen)return;
 let contract=campaign().contract;
 let bossTarget=contract&&!contract.killed&&['boss','trial','secret','ex'].includes(contract.kind)?contract.target:null;
 enemies=enemies.filter(e=>!e.boss||e.species===bossTarget);
 let mobs=enemies.filter(e=>!e.boss&&!e.dummy),counts={};
 for(let e of mobs)counts[e.species]=(counts[e.species]||0)+1;
 let q=campaign().contract,remove=new Set();
 for(let e of mobs.slice().reverse()){
  if(mobs.length-remove.size<=populationLimit(worldRegion))break;
  let minimum=q?.kind==='hunt'&&q.target===e.species?Math.max(1,q.required-(q.progress||0)):1;
  if(counts[e.species]>minimum){remove.add(e);counts[e.species]--;}
 }
 enemies=enemies.filter(e=>!remove.has(e));
};
function replenishRegion(random=Math.random){
 if(villageOpen||campaign().contract?.kind==='ex')return 0;
 let mobs=enemies.filter(e=>e.hp>0&&!e.boss&&!e.dummy),budget=Math.min(worldRegion===0?2:3,populationLimit(worldRegion)-mobs.length),added=0;
 if(budget<=0)return 0;
 // Pick from reachable terrain cached at world creation. Never appear on screen,
 // in a boss arena, at the village entrance, or on top of another creature.
 let candidates=regionSpawnSpots.filter(pos=>{
  if(dist(pos,p)<600||dist(pos,p)>1800||visibleAt(pos.x,pos.y))return false;
  let screen=project(pos.x,pos.y);
  if(screen.x>-100&&screen.x<W+100&&screen.y>-160&&screen.y<H+100)return false;
  return !enemies.some(e=>e.hp>0&&dist(e,pos)<180);
 });
 while(added<budget&&candidates.length){
  let index=Math.min(candidates.length-1,Math.floor(random()*candidates.length)),pos=candidates.splice(index,1)[0];
  let weights=REGIONS[worldRegion].enemies.map(spec=>habitatWeight(spec.role,pos,worldRegion));
  let q=campaign().contract;
  if(q?.kind==='hunt'&&(q.progress||0)<q.required){let role=SPECIES[q.target]?.role;if(SPECIES[q.target]?.region===worldRegion)weights[role]*=3;}
  let roll=random()*weights.reduce((a,b)=>a+b,0),role=weights.length-1;
  for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<=0){role=i;break;}}
  if(spawnSpecies(REGIONS[worldRegion].enemies[role],pos.x,pos.y))added++;
  candidates=candidates.filter(other=>dist(other,pos)>=180);
 }
 return added;
}
const populationUpdateBase=update;
update=dt=>{
 let running=started&&!paused&&!dead&&!villageOpen;
 populationUpdateBase(dt);
 if(!running||paused||dead)return;
 populationClock+=dt;
 if(populationClock>=20){populationClock%=20;replenishRegion();}
};
// HUD chains rebuild skill descriptions and modify DOM; combat stays full rate.
const populationHudBase=drawHud;
let populationHudTime=-Infinity;
drawHud=()=>{let now=Date.now();if(now-populationHudTime<100)return;populationHudTime=now;populationHudBase();};
