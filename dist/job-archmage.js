// Archmage prepares fixed ground seals by hitting separate targets, then detonates manually.
let archmageSeals=null;
const ARCHMAGE_SEAL_DESC='魔力3つを解放後、強化スキルの命中地点に星印を最大3つ配置（同じ敵は1回、印同士は80以上）。6秒以内に専用操作で全起爆。各印の半径90へ150%ダメージ、SP20。壁越しには当たらない。';
ADVANCED_JOBS[2][1]+=' '+ARCHMAGE_SEAL_DESC;
function archmageSealActive(s){return !!(s&&s.owner===p&&currentJob()===10&&started&&!dead&&p.hp>0);}
const archmageActionBase=useJobAction;useJobAction=()=>{
 if(archmageSeals&&!archmageSealActive(archmageSeals))archmageSeals=null;
 let s=archmageSeals;
 if(s&&s.points.length){
  if(paused||playerAction||s.age<.4||p.sp<20)return false;
  p.sp-=20;classRest=.6;jobCooldown=Math.max(jobCooldown,1);archmageSeals=null;
  let previous=classHitKind;classHitKind='job';try{for(let at of s.points){for(let e of enemies)if(e.hp>0&&dist(at,e)<=90&&lineClear(at,e))jobLinkedHit(e,s.power*1.5,10);burst(at.x,at.y,90,'#b8c5ff');playSound('frost',at.x,at.y);}}finally{classHitKind=previous;}return true;
 }
 let full=currentJob()===10&&jobMeter===3,power=full?damage():0,result=archmageActionBase();
 if(result&&full)archmageSeals={owner:p,age:0,power,points:[],targets:new Set()};return result;
};
const archmageSpellBase=spellHit;spellHit=(e,d,b)=>{
 let s=archmageSeals,watch=archmageSealActive(s)&&jobMagicTime>0&&!paused&&e&&e.hp>0,hp=e?.hp,training=e?.trainingHits||0,result=archmageSpellBase(e,d,b);
 if(watch&&s===archmageSeals&&s.points.length<3&&!s.targets.has(e)&&(e.hp<hp||(e.trainingHits||0)>training)&&s.points.every(at=>dist(at,e)>=80)){
  s.targets.add(e);s.points.push({x:e.x,y:e.y});burst(e.x,e.y,25,'#b8c5ff');
 }return result;
};
function advanceArchmageSeals(dt){if(!archmageSeals)return;if(!archmageSealActive(archmageSeals)){archmageSeals=null;return;}if(paused||!Number.isFinite(dt)||dt<=0)return;archmageSeals.age+=dt;if(archmageSeals.age>=6)archmageSeals=null;}
const archmageUpdateBase=update;update=dt=>{advanceArchmageSeals(dt);archmageUpdateBase(dt);};
const archmageResetBase=resetClassTransient;resetClassTransient=()=>{archmageSeals=null;return archmageResetBase();};
const archmageGroundBase=drawGroundEffects;drawGroundEffects=()=>{archmageGroundBase();let s=archmageSeals;if(!archmageSealActive(s))return;for(let at of s.points){groundRing(at.x,at.y,90,'#7589c9',1);groundRing(at.x,at.y,24,'#d7deff',3);paintLinkLine({x:at.x-18,y:at.y},{x:at.x+18,y:at.y},'#d7deff',2);paintLinkLine({x:at.x,y:at.y-18},{x:at.x,y:at.y+18},'#d7deff',2);}};
const archmageHudBase=drawHud;drawHud=()=>{archmageHudBase();let s=archmageSeals;if(!archmageSealActive(s)||paused)return;jobHudTarget().textContent=(s.points.length?'星印起爆 ':'星印配置 ')+s.points.length+'/3 · '+Math.max(0,6-s.age).toFixed(1)+'秒 · '+(padActive?(padProfile.buttons.jobAction===10?'Lスティック押込':'Btn '+padProfile.buttons.jobAction):'C');jobHudTarget().title=ARCHMAGE_SEAL_DESC;};
