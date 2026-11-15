// Job identity is separate from the original character archetype and its saved starting stats.
PROFESSIONS.push(
 {name:'風追いの遊撃手',trait:'180以上離れた敵への通常攻撃が30%強化。',ultimate:'天穿つ斉射',desc:'前方650・幅90へ180%の貫通斉射を0.25秒ごとに6回。方向は発動時に固定。',sp:110,regen:20,color:'#a6efc5'},
 {name:'影踏みの決闘士',trait:'回避後3秒以内、次の通常攻撃の最初の命中が75%強化。',ultimate:'八影連舞',desc:'周囲300の最も近い敵へ150%を8回。射線が必要。各打撃で対象を選び直す。',sp:130,regen:18,color:'#d0a5ff'},
 {name:'灯火の祈祷師',trait:'通常攻撃の最初の命中でHP3回復。',ultimate:'黎明の祈り',desc:'5秒間、毎秒自分の最大HPの5%を回復し、周囲200へ110%の光波を放つ。',sp:100,regen:18,color:'#ffe6a8'}
);
PROFESSIONS.push({name:'幻獣の召喚士',trait:'通常攻撃で30秒戦う霊狼を召喚（最大3体）。3体いる間は照準付近の敵へ集中攻撃を指示。',ultimate:'百獣の号令',desc:'霊狼3体を呼び直し、8秒間、仲間の攻撃間隔を半分にする。',sp:110,regen:18,color:'#8be4ce'},{name:'契竜の滅竜師',trait:'転職所で討伐済みの竜と契約。通常攻撃で契約竜を呼び出し、照準付近の敵へ指示。',ultimate:'竜魂解放',desc:'契約竜を呼び出し、8秒間、契約した竜に応じた専用ブレスを使う。未契約では発動不可。',sp:120,regen:18,color:'#f7ac73'});
const ADVANCED_JOBS=[
 ['天断の剣聖','通常攻撃の3連撃目の最初の命中でSP8回復。'],
 ['不落の聖騎士','実際にHPダメージを受けるとマナ5回復。'],
 ['星界の大魔導師','通常攻撃のマナ回復が3から6に増加。'],
 ['天翔の狙撃手','180以上離れた敵への通常攻撃の最初の命中でSP4回復。'],
 ['夜渡りの剣舞士','回避後の強化通常攻撃が命中すると最大HP5%回復。'],
 ['暁光の司祭','通常攻撃の回復に最大HP2%を追加。'],
 ['万獣の導師','霊狼の持続時間が45秒になる。'],
 ['竜王の盟主','契約竜の通常攻撃が2体まで連鎖する。']
];
function currentJob(){return Number.isInteger(p?.job)?p.job:p?.type||0}
combatProfessionType=()=>currentJob()%8;
function advancedJob(){return currentJob()>=8}
normalAttackReach=()=>combatProfessionType()>=6?600:combatProfessionType()===3?500:105;
normalAttackArc=()=>combatProfessionType()===3?.985:.2;
const jobPerformBase=performAction;performAction=action=>{let result=jobPerformBase(action);if(action.n===0&&combatProfessionType()===3){let a=Math.atan2(action.target.y-p.y,action.target.x-p.x);paintlessJobShot(a); }return result};
function paintlessJobShot(a){for(let d=40;d<500;d+=35){let at={x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d};if(!lineClear(p,at))break;emit(at.x,at.y,2,'#a6efc5');}playSound('arrow',p.x,p.y);}
profession=()=>{let id=combatProfessionType(),base=PROFESSIONS[id];return advancedJob()?{...base,name:ADVANCED_JOBS[id][0],trait:base.trait+' '+ADVANCED_JOBS[id][1],desc:base.desc+' 上位職：必殺技の威力20%増。'}:base};
const jobValidateBase=validateSave;validateSave=data=>{let out=jobValidateBase(data);if(data.p.job!==undefined){let id=data.p.job;if(!Number.isInteger(id)||id<0||id>=16)throw Error('職業IDが不正です');if(id!==out.p.type&&(out.p.campaign?.rank||1)<(id>=8?8:5))throw Error('転職の必要ランクに達していません');out.p.job=id;}return out};
const jobPowerBase=ultimatePowerRate;ultimatePowerRate=()=>jobPowerBase()*(advancedJob()?1.2:1);
const jobHitBase=hit;hit=(e,d)=>{
 let id=combatProfessionType(),normal=classHitKind==='normal'&&!e?.dotTick&&!treeExplosion,first=normal&&!classNormalHit,combo=classCombo,dodge=classDodgeWindow>0,far=e&&dist(p,e)>=180,before=e?.hp,training=e?.trainingHits||0;
 if(normal&&id===3&&far)d*=1.3;if(first&&id===4&&dodge)d*=1.75;
 jobHitBase(e,d);if(!first||!e||!(e.hp<before||(e.trainingHits||0)>training))return;
 if(id===5)p.hp=Math.min(maxhp(),p.hp+3+(advancedJob()?maxhp()*.02:0));
 if(!advancedJob())return;
 if(id===0&&combo===2)p.sp=Math.min(maxsp(),p.sp+8);
 if(id===2)p.mp=Math.min(100,p.mp+3);
 if(id===3&&far)p.sp=Math.min(maxsp(),p.sp+4);
 if(id===4&&dodge)p.hp=Math.min(maxhp(),p.hp+maxhp()*.05);
};
const jobHurtBase=hurt;hurt=d=>{let hp=p.hp,result=jobHurtBase(d);if(advancedJob()&&combatProfessionType()===1&&p.hp<hp)p.mp=Math.min(100,p.mp+5);return result};
const jobUltimateBase=advanceUltimate;advanceUltimate=dt=>{
 let s=ultimateState;if(!s||s.type<3)return jobUltimateBase(dt);s.time+=dt;
 let interval=s.type===3?.25:s.type===4?.18:1,limit=s.type===3?6:s.type===4?8:5;
 while(s.count<limit&&s.time>=s.next){s.count++;s.next+=interval;let targets=enemies.filter(e=>e.hp>0&&lineClear(p,e));
  if(s.type===3)targets=targets.filter(e=>{let dx=e.x-p.x,dy=e.y-p.y,along=dx*Math.cos(s.angle)+dy*Math.sin(s.angle),side=-dx*Math.sin(s.angle)+dy*Math.cos(s.angle);return along>=0&&along<=650&&Math.abs(side)<=45});
  if(s.type===4)targets=targets.filter(e=>dist(p,e)<=300).sort((a,b)=>dist(p,a)-dist(p,b)).slice(0,1);
  if(s.type===5){targets=targets.filter(e=>dist(p,e)<=200);p.hp=Math.min(maxhp(),p.hp+maxhp()*.05);}
  let previous=classHitKind;classHitKind='ultimate';try{for(let e of targets){hit(e,s.power*(s.type===3?1.8:s.type===4?1.5:1.1));if(s.type===4)burst(e.x,e.y,45,PROFESSIONS[s.type].color);}}finally{classHitKind=previous}
  burst(p.x,p.y,s.type===5?200:55,PROFESSIONS[s.type].color);playSound(s.type===3?'arrow':s.type===4?'slash':'frost',p.x,p.y);
 }
 if(s.time>=(s.type===5?5:s.type===3?1.7:1.65))ultimateState=null;
};
const jobGroundBase=drawGroundEffects;drawGroundEffects=()=>{jobGroundBase();let s=ultimateState;if(!s||s.type<3)return;let col=PROFESSIONS[s.type].color;if(s.type===3){let end={x:p.x+Math.cos(s.angle)*650,y:p.y+Math.sin(s.angle)*650};paintLinkLine(p,end,col,4);for(let d=90;d<=630;d+=90)groundRing(p.x+Math.cos(s.angle)*d,p.y+Math.sin(s.angle)*d,25,col,2);}else groundRing(p.x,p.y,s.type===4?300:200,col,3);};
function changeJob(id){
 if(!Number.isInteger(id)||id<0||id>=16||!villageOpen||dead||!started||campaign().rank<(id>=8?8:5)||currentJob()===id)return false;
 let changed=worldTransaction(()=>{p.job=id;p.ultimate=0;p.sp=Math.min(p.sp,maxsp());});if(!changed)return false;
 resetClassTransient();signatureSpells=[];playerAction=null;attackTarget=null;moveGoal=null;showJobHall(id);return true;
}
function jobEmblem(id){return typeof generatedJobEmblem==='function'?generatedJobEmblem(id):'';}
function showJobHall(selected=currentJob()){
 if(!Number.isInteger(selected)||selected<0||selected>=16)selected=currentJob();
 let rank=campaign().rank;worldMenu('転職所','<p>転職：ランク5 · 上位職：ランク8。育成・装備は引き継ぎ、必殺ゲージは0になります。</p><div class="job-hall-layout"><div class="job-hall" aria-label="職業一覧">'+Array.from({length:16},(_,id)=>{let base=PROFESSIONS[id%8],name=id>=8?ADVANCED_JOBS[id%8][0]:base.name;return '<button onclick="showJobHall('+id+')" '+(id===selected?'aria-pressed="true"':'')+'>'+jobEmblem(id)+'<span>'+name+(currentJob()===id?' · 現在':'')+(rank<(id>=8?8:5)?' 🔒':'')+'</span></button>'}).join('')+'</div><section class="job-detail"><h3>'+jobEmblem(selected)+(selected>=8?ADVANCED_JOBS[selected%8][0]:PROFESSIONS[selected].name)+'</h3><p>'+PROFESSIONS[selected%8].trait+'</p>'+(selected>=8?'<details><summary>上位職の特性</summary><p>'+ADVANCED_JOBS[selected%8][1]+'</p></details>':'')+'<h4>専用操作 · '+(selected===15?'竜騎乗':JOB_ACTIONS[selected%8][0])+'</h4><p>'+(selected===15?DRAGON_RIDE_DESC:JOB_ACTIONS[selected%8][1])+'</p><h4>'+PROFESSIONS[selected%8].ultimate+'</h4><p>'+PROFESSIONS[selected%8].desc+(selected>=8?' 必殺技の威力20%増。':'')+'</p><button onclick="changeJob('+selected+')" '+(!villageOpen||rank<(selected>=8?8:5)||currentJob()===selected?'disabled':'')+'>この職業に転職</button></section></div><div class="job-hall-footer"><button onclick="showSummonRoster()">召喚編成</button><button onclick="showDragonBonds()">竜との契約</button><button onclick="showVillage()">ギルドへ戻る</button></div>','jobs');menuFocusElement($('card').querySelector('.job-hall button[aria-pressed]'));
}
const jobGuideBase=professionGuideHtml;professionGuideHtml=compare=>compare?'<div class="character-effect-list">'+PROFESSIONS.map((j,i)=>'<section><h3>'+j.name+' → '+ADVANCED_JOBS[i][0]+'</h3><p>'+j.trait+'</p><p>上位職：'+ADVANCED_JOBS[i][1]+' 必殺威力20%増。</p><h4>'+j.ultimate+'</h4><p>'+j.desc+'</p></section>').join('')+'</div><button onclick="showProfessionGuide()">自分の職業へ戻る</button>':jobGuideBase(false);
const jobCloseBase=closePanel;closePanel=(...args)=>{if(menuSurface==='jobs'){showVillage();return;}return jobCloseBase(...args)};
