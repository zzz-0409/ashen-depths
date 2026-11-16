// Profession resources and completion boons are separate from gem skills.
const PROFESSIONS=[
 {name:'剣の放浪者',trait:'通常攻撃が3回連続で命中すると、その3回目は威力40%増。SP最大120。',ultimate:'天断三連',desc:'前方へ3回の斬撃。各250%威力・範囲260。発動から0.5秒無敵。',sp:120,regen:18,color:'#f3b55f'},
 {name:'灰の守護者',trait:'受ける攻撃ダメージを10%軽減。被ダメージからの必殺ゲージ蓄積25%増。',ultimate:'不落の聖域',desc:'6秒間、被ダメージ60%減。自分の周囲220へ毎秒120%威力の衝撃波。',sp:100,regen:18,color:'#7de3d0'},
 {name:'星火の術師',trait:'通常攻撃が命中するとマナ3回復（1回の攻撃につき1度）。SP回復20/秒。',ultimate:'星辰崩落',desc:'狙った場所へ0.4秒ごとに6回の星落とし。各180%威力・範囲170。',sp:100,regen:20,color:'#b49bff'}
];
const STAR_BOONS=[
 ['四連の残響','通常攻撃4回命中ごとに、周囲160の敵へ攻撃力40%の追撃。'],
 ['狩猟の息吹','敵を倒すとSP12回復。'],
 ['追撃の糸','スキル命中後2秒以内に通常攻撃を当てるとSP6回復。再使用1秒。'],
 ['静かな呼吸','3秒間ライフダメージを受けなければSP回復が毎秒12増える。'],
 ['回避の鼓動','回避後3秒以内の通常攻撃で必殺ゲージを追加4獲得。'],
 ['星衣の結界','必殺技発動時、最大HP20%分の被弾を肩代わりする盾を6秒得る。'],
 ['最後の踏み込み','SP不足でも10秒に1回、通常攻撃をSP消費なしで使える。'],
 ['終幕の返礼','必殺技で敵を倒すとゲージ8を取り戻す。必殺技1回につき最大24。'],
 ['剣と魔の往復','スキル命中後の通常攻撃でマナ8回復。再使用1秒。'],
 ['巨星への挑戦','ボスへの通常攻撃で必殺ゲージを追加2獲得。1回の攻撃につき1度。'],
 ['残影の帰還','回避後3秒以内の通常攻撃でSP10回復。'],
 ['満天の詠唱','必殺ゲージ満タン中、ジェムスキルの消費コスト15%減。']
];
// Completion no longer doubles the major node. Re-purpose three modest paths.
for(let star of TREE_STARS){star.boonIndex=star.id%12;let n=NODES[star.major],branch=n.talent.branch,tier=n.talent.tier;if([3,7,10].includes(branch)){n.resourceTalent={kind:branch===3?'regen':branch===7?'charge':'capacity',tier};delete n.talent;n.key.desc='ツリー限定 · '+(branch===3?'SP回復 +'+1.5*tier+'/秒。':branch===7?'必殺ゲージ獲得量 +'+4*tier+'%。':'最大SP +'+8*tier+'。');}}
const professionOwnershipBase=treeOwnership;treeOwnership=()=>{let cache=professionOwnershipBase();if(!cache.profession){cache.talents.fill(0);cache.resources={regen:0,charge:0,capacity:0};cache.boons=new Set();for(let id of p?.nodes||[]){let n=NODES[id];if(n?.talent)cache.talents[n.talent.branch]+=n.talent.tier;if(n?.resourceTalent)cache.resources[n.resourceTalent.kind]+=n.resourceTalent.tier;}for(let id of cache.complete)cache.boons.add(TREE_STARS[id].boonIndex);cache.profession=true;}return cache};treeOwnershipRef=null;
const hasStarBoon=index=>treeOwnership().boons.has(index);
function starCompletionDescription(index){let star=TREE_STARS[index],boon=STAR_BOONS[star.boonIndex],complete=treeOwnership().complete.has(index);return (complete?'発動中 · ':'完成で解放 · ')+boon[0]+'：'+boon[1]+' 同系統の加護は重複しない。';}
GEAR_TAGS.resolve={name:'覇気',stages:[{},{},{},{}],text:['必殺ゲージ獲得量 +10%','必殺技の威力 +15%','必殺技発動時SP25回復','必殺技の威力をさらに +25%']};
GEAR_TAGS.endurance={name:'持久',stages:[{},{},{},{}],text:['最大SP +15','SP自然回復 +5/秒','回避のSP消費20%減','通常攻撃のSP消費30%減']};
function combatProfessionType(){return p?.type||0}
function profession(){return PROFESSIONS[p?.type]||PROFESSIONS[0]}
function maxsp(){return profession().sp+treeOwnership().resources.capacity*8+(tagStage('endurance')>=1?15:0)}
function staminaRegen(){return profession().regen+treeOwnership().resources.regen*1.5+(tagStage('endurance')>=2?5:0)+(hasStarBoon(3)&&treeUnhurt>=3?12:0)}
function staminaCost(action){return action===0?8*(tagStage('endurance')>=4?.7:1):24*(tagStage('endurance')>=3?.8:1)}
function ensureClassResources(){if(!p)return;if(!Number.isFinite(p.sp))p.sp=maxsp();if(!Number.isFinite(p.ultimate))p.ultimate=0;p.sp=clamp(p.sp,0,maxsp());p.ultimate=clamp(p.ultimate,0,100);}
let ultimateState=null,classHitKind='skill',classCombo=0,classNormalCharge=0,classNormalHit=false,classSkillCharge=0,classSkillWindow=0,classRest=0,classDodgeWindow=0,classSkillMark=0,classBoonCooldown=0,classFreeCooldown=0,classNormalCount=0,classBarrier=0,classBarrierTime=0;
function resetClassTransient(){ultimateState=null;classCombo=0;classNormalCharge=0;classNormalHit=false;classSkillCharge=0;classSkillWindow=0;classRest=0;classDodgeWindow=0;classSkillMark=0;classBoonCooldown=0;classFreeCooldown=0;classNormalCount=0;classBarrier=0;classBarrierTime=0;}
const classValidateBase=validateSave;validateSave=data=>{let out=classValidateBase(data);if(!Number.isInteger(out.p.type))throw Error('職業が不正です');if(data.p.sp!==undefined)out.p.sp=saveNumber(data.p.sp,'SP',0,100000);if(data.p.ultimate!==undefined)out.p.ultimate=saveNumber(data.p.ultimate,'必殺ゲージ',0,100);return out};
const classLoadBase=loadWorld;loadWorld=()=>{resetClassTransient();let result=classLoadBase();ensureClassResources();return result};
const classDummyBase=clearDummy;clearDummy=()=>{let result=classDummyBase();resetClassTransient();ensureClassResources();p.ultimate=0;p.sp=maxsp();return result};
function ultimateChargeRate(){return 1+treeOwnership().resources.charge*.04+(tagStage('resolve')>=1?.1:0)}
function ultimatePowerRate(){return 1+(tagStage('resolve')>=2?.15:0)+(tagStage('resolve')>=4?.25:0)}
function gainUltimate(amount){ensureClassResources();p.ultimate=Math.min(100,p.ultimate+amount*ultimateChargeRate());}
const classSkillBuildBase=skillBuild;skillBuild=type=>{let b=classSkillBuildBase(type);if(b&&p.ultimate>=100&&hasStarBoon(11))b.cost*=.85;return b};
const classCastBase=cast;cast=n=>{
 if(n!==0&&n!==3)return classCastBase(n);
 ensureClassResources();if(paused||dead||!started||(playerAction&&n!==3)||cd[n]>0)return;
 let cost=staminaCost(n),free=n===0&&p.sp<cost&&hasStarBoon(6)&&classFreeCooldown<=0;
 if(p.sp<cost&&!free){if(notice<=0)say('SP不足 · 少し待つと回復');return false;}
 let action=playerAction,cool=cd[n];if(n===3)playerAction=null;classCastBase(n);
 if(n===3?cd[n]>cool:playerAction!==action||cd[n]>cool){if(n===3){attackTarget=null;moveGoal=null;}if(free)classFreeCooldown=10;else p.sp=Math.max(0,p.sp-cost);classRest=.6;if(n===3)classDodgeWindow=3;return true;}if(n===3)playerAction=action;return false;
};
const classPerformBase=performAction;performAction=action=>{let previous=classHitKind;classHitKind=action.n===0?'normal':'skill';if(action.n===0){classNormalCharge=0;classNormalHit=false;}try{return classPerformBase(action)}finally{if(action.n===0){if(classNormalHit)classCombo=(classCombo+1)%3;else classCombo=0;}classHitKind=previous;}};
const classSpellBase=spellHit;spellHit=(e,d,b)=>{let previous=classHitKind;if(previous!=='ultimate')classHitKind='skill';try{return classSpellBase(e,d,b)}finally{classHitKind=previous}};
const classProjectileBase=advanceProjectile;advanceProjectile=(shot,dt)=>{let previous=classHitKind;classHitKind=shot.enemy?'enemy':'skill';try{return classProjectileBase(shot,dt)}finally{classHitKind=previous}};
const classHitBase=hit;hit=(e,d)=>{
 if(!e||e.hp<=0)return;let before=e.hp,trainingBefore=e.trainingHits||0,normal=classHitKind==='normal'&&!e.dotTick&&!treeExplosion,skill=classHitKind==='skill'&&!e.dotTick&&!treeExplosion,ult=classHitKind==='ultimate',first=normal&&!classNormalHit;
 if(normal&&combatProfessionType()===0&&classCombo===2)d*=1.4;
 classHitBase(e,d);let landed=d>0&&(e.hp<before||(e.dummy&&(e.trainingHits||0)>trainingBefore));if(!landed)return;
 if(normal){let gain=Math.min(7,10-classNormalCharge);if(gain>0){gainUltimate(gain);classNormalCharge+=gain;}if(first){classNormalHit=true;classNormalCount++;if(combatProfessionType()===2)p.mp=Math.min(100,p.mp+3);if(e.boss&&hasStarBoon(9))gainUltimate(2);if(classDodgeWindow>0){if(hasStarBoon(4))gainUltimate(4);if(hasStarBoon(10))p.sp=Math.min(maxsp(),p.sp+10);classDodgeWindow=0;}if(classSkillMark>0&&classBoonCooldown<=0){if(hasStarBoon(2))p.sp=Math.min(maxsp(),p.sp+6);if(hasStarBoon(8))p.mp=Math.min(100,p.mp+8);classBoonCooldown=1;classSkillMark=0;}if(hasStarBoon(0)&&classNormalCount%4===0){let previous=classHitKind;classHitKind='boon';try{for(let other of enemies.filter(v=>v.hp>0&&dist(v,p)<=160&&lineClear(p,v)).slice(0,6))hit(other,damage()*.4);burst(p.x,p.y,160,'#d6c7ff');}finally{classHitKind=previous}}}}
 if(skill){classSkillMark=2;let gain=Math.min(2,4-classSkillCharge);if(gain>0){gainUltimate(gain);classSkillCharge+=gain;}}
 if(before>0&&e.hp<=0&&!e.dummy){if(hasStarBoon(1))p.sp=Math.min(maxsp(),p.sp+12);if(ult&&hasStarBoon(7)&&ultimateState){let gain=Math.min(8,24-ultimateState.refund);ultimateState.refund+=gain;p.ultimate=Math.min(100,p.ultimate+gain);}}
};
const classHurtBase=hurt;hurt=d=>{ensureClassResources();let before=p.hp;if(p.inv<=0){if(combatProfessionType()===1)d*=.9;if(ultimateState?.type===1)d*=.4;if(classBarrier>0){let absorbed=Math.min(d,classBarrier);classBarrier-=absorbed;d-=absorbed;}}if(d>0)classHurtBase(d);let loss=Math.max(0,before-p.hp);if(loss>0)gainUltimate(Math.min(15,2+loss/maxhp()*60)*(combatProfessionType()===1?1.25:1));};
function configuredUltimateCost(){return 100}
function configuredCompactUltimate(){return false}
function activateUltimate(){
 if(!started||paused||dead||playerAction||ultimateState)return false;ensureClassResources();if(p.ultimate<configuredUltimateCost()){say('必殺ゲージが足りません');return false;}
 let target=unproject(mouse.x,mouse.y),angle=Math.atan2(target.y-p.y,target.x-p.x),range=Math.min(500,dist(target,p));p.ultimate-=configuredUltimateCost();
 ultimateState={compact:configuredCompactUltimate(),type:combatProfessionType(),time:0,next:.2,count:0,x:p.x+Math.cos(angle)*range,y:p.y+Math.sin(angle)*range,angle,refund:0,power:damage()*ultimatePowerRate()};
 if(typeof makeAlternateUltimate==='function')ultimateState=makeAlternateUltimate(ultimateState);if(ultimateState.alternate)ultimateState.dragon=p.activeDragon;
 if(combatProfessionType()===0&&!ultimateState.alternate)p.inv=Math.max(p.inv,.5);if(tagStage('resolve')>=3)p.sp=Math.min(maxsp(),p.sp+25);if(hasStarBoon(5)){classBarrier=Math.max(classBarrier,maxhp()*.2);classBarrierTime=Math.max(classBarrierTime,6);}
 playSound(combatProfessionType()===2?'arc':combatProfessionType()===1?'frost':'slash',p.x,p.y);say(profession().ultimate);save();return true;
}
function advanceUltimate(dt){let s=ultimateState;if(!s)return;s.time+=dt;let interval=s.type===0?.3:s.type===1?1:.4,limit=s.compact?(s.type===0?2:3):(s.type===0?3:6);while(s.count<limit&&s.time>=s.next){s.count++;s.next+=interval;let origin=s.type===2?{x:s.x+Math.cos(s.count*2.4)*45,y:s.y+Math.sin(s.count*2.4)*45}:p,radius=s.type===0?260:s.type===1?220:170,mult=s.type===0?2.5:s.type===1?1.2:1.8,previous=classHitKind;classHitKind='ultimate';try{for(let e of enemies)if(e.hp>0&&dist(e,origin)<=radius&&lineClear(p,origin)&&lineClear(origin,e)&&(s.type!==0||Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-s.angle)>.05))hit(e,s.power*mult);}finally{classHitKind=previous}burst(origin.x,origin.y,radius,PROFESSIONS[s.type].color);emit(origin.x,origin.y,16,PROFESSIONS[s.type].color);shake=Math.max(shake,4);playSound(s.type===2?'arc':s.type===1?'frost':'slash',origin.x,origin.y);}
 if(s.time>=(s.compact?(s.type===1?3:s.type===0?.8:1.4):(s.type===1?6:s.type===0?1.15:2.8)))ultimateState=null;
}
const classUpdateBase=update;update=dt=>{let active=started&&!paused&&!dead;if(active)ensureClassResources();classUpdateBase(dt);if(!active)return;if(dead){resetClassTransient();p.ultimate=0;save();return;}if(paused)return;classRest=Math.max(0,classRest-dt);classDodgeWindow=Math.max(0,classDodgeWindow-dt);classSkillMark=Math.max(0,classSkillMark-dt);classBoonCooldown=Math.max(0,classBoonCooldown-dt);classFreeCooldown=Math.max(0,classFreeCooldown-dt);classBarrierTime-=dt;if(classBarrierTime<=0)classBarrier=0;classSkillWindow+=dt;if(classSkillWindow>=.5){classSkillCharge=0;classSkillWindow%=.5;}if(classRest<=0)p.sp=Math.min(maxsp(),p.sp+staminaRegen()*dt);advanceUltimate(dt);};
const classGroundBase=drawGroundEffects;drawGroundEffects=()=>{classGroundBase();if(ultimateState&&ultimateState.type<3){let s=ultimateState,col=PROFESSIONS[s.type].color;if(s.type===2){groundRing(s.x,s.y,170,col,3);for(let i=0;i<3;i++)groundRing(s.x,s.y,70+i*30+Math.sin(clock*8+i)*12,col,1);}else {groundRing(p.x,p.y,s.type===1?220:260,col,3);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.globalAlpha=.6;if(s.type===1){ctx.beginPath();for(let i=0;i<=6;i++){let a=i*Math.PI/3+clock*.12,q=project(p.x+Math.cos(a)*190,p.y+Math.sin(a)*190);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();for(let i=0;i<6;i++){let a=i*Math.PI/3+clock*.12;groundRing(p.x+Math.cos(a)*190,p.y+Math.sin(a)*190,17,col,2);}}else{ctx.lineWidth=5;ctx.beginPath();for(let i=0;i<=20;i++){let a=s.angle-1.5+i*.15,q=project(p.x+Math.cos(a)*240,p.y+Math.sin(a)*240);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();}ctx.restore();}}if(classBarrier>0)groundRing(p.x,p.y,45,'#b4efff',2);};
PAD_DEFAULT.ultimate=11;PAD_NAMES.ultimate='必殺技';padProfile.buttons.ultimate??=11;for(let profile of Object.values(padProfiles))profile.buttons.ultimate??=11;
// Check before padFrame records the current buttons as previous.
const classPadFrameBase=padFrame;padFrame=dt=>{if(padEnabled&&padWindowActive&&!document.hidden&&started&&!paused&&padProfile.ready){let g=padList().find(g=>g.index===padDevice?.index);if(g&&padEdge(g,'ultimate'))activateUltimate();}return classPadFrameBase(dt)};
addEventListener('keydown',e=>{if(e.code==='KeyV'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|SELECT|TEXTAREA/.test(e.target?.tagName||'')){if(activateUltimate())e.preventDefault();}});
const classHud=document.createElement('div');classHud.id='classResources';classHud.hidden=true;classHud.innerHTML='<div class="sp-track"><i></i><span></span></div><button onclick="activateUltimate()" aria-label="必殺技を発動"><i></i><span></span></button>';document.body.append(classHud);
let classHudStamp=0;const classHudBase=drawHud;drawHud=()=>{classHudBase();let hidden=!started||paused||dead;if(classHud.hidden!==hidden)classHud.hidden=hidden;if(classHud.hidden)return;let now=Date.now();if(now-classHudStamp<100)return;classHudStamp=now;ensureClassResources();let sp=classHud.querySelector('.sp-track'),ult=classHud.querySelector('button');sp.querySelector('i').style.width=100*p.sp/maxsp()+'%';hudText(sp.querySelector('span'),'SP '+Math.floor(p.sp)+' / '+maxsp());ult.querySelector('i').style.width=p.ultimate+'%';hudText(ult.querySelector('span'),(p.ultimate>=configuredUltimateCost()?'必殺 READY':'必殺 '+Math.floor(p.ultimate)+'%')+' · '+(padActive?(padProfile.buttons.ultimate===11?'Rスティック押込':'Btn '+padProfile.buttons.ultimate):'V'));ult.classList.toggle('ready',p.ultimate>=configuredUltimateCost());};
inspectNode=id=>{branchingInspectBase(id);let n=NODES[id],star=TREE_STARS[n?.star];if(!star)return;let status=treeOwnership(),count=star.members.filter(i=>status.owned.has(i)).length;$('nodeDetail').insertAdjacentHTML('beforeend','<section class="star-blessing '+(status.complete.has(star.id)?'active':'')+'"><small>星座完成の加護</small><p>'+count+' / '+star.members.length+' 星 · 主星 '+(status.owned.has(star.major)?'取得済み':'未取得')+'</p><p>'+starCompletionDescription(star.id)+'</p></section><small class="sky-provenance">'+star.latin+' · '+star.code+'<br>実線は実在の星の並び。点線は取得ルート。</small><button onclick="nextConstellationStar('+id+')">この星座の次の星を見る</button>');};
characterPassivesHtml=()=>'<h3>星図の専用効果</h3><div class="character-effect-list">'+p.nodes.map(id=>NODES[id]).filter(n=>n.key).map(n=>'<section><h4>'+gearEscape(n.name)+'</h4><p>'+n.key.desc+'</p>'+(n.star!==undefined?'<small>'+starCompletionDescription(n.star)+'</small>':'')+'</section>').join('')+'</div><h3>装備タグ</h3><div class="character-effect-list">'+Object.entries(GEAR_TAGS).filter(([id])=>tagCount(id)>0).map(([id,tag])=>'<section><h4>'+tag.name+' '+tagCount(id)+'部位</h4><p>'+tag.text.slice(0,tagStage(id)).join('<br>')+'</p></section>').join('')+'</div>';
const classSummaryBase=characterSummaryHtml;characterSummaryHtml=()=>{ensureClassResources();return classSummaryBase().replace('</dl>',csRow('SP',Math.floor(p.sp)+' / '+maxsp())+csRow('必殺ゲージ',Math.floor(p.ultimate)+'%')+'</dl>')+'<button onclick="showProfessionGuide()">'+profession().name+' · 職業と必殺技</button>'};
const classCombatStatsBase=characterCombatHtml;characterCombatHtml=()=>classCombatStatsBase()+'<h3>'+profession().name+' · SPと必殺技</h3><dl>'+csRow('最大SP',maxsp())+csRow('SP回復',csNumber(staminaRegen())+'/秒（消費後0.6秒待機）')+csRow('通常攻撃の消費SP',staminaCost(0))+csRow('回避の消費SP',staminaCost(3))+'</dl><p>'+profession().trait+'</p><p>'+profession().ultimate+'：'+profession().desc+'</p>';
function professionGuideHtml(compare=false){
 let c=profession(),rate=ultimateChargeRate(),control=padProfile.buttons.ultimate===11?'右スティック押し込み':'Button '+padProfile.buttons.ultimate;
 if(compare)return '<div class="character-effect-list">'+PROFESSIONS.map((job,i)=>'<section><h3>'+job.name+(combatProfessionType()===i?' · 現在の職業':'')+'</h3><p>'+job.trait+'</p><h4>'+job.ultimate+'</h4><p>'+job.desc+'</p></section>').join('')+'</div><button onclick="showProfessionGuide()">自分の職業へ戻る</button>';
 return '<h3>'+c.name+'</h3><p>'+c.trait+'</p><h3>'+c.ultimate+'</h3><p>'+c.desc+'</p><p>発動：V / '+control+' / 画面下の必殺ゲージ。ゲージ100を消費。</p><dl class="profession-resource-grid">'+csRow('最大SP',maxsp())+csRow('通常攻撃 / 回避',csNumber(staminaCost(0))+' / '+csNumber(staminaCost(3))+' SP')+csRow('SP自然回復',csNumber(staminaRegen())+' /秒')+csRow('通常攻撃の命中',csNumber(7*rate)+' ゲージ（1振り最大 '+csNumber(10*rate)+'）')+csRow('スキルの命中',csNumber(2*rate)+' ゲージ（0.5秒で最大 '+csNumber(4*rate)+'）')+csRow('必殺技の威力補正','×'+csNumber(ultimatePowerRate()))+'</dl><p class="muted">現在の装備・星座効果を反映。条件付きの追加ゲージは別途加算。SPは消費後0.6秒で回復開始。被ダメージでもゲージが増え、必殺技自体の命中では増えません。</p><button onclick="showProfessionGuide(true)">全職業の特性を比較</button><button onclick="panel(\'inventory\')">装備へ戻る</button>';
}
function showProfessionGuide(compare=false){worldMenu(compare?'職業の比較':'職業・SP・必殺技',professionGuideHtml(compare),'profession');}

function totalClassGuard(base){return 100*(1-(1-base/100)*(combatProfessionType()===1?.9:1)*(ultimateState?.type===1?.4:1));}
const classSelectionBase=showClassSelection;showClassSelection=()=>{classSelectionBase();$('card').querySelectorAll('button[onclick^="newGame("]').forEach(button=>{let type=Number(button.getAttribute('onclick').match(/\d+/)[0]),c=PROFESSIONS[type];button.innerHTML=c.name+'<small>'+c.trait+'</small><small>必殺：'+c.ultimate+' · '+c.desc+'</small>';});};
const classRecipeBase=forgeRecipeItem;forgeRecipeItem=recipe=>{let item=classRecipeBase(recipe);if(recipe.rank>=3){let tag=(recipe.rank+recipe.index)%3===0?'resolve':(recipe.rank+recipe.index)%3===1?'endurance':null;if(tag)item.tags=[...new Set([...(item.tags||[]),tag])].slice(0,3);}return item};
LESSONS[1][2]+=' 通常攻撃はSP8を消費。命中で必殺ゲージが大きく増えます。';LESSONS[1][3]+=' 通常攻撃はSP8を消費。';LESSONS[4][2]+=' SP24が必要。SPは少し待つと自然回復します。';LESSONS[4][3]+=' 回避はSP24を消費。';LESSONS[10][2]+=' 必殺ゲージ100で右スティック押し込み。';LESSONS[10][3]+=' 必殺ゲージ100でVキー。';
const classCloseBase=closePanel;closePanel=(...args)=>{if(menuSurface==='profession'){panel('inventory');return;}return classCloseBase(...args)};
