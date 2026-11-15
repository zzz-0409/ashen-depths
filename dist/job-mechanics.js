const JOB_ACTIONS=[
 ['連撃解放','通常攻撃の最初の命中で連撃を1つ蓄積（最大3）。専用操作で全消費し、前方220へ連撃数×120%。SP15。'],
 ['堅守・反撃','専用操作で堅守開始／解除。毎秒SP10、移動速度65%減、被ダメージ50%軽減。再操作で防いだ量に応じた反撃。攻撃や回避でも堅守終了。'],
 ['魔力解放','通常攻撃で魔力を1つ蓄積（最大3）。専用操作で全消費し、4秒間スキル威力が魔力数×20%増。'],
 ['狩猟標識','照準近くの敵1体を8秒標的にする。その敵への通常攻撃が25%増。SP10。'],
 ['受け流し','SP20で1秒構える。次の攻撃を1回防ぎ、周囲180へ250%の反撃。再使用8秒。'],
 ['祈りの場','SP20で足元に5秒の祈りを設置。半径100以内にいる間、毎秒マナ6・HP2%回復。再使用10秒。'],
 ['集合・進撃','味方の霊狼を呼び戻す／自動攻撃へ戻す。通常攻撃で召喚と集中攻撃の指示。'],
 ['竜への指示','村では竜との契約。野外ではSP25で契約竜に6秒のブレス攻撃を指示。再使用8秒。']
];
let jobMeter=0,jobCooldown=0,jobGuard=false,jobBlocked=0,jobMagic=0,jobMagicTime=0,jobMark=null,jobMarkTime=0,jobParry=0,jobPrayer=null;
function resetJobMechanics(){jobMeter=0;jobCooldown=0;jobGuard=false;jobBlocked=0;jobMagic=0;jobMagicTime=0;jobMark=null;jobMarkTime=0;jobParry=0;jobPrayer=null;resetCompanions()}
const jobResetBase=resetClassTransient;resetClassTransient=()=>{jobResetBase();resetJobMechanics()};
function jobStrike(radius,mult,cone=false){let aim=unproject(mouse.x,mouse.y),angle=Math.atan2(aim.y-p.y,aim.x-p.x),previous=classHitKind;classHitKind='job';try{for(let e of enemies)if(e.hp>0&&dist(p,e)<=radius&&lineClear(p,e)&&(!cone||Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-angle)>.1))hit(e,damage()*mult);}finally{classHitKind=previous}burst(p.x,p.y,radius,profession().color);playSound('slash',p.x,p.y);}
function useJobAction(){
 if(!started||paused||dead||playerAction||jobCooldown>0)return false;let id=combatProfessionType();ensureClassResources();
 if(id===7&&villageOpen){showDragonBonds();return true;}
 let cost=[15,0,0,10,20,20,0,25][id];if(p.sp<cost)return false;
 if((id===0||id===2)&&jobMeter===0)return false;
 if(id===3){let target=unproject(mouse.x,mouse.y);jobMark=enemies.filter(e=>e.hp>0&&dist(e,target)<=140&&dist(e,p)<=650&&lineClear(p,e)).sort((a,b)=>dist(a,target)-dist(b,target))[0];if(!jobMark)return false;jobMarkTime=8;}
 if(id===7&&!p.activeDragon){say('転職所で竜と契約してください');return false;}
 if(id===1&&!jobGuard&&p.sp<10)return false;
 p.sp-=cost;classRest=.6;jobCooldown=[.5,.3,6,6,8,10,.25,8][id];
 if(id===0){jobStrike(220,jobMeter*1.2,true);jobMeter=0;}
 if(id===1){if(jobGuard){jobGuard=false;jobStrike(200,1+Math.min(3,jobBlocked/Math.max(1,maxhp()*.1)));jobBlocked=0;}else{jobGuard=true;jobBlocked=0;}}
 if(id===2){jobMagic=jobMeter*.2;jobMagicTime=4;jobMeter=0;}
 if(id===4)jobParry=1;
 if(id===5)jobPrayer={x:p.x,y:p.y,time:5};
 if(id===6)companionRecall=!companionRecall;
 if(id===7){callCompanion(true);companionFury=6;companionRecall=false;}
 return true;
}
const mechanicHitBase=hit;hit=(e,d)=>{let id=combatProfessionType(),first=classHitKind==='normal'&&!classNormalHit&&!e?.dotTick&&!treeExplosion,before=e?.hp,training=e?.trainingHits||0;if(id===3&&e===jobMark&&jobMarkTime>0&&classHitKind==='normal')d*=1.25;mechanicHitBase(e,d);if(first&&[0,2].includes(id)&&e&&(e.hp<before||(e.trainingHits||0)>training))jobMeter=Math.min(3,jobMeter+1);};
const mechanicSpellBase=spellHit;spellHit=(e,d,b)=>mechanicSpellBase(e,d*(jobMagicTime>0?1+jobMagic:1),b);
const mechanicHurtBase=hurt;hurt=d=>{if(d>0&&!dead&&p.inv<=0){if(jobParry>0){jobParry=0;jobStrike(180,2.5);return;}if(jobGuard&&p.sp>0){jobBlocked=Math.min(maxhp()*.3,jobBlocked+d*.5);d*=.5;}}return mechanicHurtBase(d)};
const mechanicStatBase=stat;stat=key=>mechanicStatBase(key)+(key==='speed'&&jobGuard?-65:0);
const mechanicCastBase=cast;cast=n=>{let previous=playerAction,result=mechanicCastBase(n);if(playerAction!==previous||result===true)jobGuard=false;return result;};
const mechanicUpdateBase=update;update=dt=>{let active=started&&!paused&&!dead;if(active&&jobGuard)classRest=.6;mechanicUpdateBase(dt);if(!active||paused||dead)return;jobCooldown=Math.max(0,jobCooldown-dt);jobMagicTime=Math.max(0,jobMagicTime-dt);jobMarkTime=Math.max(0,jobMarkTime-dt);jobParry=Math.max(0,jobParry-dt);if(jobGuard){p.sp=Math.max(0,p.sp-dt*10);if(p.sp===0)jobGuard=false;}if(jobPrayer){let duration=Math.min(dt,jobPrayer.time);if(dist(p,jobPrayer)<=100&&lineClear(p,jobPrayer)){recoverJobPrayer(duration);}jobPrayer.time-=dt;if(jobPrayer.time<=0)jobPrayer=null;}};
const mechanicGroundBase=drawGroundEffects;drawGroundEffects=()=>{mechanicGroundBase();if(jobGuard)groundRing(p.x,p.y,55,'#8ce4d7',3);if(jobParry>0)groundRing(p.x,p.y,60,'#d0a5ff',4);if(jobPrayer)groundRing(jobPrayer.x,jobPrayer.y,100,'#ffe6a8',2);if(jobMarkTime>0&&jobMark?.hp>0&&visibleAt(jobMark.x,jobMark.y))groundRing(jobMark.x,jobMark.y,35,'#a6efc5',3);};
PAD_DEFAULT.jobAction=10;PAD_NAMES.jobAction='職業専用操作';padProfile.buttons.jobAction??=10;for(let profile of Object.values(padProfiles))profile.buttons.jobAction??=10;
const mechanicPadBase=padFrame;padFrame=dt=>{if(padEnabled&&padWindowActive&&!document.hidden&&started&&!paused&&padProfile.ready){let g=padList().find(g=>g.index===padDevice?.index);if(g&&padEdge(g,'jobAction'))useJobAction();}return mechanicPadBase(dt)};
addEventListener('keydown',e=>{if(e.code==='KeyC'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|SELECT|TEXTAREA/.test(e.target?.tagName||'')){if(useJobAction())e.preventDefault();}});
const jobActionButton=document.createElement('button');jobActionButton.id='jobActionHud';jobActionButton.hidden=true;jobActionButton.onclick=()=>useJobAction();document.body.append(jobActionButton);
let jobHudDraft=null;
function jobHudTarget(){return jobHudDraft||jobActionButton;}
function setJobBasicLabel(text){if(jobHudDraft){jobHudDraft.basicLabel=text;return;}let basic=document.querySelector('.actions button strong');if(basic&&basic.textContent!==text)basic.textContent=text;}
const mechanicHudBase=drawHud;drawHud=()=>{mechanicHudBase();jobHudTarget().hidden=!started||paused||dead;if(jobHudTarget().hidden)return;let id=combatProfessionType(),state=id===0||id===2?' '+jobMeter+'/3':id===1&&jobGuard?' 防御中':id===6?' '+companions.length+'/3'+(companionRecall?' 集合':' 進撃'):id===7?' '+(p.activeDragon?'契約済み':'未契約'):'';jobHudTarget().textContent=JOB_ACTIONS[id][0]+state+(jobCooldown>0?' · '+jobCooldown.toFixed(1)+'秒':'')+' · '+(padActive?(padProfile.buttons.jobAction===10?'Lスティック押込':'Btn '+padProfile.buttons.jobAction):'C');jobHudTarget().title=JOB_ACTIONS[id][1];setJobBasicLabel(id===6?'召喚・指示':id===7?'竜を呼ぶ':id===3?'狙撃':'剣撃');};
const mechanicProfessionBase=profession;profession=()=>{let base=mechanicProfessionBase();return {...base,trait:base.trait+' '+JOB_ACTIONS[combatProfessionType()][1]+' 専用操作：C／左スティック押し込み。'}};

function onJobPrayerRecovery(prayer,hp,mp){}
function recoverJobPrayer(duration){if(!jobPrayer||!Number.isFinite(duration)||duration<=0)return;let hp=p.hp,mp=p.mp;p.mp=Math.min(100,p.mp+duration*6);p.hp=Math.min(maxhp(),p.hp+maxhp()*.02*duration);onJobPrayerRecovery(jobPrayer,Math.max(0,p.hp-hp),Math.max(0,p.mp-mp));}

// Reports actual upper-job hits to optional tutorials without changing combat results.
function reportAdvancedJobAction(kind,source){}
function jobLinkedHit(e,d,kind,source){let hp=e.hp,training=e.trainingHits||0;hit(e,d);if(e.hp<hp||(e.trainingHits||0)>training)reportAdvancedJobAction(kind,source);}
