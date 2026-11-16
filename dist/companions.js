const TAME_DRAGONS=[['r1b3','地底竜オルム',5],['r4b0','砂海竜サハル',4],['r5b3','白竜イス',1],['r7b1','火竜バルグ',0],['r11b1','星葬の竜',7]];
let companions=[],companionFocus=null,companionRecall=false,companionFury=0;
function resetCompanions(){companions=[];companionFocus=null;companionRecall=false;companionFury=0}
const petValidateBase=validateSave;validateSave=data=>{let out=petValidateBase(data);if(data.p.dragons!==undefined){if(!Array.isArray(data.p.dragons)||data.p.dragons.length>5||new Set(data.p.dragons).size!==data.p.dragons.length||data.p.dragons.some(id=>!TAME_DRAGONS.some(d=>d[0]===id)||!out.p.campaign.completed.includes(id)))throw Error('竜の契約が不正です');out.p.dragons=[...data.p.dragons];}if(data.p.activeDragon!==undefined){if(!out.p.dragons?.includes(data.p.activeDragon))throw Error('契約していない竜です');out.p.activeDragon=data.p.activeDragon;}return out};
function bondDragon(id){let row=TAME_DRAGONS.find(d=>d[0]===id),c=campaign();if(!row||!villageOpen||c.rank<5||!c.completed.includes(id))return false;let owned=p.dragons?.includes(id);if(!owned&&(c.materials[id+':0']||0)<10)return false;let ok=worldTransaction(()=>{p.dragons??=[];if(!owned){c.materials[id+':0']-=10;p.dragons.push(id);}p.activeDragon=id;});if(ok){resetCompanions();showDragonBonds();}return ok;}
function showDragonBonds(){worldMenu('竜との契約','<p>討伐して力を認めさせた竜と、その竜の並素材10個で契約できます。契約済みの竜の切り替えは無料。</p>'+TAME_DRAGONS.map(([id,name])=>'<section class="job-detail"><h3>'+name+(p.activeDragon===id?' · 同行中':'')+'</h3>'+materialTile(id+':0',p.dragons?.includes(id)?0:10)+'<button onclick="bondDragon(\''+id+'\')" '+(!villageOpen||campaign().rank<5||!campaign().completed.includes(id)||(!p.dragons?.includes(id)&&(campaign().materials[id+':0']||0)<10)?'disabled':'')+'>'+(p.dragons?.includes(id)?'同行する竜に選ぶ':'契約する')+'</button></section>').join('')+'<button onclick="showJobHall()">転職所へ戻る</button>','dragonBonds');}
function callCompanion(dragon=false){if(dragon&&!p.activeDragon){say('転職所で竜と契約してください');return false;}if(dragon&&companions.some(c=>c.dragon))return true;if(!dragon&&companions.length>=3)return true;let i=companions.length;companions.push({x:p.x,y:p.y,dragon,dragonId:dragon?p.activeDragon:null,life:dragon?60:advancedJob()?45:30,t:.4,anim:0,state:'idle',elapsed:0,facing:1,offset:i,element:dragon?TAME_DRAGONS.find(d=>d[0]===p.activeDragon)[2]:4});return true;}
const petActionBase=performAction;performAction=a=>{if(a.n!==0||combatProfessionType()<6)return petActionBase(a);callCompanion(combatProfessionType()===7);companionFocus=enemies.filter(e=>e.hp>0&&dist(e,a.target)<140&&dist(e,p)<650&&lineClear(p,e)).sort((x,y)=>dist(x,a.target)-dist(y,a.target))[0]||null;companionRecall=false;cd[0]=.6;};
const petActivateBase=activateUltimate;activateUltimate=()=>{let id=combatProfessionType();if(id===7&&!p.activeDragon){say('転職所で竜と契約してください');return false;}let result=petActivateBase();if(result&&id>=6){companions=[];for(let i=0;i<(id===6?3:1);i++)callCompanion(id===7);companionFury=ultimateState?.compact?4:8;}return result;};
const petUltimateBase=advanceUltimate;advanceUltimate=dt=>{if(ultimateState?.type>=6){ultimateState.time+=dt;if(ultimateState.time>=(ultimateState.compact?4:8))ultimateState=null;return;}petUltimateBase(dt)};
const petGroundBase=drawGroundEffects;drawGroundEffects=()=>{let s=ultimateState;if(s?.type>=6)ultimateState=null;try{petGroundBase()}finally{if(s?.type>=6)ultimateState=s}};
function moveCompanion(c,goal,range,dt,owner){
 c.nav=Math.max(0,(c.nav||0)-dt);if(c.navTarget!==owner){c.navTarget=owner;c.nav=0;c.path=[];}
 let distance=dist(c,goal),direct=lineClear(c,goal,12),budget=(c.speed||220)*dt,moved=0;
 if(direct){c.path=[];if(distance<=range)return 0;let step=Math.min(budget,distance-range),dx=(goal.x-c.x)/distance,dy=(goal.y-c.y)/distance;c.facing=dx-dy<0?-1:1;return moveActor(c,dx*step,dy*step,12);}
 // Full-grid search is rate-limited per ally, including unreachable destinations.
 if(c.nav<=0){let destination=nearestFloor(goal.x,goal.y);c.path=destination?findPath(c,destination):[];c.nav=.65+(c.offset||0)*.04;}
 while(budget>0&&c.path?.length){let next=c.path[0],length=dist(c,next);if(length<2){c.path.shift();continue;}
  if(dist(c,goal)<=range&&lineClear(c,goal,12)){c.path=[];break;}
  let step=Math.min(budget,length),dx=(next.x-c.x)/length,dy=(next.y-c.y)/length,travel=moveActor(c,dx*step,dy*step,12);c.facing=dx-dy<0?-1:1;moved+=travel;budget-=step;
  if(dist(c,next)<2)c.path.shift();if(travel<step*.5)break;
 }
 return moved;
}
function stepCompanions(dt){
 if(!Number.isFinite(dt)||dt<=0||paused||dead)return;companionFury=Math.max(0,companionFury-dt);
 companions=companions.filter(c=>{c.life-=dt;if(c.life<=0)return false;c.anim+=dt;c.t-=dt;c.elapsed=Math.max(0,c.elapsed-dt);if(controlMountedCompanion(c,dt))return true;
  let target=!companionRecall&&(companionFocus?.hp>0&&dist(p,companionFocus)<700?companionFocus:enemies.filter(e=>e.hp>0&&!e.dummy&&dist(p,e)<420&&lineClear(c,e)).sort((a,b)=>dist(c,a)-dist(c,b))[0]);
  let goal=target||{x:p.x+Math.cos(c.offset*2.1)*85,y:p.y+Math.sin(c.offset*2.1)*85},range=target?(c.dragon?170:(c.range||65)):12;
  c.state=c.elapsed>0?'attack':'idle';if(moveCompanion(c,goal,range,dt,target||p)>.1)c.state='walk';
  if(dist(c,p)>800){c.x=p.x;c.y=p.y;c.path=[];c.nav=0;}
  if(target&&dist(c,target)<=range+10&&lineClear(c,target)&&c.t<=0){c.t=c.dragon?1.2:(c.interval||.9)/(companionFury>0?2:1);c.elapsed=.35;c.state='attack';let targets=!c.dragon&&c.splash?enemies.filter(e=>e.hp>0&&dist(e,target)<=c.splash&&lineClear(c,e)&&lineClear(target,e)):[target];if(c.dragon&&companionFury>0&&typeof dragonBreathStrike==='function'){dragonBreathStrike(c,target,damage()*1.1*ultimatePowerRate());return true;}else if(c.dragon&&advancedJob()){let next=enemies.find(e=>e!==target&&e.hp>0&&dist(e,target)<=150&&lineClear(target,e));if(next)targets.push(next);}
   let strikeMult=companionStrikeMultiplier(c),previous=classHitKind;classHitKind=companionFury>0?'ultimate':'skill';try{for(let e of targets){let power=damage()*(c.dragon?1.1:(c.power||.55))*(companionFury>0?ultimatePowerRate():1)*strikeMult;if(strikeMult>1&&currentJob()===14)jobLinkedHit(e,power,14,c);else hit(e,power);applyElements(e,[c.element],power);}}finally{classHitKind=previous}burst(target.x,target.y,c.splash||30,ELEMENTS[c.element].color);
  }return true;
 });
}
const petUpdateBase=update;update=dt=>{let running=started&&!paused&&!dead;petUpdateBase(dt);if(dead){resetCompanions();return;}if(running&&!paused)stepCompanions(dt)};
function addCompanionActors(actors){for(let c of companions)if(visibleAt(c.x,c.y)&&!isMountedCompanion(c))actors.push({depth:c.x+c.y,draw:()=>{groundRing(c.x,c.y,c.dragon?35:20,'#8ff4d6',2);actorSprite(c.dragon?dragonSheet:c.form==='owl'?owlSheet:c.form==='rock'?rockBeastSheet:wolfSheet,c.x,c.y,c.dragon?145:(c.size||85),c.state,c.state==='attack'?.35-c.elapsed:c.anim,c.facing,1);let q=project(c.x,c.y);ctx.fillStyle='#bfffe5';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(c.dragon?'契約竜':(c.name||'霊狼'),q.x,q.y-(c.dragon?110:65));}})}
const petWorldBase=loadWorld;loadWorld=(...args)=>{resetCompanions();return petWorldBase(...args)};
const petDummyBase=clearDummy;clearDummy=()=>{resetCompanions();return petDummyBase()};
const petChangeBase=changeJob;changeJob=id=>withGameImages(()=>{let changed=petChangeBase(id);if(changed)resetCompanions();return changed},()=>showJobHall(id),[...BASE_GAME_IMAGES,wolfSheet,dragonSheet]);
const petCharacterImagesBase=characterGameImages;characterGameImages=character=>{let images=petCharacterImagesBase(character);if((character?.job??character?.type)%8>=6)images.push(wolfSheet,dragonSheet);return images;};
const petCloseBase=closePanel;closePanel=(...args)=>{if(menuSurface==='dragonBonds'){showJobHall();return;}return petCloseBase(...args)};

function companionStrikeMultiplier(c){return 1;}

function controlMountedCompanion(c,dt){return false;}
function isMountedCompanion(c){return false;}
