// Named constellation completions replace their shared-family boon, not the major node.
const NAMED_STAR_BOONS={
 Peg:['天馬の二段翔','回避成功から0.2～1秒以内に、回避の待ち時間を無視してもう一度回避できる。二度目も通常のSPを消費し、回避の待ち時間は通常どおり設定する。二段目の権利は一度だけ、再準備は最初の回避から8秒後。SP不足なら権利を保持。地域移動・訓練リセット・加護解除で権利と準備時間をリセット。'],
 Phe:['焔翼の再起','生命瓶が0・HPが半分以下のとき、回復操作で必殺ゲージ50を消費し最大HPの25%を回復（8秒に1回）。ゲージ不足では消費しない。瓶が残っていれば通常の瓶を使う。自動復活ではない。地域移動・訓練リセット・加護解除で待ち時間をリセット。'],
 Lep:['月兎の切り返し','回避成功後2秒以内に通常攻撃を命中させると、回避の残り待ち時間を解消しSP10回復（最大SPまで）。再発動は6秒後。回避・通常攻撃のSP消費は通常どおり。空振り・スキル・継続ダメージでは発動しない。地域移動・訓練リセット・加護解除で準備は消える。'],
 Hor:['刻を刻む腕','通常攻撃の最初の直撃でSPを追加5消費し、装備・割当済みのスキルのうち残り待ち時間が最長の1種類を最大0.4秒短縮する。同じスキルの複数枠はまとめて短縮。SP不足・待機中のスキルがないときは消費しない。通常攻撃1回につき一度。回避・通常攻撃・必殺技の待ち時間は対象外。'],
 Leo:['獅子の挑戦','6秒以内に同じ討伐敵へ通常攻撃を3回命中させると、8秒間その敵を決闘相手にする（1攻撃1段階）。決闘中、その敵への直撃威力40%増、他の敵への直撃威力30%減。時間内に直撃で倒すとSP40回復。継続ダメージ・訓練標的は対象外。途中で別の敵を通常攻撃すると準備し直し。地域移動・加護解除で解除。'],
 Mon:['三彩の聖杯','実在する討伐敵に12秒以内に異なる3種類の三属性反応を起こすと、HPポーション・小を1個補充（所持3個まで）。最初の反応から計時し、同じ組み合わせの連打では進まない。補充後15秒待機。HPポーション・小を3個以上所持・訓練標的・継続ダメージは対象外。地域移動・訓練リセット・加護解除で記録は消える。'],
 Aqr:['帰還の星泉','回避開始地点に4秒間の泉を残す（再設置8秒）。泉から90以上離れた後、28以内へ戻ると泉を消費しSP20・MP10回復。壁越しでは回復しない。両方満タンなら消費せず待機。地域移動・訓練リセット・加護解除で泉は消える。'],
 Tau:['雄牛の返し角','被弾で実際に失ったHPを痛みとして蓄積（最大HPの25%まで）。次の通常攻撃の最初の命中時、SP15と痛みを全消費し、蓄積値の2倍をその一撃の威力に加える。SP不足・空振りでは保持。防いだダメージ・HP消費では蓄積しない。地域移動・訓練リセット・加護解除で消える。'],
 UMa:['巨熊の構え','通常攻撃を3回命中させると構えが完成（1回の攻撃につき1段階）。SP20以上で次に被ダメージを受けるとSP20と構えを消費し、その攻撃の威力を半減。無敵・回避・完全吸収でHPが減らなければ消費しない。SP不足なら構えを保持。スキル・継続ダメージ・必殺技では蓄積しない。地域移動・訓練リセット・加護解除で構えは消える。'],
 Lib:['魔力と息の天秤','SPが最大値の半分以下・MP60以上のとき、通常攻撃の直撃でMP20を消費してSP30を回復する（最大SPまで）。3秒に1回。多段・範囲攻撃でも一度だけ。スキル・継続ダメージ・必殺技は対象外。地域移動・訓練リセットで待ち時間をリセット。'],
 Gem:['双星の追奏','同じ敵へ4秒以内に別種類のアクティブスキルを命中させると、その一撃の威力35%で無属性の追撃。追撃は全体で1秒に1回。同じスキルの属性違いは同種扱い。継続ダメージ・通常攻撃・必殺技は対象外。地域移動・訓練リセットで記録は消える。'],
 Crt:['空杯の星薬','HP満タン時、生命瓶1回分を消費してMP60回復（最大100）。負傷中は従来どおりHPを回復する。HP・MPとも満タンなら消費しない。'],
 Oph:['蛇毒の薬','HPが減っているとき、毒が付着した敵への通常攻撃の直撃で毒付着を1つ消費し、最大HPの3%を回復。再使用1秒。既存の継続ダメージは消さない。'],
 Crv:['烏の拾い物','地面の素材を1回拾うごとに羽根を1枚蓄積（最大3枚）。次の通常攻撃の最初の命中で全消費し、1枚につきその命中の威力を25%増す。地域移動・訓練リセットで消える。']
};
const namedBoonIndices={};for(let [code,boon]of Object.entries(NAMED_STAR_BOONS)){let star=TREE_STARS.find(s=>s.code===code);if(!star)throw Error('Missing constellation '+code);let index=STAR_BOONS.length;STAR_BOONS.push(boon);star.boonIndex=index;namedBoonIndices[code]=index;}treeOwnershipRef=null;treeOwnershipLength=-1;
let pegasusWindow=0,pegasusCooldown=0,pegasusPulse=0;
let phoenixCooldown=0,phoenixPulse=0;
let hareWindow=0,hareCooldown=0,harePulse=0;
let horClockPulse=0;
let lionChallenge=null,lionPreparation=null;
let unicornRecipes=new Set(),unicornTime=0,unicornCooldown=0,aquaSpring=null,aquaSpringCooldown=0,bullPain=0,bearGuard=0,namedBoonOwner=null,libraExchangeUntil=0,snakeRemedyUntil=0,crowFeathers=0,twinEchoUntil=0,twinEchoMarks=new WeakMap(),twinEchoEnabled=false;
function resetNamedBoons(){pegasusWindow=pegasusCooldown=pegasusPulse=0;phoenixCooldown=phoenixPulse=0;hareWindow=hareCooldown=harePulse=0;horClockPulse=0;lionChallenge=null;lionPreparation=null;unicornRecipes=new Set();unicornTime=0;unicornCooldown=0;aquaSpring=null;aquaSpringCooldown=0;bullPain=0;bearGuard=0;namedBoonOwner=p;libraExchangeUntil=0;snakeRemedyUntil=0;crowFeathers=0;twinEchoUntil=0;twinEchoMarks=new WeakMap();twinEchoEnabled=false;}
function syncNamedBoons(){if(!hasStarBoon(namedBoonIndices.Peg))pegasusWindow=pegasusCooldown=pegasusPulse=0;if(!hasStarBoon(namedBoonIndices.Phe))phoenixCooldown=phoenixPulse=0;if(!hasStarBoon(namedBoonIndices.Lep))hareWindow=hareCooldown=harePulse=0;if(!hasStarBoon(namedBoonIndices.Hor))horClockPulse=0;if(!hasStarBoon(namedBoonIndices.Leo)){lionChallenge=null;lionPreparation=null;}if(!hasStarBoon(namedBoonIndices.Mon)){unicornRecipes.clear();unicornTime=0;unicornCooldown=0;}if(!hasStarBoon(namedBoonIndices.Aqr)){aquaSpring=null;aquaSpringCooldown=0;}if(!hasStarBoon(namedBoonIndices.Tau))bullPain=0;else bullPain=Math.min(bullPain,maxhp()*.25);if(!hasStarBoon(namedBoonIndices.UMa))bearGuard=0;if(namedBoonOwner!==p)resetNamedBoons();if(!hasStarBoon(namedBoonIndices.Crv))crowFeathers=0;let twinEnabled=hasStarBoon(namedBoonIndices.Gem);if(!twinEnabled&&twinEchoEnabled){twinEchoMarks=new WeakMap();twinEchoUntil=0;}twinEchoEnabled=twinEnabled;}
const namedBoonDescriptionBase=starCompletionDescription;starCompletionDescription=index=>{let star=TREE_STARS[index],boon=NAMED_STAR_BOONS[star?.code];if(!boon)return namedBoonDescriptionBase(index);return(treeOwnership().complete.has(index)?'発動中 · ':'完成で解放 · ')+boon[0]+'：'+boon[1]+' この星座固有の完成加護。';};
const namedBoonInteractBase=interact;interact=()=>{syncNamedBoons();let owner=p,enabled=started&&!paused&&!dead,grant=enabled&&hasStarBoon(namedBoonIndices.Crv),drop=enabled?materialPickupTarget():null,had=drop&&drops.includes(drop),result=namedBoonInteractBase();if(had&&!drops.includes(drop)&&grant)crowFeathers=Math.min(3,crowFeathers+1);else if(had&&p!==owner)namedBoonOwner=p;/* Failed pickup restores the same character from its JSON snapshot. */return result;};
let namedBoonResolving=false;
const namedBoonHitBase=hit;hit=(e,d)=>{
 syncNamedBoons();let normal=started&&!paused&&!dead&&!namedBoonResolving&&cadenceNormalAction&&classHitKind==='normal'&&!treeExplosion&&!e?.dotTick&&e?.hp>0;
 let bearCharge=normal&&!classNormalHit&&hasStarBoon(namedBoonIndices.UMa);
 let exchange=normal&&hasStarBoon(namedBoonIndices.Lib)&&p.sp<=maxsp()*.5&&p.mp>=60&&clock>=libraExchangeUntil;
 let bull=normal&&hasStarBoon(namedBoonIndices.Tau)&&p.sp>=15?bullPain:0;
 let feathers=normal?crowFeathers:0,remedy=normal&&hasStarBoon(namedBoonIndices.Oph)&&p.hp<maxhp()&&clock>=snakeRemedyUntil&&Number.isFinite(e.elementMarks?.[6])&&e.elementMarks[6]>0,hp=e?.hp,training=e?.trainingHits||0;
 let previous=namedBoonResolving,result;namedBoonResolving=true;try{result=namedBoonHitBase(e,d*(1+feathers*.25)+bull*2);}finally{namedBoonResolving=previous;}if(e&&(e.hp<hp||(e.trainingHits||0)>training)&&!dead&&p.hp>0){if(bull){bullPain=0;p.sp=Math.max(0,p.sp-15);burst(e.x,e.y,45,'#e3b77d');playSound('impact',e.x,e.y);}if(bearCharge)bearGuard=Math.min(3,bearGuard+1);if(exchange&&p.mp>=60&&p.sp<=maxsp()*.5){p.mp-=20;p.sp=Math.min(maxsp(),p.sp+30);libraExchangeUntil=clock+3;playSound('heal',p.x,p.y);burst(p.x,p.y,35,'#e9cf8b');}if(feathers)crowFeathers=0;if(remedy&&e.elementMarks?.[6]>0){delete e.elementMarks[6];snakeRemedyUntil=clock+1;p.hp=Math.min(maxhp(),p.hp+maxhp()*.03);playSound('heal',p.x,p.y);burst(p.x,p.y,35,'#a8dfa4');}}
 return result;
};
const namedBoonLoadBase=loadWorld;loadWorld=(...args)=>{resetNamedBoons();return namedBoonLoadBase(...args);};
const namedBoonDummyBase=clearDummy;clearDummy=(...args)=>{resetNamedBoons();return namedBoonDummyBase(...args);};
const namedBoonGroundBase=drawGroundEffects;drawGroundEffects=()=>{namedBoonGroundBase();if(!started||!p||dead||paused||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.Crv)||!crowFeathers)return;ctx.save();ctx.strokeStyle='#dfc5f4';ctx.lineWidth=2;let q=project(p.x,p.y);for(let i=0;i<crowFeathers;i++){let x=q.x+(i-(crowFeathers-1)/2)*12,y=q.y-95;ctx.beginPath();ctx.moveTo(x-3,y+6);ctx.quadraticCurveTo(x-8,y-6,x+4,y-8);ctx.quadraticCurveTo(x+9,y+2,x-3,y+6);ctx.stroke();}ctx.restore();};
// Crater changes the flask's role only while life is full; save failure is atomic.
function cupFlaskMode(){return !!(started&&p&&p.hp>=maxhp()&&hasStarBoon(namedBoonIndices.Crt));}
const cupHealBase=heal;heal=()=>{
 if(!started||!p||paused||dead||p.hp<=0)return;
 if(!cupFlaskMode())return cupHealBase();
 if(p.flasks<=0||p.mp>=100)return;
 syncNamedBoons();let owner=p;
 if(!worldTransaction(()=>{p.flasks--;p.mp=Math.min(100,p.mp+60);})){if(p!==owner)namedBoonOwner=p;return;}
 playSound('heal',p.x,p.y);burst(p.x,p.y,65,'#79cfff');say('空杯の星薬 · 魔力を回復');
};
function updateCupFlaskHud(){let button=document.querySelector('.actions button[onclick="heal()"]');if(!button)return;let active=cupFlaskMode();button.classList.toggle('cup-flask',active);let label=button.querySelector('strong');if(label)hudText(label,active?'星薬瓶':'生命瓶');hudTitle(button,active?'コップ座の加護 · 瓶1回分でMP60回復（最大100）':'生命瓶 · HPを回復');hudAttribute(button,'aria-label',active?'星薬瓶：瓶1回分でMP60回復':'生命瓶：HPを回復');}
const cupHudBase=drawHud;drawHud=()=>{cupHudBase();updateCupFlaskHud();};

// Per-target alternation uses stable skill IDs, never forged element labels.
let twinEchoResolving=false;
const twinEchoSpellBase=spellHit;spellHit=(e,d,b)=>{
 syncNamedBoons();let enabled=started&&!paused&&!dead&&p.hp>0&&!twinEchoResolving&&!namedBoonResolving&&!treeExplosion&&!e?.dotTick&&classHitKind!=='ultimate'&&e?.hp>0&&enemies.includes(e)&&GEM[b?.type]?.kind==='active'&&Number.isFinite(d)&&d>0&&hasStarBoon(namedBoonIndices.Gem),hp=e?.hp,training=e?.trainingHits||0,previous=enabled?twinEchoMarks.get(e):null;
 let result=twinEchoSpellBase(e,d,b);
 if(enabled&&!dead&&p.hp>0&&(e.hp<hp||(e.trainingHits||0)>training)){twinEchoMarks.set(e,{type:b.type,time:clock});if(e.hp>0&&previous&&previous.type!==b.type&&clock-previous.time<=4&&clock>=previous.time&&clock>=twinEchoUntil){twinEchoUntil=clock+1;let kind=classHitKind;classHitKind='boon';twinEchoResolving=true;try{hit(e,d*.35);playSound('arc',e.x,e.y);burst(e.x,e.y,45,'#f0d3ff');}finally{classHitKind=kind;twinEchoResolving=false;}}}
 return result;
};

// Reserve protection before the incoming hit, spend only when HP was actually lost.
const bearGuardHurtBase=hurt;hurt=d=>{
 syncNamedBoons();let enabled=started&&!paused&&!dead&&p.hp>0&&p.inv<=0&&Number.isFinite(d)&&d>0&&bearGuard===3&&p.sp>=20&&hasStarBoon(namedBoonIndices.UMa),before=p.hp;
 let result=bearGuardHurtBase(enabled?d*.5:d);
 if(enabled&&p.hp<before){p.sp=Math.max(0,p.sp-20);bearGuard=0;burst(p.x,p.y,55,'#e3bc7f');playSound('impact',p.x,p.y);}
 return result;
};
const bearGuardGroundBase=drawGroundEffects;drawGroundEffects=()=>{bearGuardGroundBase();if(!started||!p||dead||paused||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.UMa)||!bearGuard)return;ctx.save();let q=project(p.x,p.y);ctx.fillStyle=bearGuard===3&&p.sp>=20?'#ffe1a2':'#a8997d';for(let i=0;i<bearGuard;i++)ctx.fillRect(q.x-12+i*9,q.y-108,6,6);ctx.restore();};

// Actual life loss only: barriers, dodge and resource sacrifices do not charge the horns.
const bullPainHurtBase=hurt;hurt=d=>{
 syncNamedBoons();let owner=p,before=p?.hp,enabled=started&&!paused&&!dead&&before>0&&Number.isFinite(d)&&d>0&&hasStarBoon(namedBoonIndices.Tau);
 let result=bullPainHurtBase(d);if(enabled&&p===owner&&!dead&&p.hp>0&&p.hp<before)bullPain=Math.min(maxhp()*.25,bullPain+before-p.hp);if(dead||p?.hp<=0)bullPain=0;return result;
};
const bullPainGroundBase=drawGroundEffects;drawGroundEffects=()=>{bullPainGroundBase();if(!started||!p||dead||paused||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.Tau)||!bullPain)return;ctx.save();let q=project(p.x,p.y);ctx.strokeStyle=p.sp>=15?'#ffce8a':'#827e78';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y-114,10,Math.PI,Math.PI+Math.PI*Math.min(1,bullPain/(maxhp()*.25)));ctx.stroke();ctx.restore();};

// A successful dodge leaves one return point; failure never places or refreshes it.
const aquaSpringCastBase=cast;cast=n=>{
 syncNamedBoons();let enabled=n===3&&started&&!paused&&!dead&&p.hp>0&&aquaSpringCooldown<=0&&hasStarBoon(namedBoonIndices.Aqr),origin=enabled?{x:p.x,y:p.y}:null,before=cd[3],result=aquaSpringCastBase(n);
 if(enabled&&cd[3]>before){aquaSpring={...origin,time:4,left:dist(p,origin)>=90};aquaSpringCooldown=8;}return result;
};
function advanceAquaSpring(dt){
 syncNamedBoons();if(dead||!p||p.hp<=0){aquaSpring=null;return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 aquaSpringCooldown=Math.max(0,aquaSpringCooldown-dt);let s=aquaSpring;if(!s)return;s.time-=dt;if(s.time<=0){aquaSpring=null;return;}let distance=dist(p,s);if(distance>=90)s.left=true;
 if(s.left&&distance<=28&&lineClear(p,s)&&(p.sp<maxsp()||p.mp<100)){p.sp=Math.min(maxsp(),p.sp+20);p.mp=Math.min(100,p.mp+10);aquaSpring=null;burst(s.x,s.y,45,'#83dbea');playSound('heal',s.x,s.y);}
}
const aquaSpringUpdateBase=update;update=dt=>{let active=started&&!paused&&!dead,result=aquaSpringUpdateBase(dt);if(active){advanceAquaSpring(dt);advanceUnicornChalice(dt);advanceLionChallenge(dt);advanceHorClock(dt);advanceHareTurn(dt);advancePhoenixRekindle(dt);advancePegasusFlight(dt);}return result;};
const aquaSpringGroundBase=drawGroundEffects;drawGroundEffects=()=>{aquaSpringGroundBase();if(!started||!p||dead||paused||namedBoonOwner!==p||!aquaSpring||!hasStarBoon(namedBoonIndices.Aqr)||!visibleAt(aquaSpring.x,aquaSpring.y))return;let s=aquaSpring;groundRing(s.x,s.y,28,s.left?'#b6f6ff':'#527e8f',3);groundRing(s.x,s.y,28*Math.max(0,s.time/4),'#83dbea',1);};

function advanceUnicornChalice(dt){
 syncNamedBoons();if(dead||!p||p.hp<=0){unicornRecipes.clear();unicornTime=0;return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;unicornCooldown=Math.max(0,unicornCooldown-dt);unicornTime=Math.max(0,unicornTime-dt);if(!unicornTime)unicornRecipes.clear();
}
// Keep old-save test/runtime compatibility while replenishing the actual consumable inventory.
function unicornPotionCount(){if(typeof ensurePotions==='function'){ensurePotions();return p.potions.hp0||0;}return p.flasks;}
function grantUnicornPotion(){if(typeof ensurePotions==='function'){ensurePotions();p.potions.hp0=Math.min(3,(p.potions.hp0||0)+1);}else p.flasks=Math.min(3,p.flasks+1);}
const unicornReactionBase=triggerReaction;triggerReaction=(origin,r,power)=>{
 syncNamedBoons();let owner=p,eligible=started&&!paused&&!dead&&p.hp>0&&unicornPotionCount()<3&&unicornCooldown<=0&&hasStarBoon(namedBoonIndices.Mon)&&origin?.hp>0&&!origin.dummy&&!origin.dotTick&&enemies.includes(origin)&&!!SPECIES[origin.species]&&Number.isFinite(power)&&power>0&&r?.elements?.length===3&&REACTIONS[r.key]===r;
 let result=unicornReactionBase(origin,r,power);if(!eligible||p!==owner||dead||p.hp<=0||unicornPotionCount()>=3)return result;
 if(!unicornRecipes.size)unicornTime=12;if(unicornRecipes.size<3)unicornRecipes.add(r.key);if(unicornRecipes.size<3)return result;
 if(!worldTransaction(grantUnicornPotion)){if(p!==owner)namedBoonOwner=p;return result;}unicornRecipes.clear();unicornTime=0;unicornCooldown=15;burst(p.x,p.y,65,'#e4bfff');playSound('heal',p.x,p.y);say('三彩の聖杯 · HPポーション・小 +1');return result;
};
const unicornGroundBase=drawGroundEffects;drawGroundEffects=()=>{unicornGroundBase();if(!started||!p||dead||paused||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.Mon)||!unicornRecipes.size)return;ctx.save();let q=project(p.x,p.y);ctx.fillStyle='#e4bfff';for(let i=0;i<unicornRecipes.size;i++){ctx.beginPath();ctx.moveTo(q.x-27,q.y-80+i*10);ctx.lineTo(q.x-23,q.y-76+i*10);ctx.lineTo(q.x-27,q.y-72+i*10);ctx.lineTo(q.x-31,q.y-76+i*10);ctx.closePath();ctx.fill();}ctx.restore();};

// Commit to a real opponent: only direct player attacks enter or resolve the duel.
function advanceLionChallenge(dt){
 syncNamedBoons();if(dead||!p||p.hp<=0){lionChallenge=null;lionPreparation=null;return;}
 if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 for(let state of [lionChallenge,lionPreparation])if(state)state.time-=dt;
 if(lionChallenge&&(lionChallenge.time<=0||lionChallenge.enemy.hp<=0||!enemies.includes(lionChallenge.enemy)))lionChallenge=null;
 if(lionPreparation&&(lionPreparation.time<=0||lionPreparation.enemy.hp<=0||!enemies.includes(lionPreparation.enemy)))lionPreparation=null;
}
const lionHitBase=hit;hit=(e,d)=>{
 syncNamedBoons();let owner=p,before=e?.hp,active=started&&!paused&&!dead&&p.hp>0&&hasStarBoon(namedBoonIndices.Leo)&&!namedBoonResolving&&!treeExplosion&&!e?.dotTick&&before>0&&!e.dummy&&enemies.includes(e)&&!!SPECIES[e.species]&&Number.isFinite(d)&&d>0;
 let direct=active&&['normal','skill','ultimate'].includes(classHitKind),normal=direct&&cadenceNormalAction&&classHitKind==='normal'&&!classNormalHit;
 let duel=lionChallenge,scale=direct&&duel?.time>0&&duel.enemy.hp>0&&enemies.includes(duel.enemy)?(duel.enemy===e?1.4:.7):1;
 let result=lionHitBase(e,d*scale);if(!active||p!==owner||dead||p.hp<=0||!(e.hp<before))return result;
 if(duel){if(direct&&duel.enemy===e&&e.hp<=0&&duel.time>0){lionChallenge=null;p.sp=Math.min(maxsp(),p.sp+40);burst(p.x,p.y,55,'#ffce76');playSound('heal',p.x,p.y);}return result;}
 if(normal&&e.hp>0){if(!lionPreparation||lionPreparation.enemy!==e||lionPreparation.time<=0)lionPreparation={enemy:e,hits:0,time:6};lionPreparation.hits++;if(lionPreparation.hits>=3){lionChallenge={enemy:e,time:8};lionPreparation=null;burst(e.x,e.y,50,'#ffce76');playSound('impact',e.x,e.y);}}
 return result;
};
const lionGroundBase=drawGroundEffects;drawGroundEffects=()=>{lionGroundBase();let state=lionChallenge||lionPreparation;if(!started||paused||dead||!p||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.Leo)||!state||state.enemy.hp<=0||!enemies.includes(state.enemy)||!visibleAt(state.enemy.x,state.enemy.y))return;let e=state.enemy;groundRing(e.x,e.y,32,lionChallenge?'#ffce76':'#ad936a',lionChallenge?3:1);groundRing(e.x,e.y,32*Math.max(0,state.time/(lionChallenge?8:6)),'#ffe9b5',1);let q=project(e.x,e.y);ctx.save();ctx.fillStyle='#ffce76';for(let i=0;i<(lionChallenge?3:state.hits);i++)ctx.fillRect(q.x-11+i*8,q.y-100,5,5);ctx.restore();};

// Spend spare stamina on one equipped skill; duplicate bindings never multiply the reduction.
function longestHorSkill(){let best=null,seen=new Set();for(let type of p.bindings||[]){if(!type||seen.has(type)||!skillBuild(type))continue;seen.add(type);let actions=SKILL_ACTIONS.filter((a,i)=>p.bindings[i]===type),remaining=Math.max(...actions.map(a=>Number.isFinite(cd[a])?Math.max(0,cd[a]):0));if(remaining>0&&(!best||remaining>best.remaining))best={type,actions,remaining};}return best;}
const horClockHitBase=hit;hit=(e,d)=>{syncNamedBoons();let owner=p,before=e?.hp,training=e?.trainingHits||0,eligible=started&&!paused&&!dead&&p.hp>0&&hasStarBoon(namedBoonIndices.Hor)&&cadenceNormalAction&&classHitKind==='normal'&&!classNormalHit&&!namedBoonResolving&&!treeExplosion&&!e?.dotTick&&before>0&&enemies.includes(e)&&Number.isFinite(d)&&d>0;let result=horClockHitBase(e,d);if(eligible&&p===owner&&!dead&&p.hp>0&&p.sp>=5&&(e.hp<before||(e.trainingHits||0)>training)){let target=longestHorSkill();if(target){let remaining=Math.max(0,target.remaining-.4);for(let a of target.actions)cd[a]=remaining;p.sp-=5;horClockPulse=.35;burst(p.x,p.y,25,'#a2dce9');}}return result;};
function advanceHorClock(dt){if(dead||!p||p.hp<=0){horClockPulse=0;return;}if(started&&!paused&&Number.isFinite(dt)&&dt>0)horClockPulse=Math.max(0,horClockPulse-dt);}
const horClockGroundBase=drawGroundEffects;drawGroundEffects=()=>{horClockGroundBase();if(!started||paused||dead||!p||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.Hor)||horClockPulse<=0||!visibleAt(p.x,p.y))return;let q=project(p.x,p.y);ctx.save();ctx.globalAlpha=Math.min(1,horClockPulse/.15);ctx.strokeStyle='#b0efff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x+23,q.y-95,9,0,Math.PI*2);ctx.moveTo(q.x+23,q.y-102);ctx.lineTo(q.x+23,q.y-95);ctx.lineTo(q.x+29,q.y-95);ctx.stroke();ctx.restore();};

// A paid dodge opens a short attack opportunity; only an actual normal hit cashes it in.
const hareTurnCastBase=cast;cast=n=>{syncNamedBoons();let owner=p,eligible=n===3&&started&&!paused&&!dead&&p.hp>0&&hareCooldown<=0&&hasStarBoon(namedBoonIndices.Lep),before=cd[3],result=hareTurnCastBase(n);if(eligible&&p===owner&&!dead&&p.hp>0&&cd[3]>before)hareWindow=2;return result;};
const hareTurnHitBase=hit;hit=(e,d)=>{syncNamedBoons();let owner=p,before=e?.hp,training=e?.trainingHits||0,eligible=started&&!paused&&!dead&&p.hp>0&&hareWindow>0&&hareCooldown<=0&&hasStarBoon(namedBoonIndices.Lep)&&cadenceNormalAction&&classHitKind==='normal'&&!classNormalHit&&!namedBoonResolving&&!treeExplosion&&!e?.dotTick&&before>0&&enemies.includes(e)&&Number.isFinite(d)&&d>0;let result=hareTurnHitBase(e,d);if(eligible&&p===owner&&!dead&&p.hp>0&&(e.hp<before||(e.trainingHits||0)>training)){hareWindow=0;hareCooldown=6;harePulse=.45;cd[3]=0;p.sp=Math.min(maxsp(),p.sp+10);burst(p.x,p.y,35,'#d7c3ff');playSound('heal',p.x,p.y);}return result;};
function advanceHareTurn(dt){if(dead||!p||p.hp<=0){hareWindow=hareCooldown=harePulse=0;return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;hareWindow=Math.max(0,hareWindow-dt);hareCooldown=Math.max(0,hareCooldown-dt);harePulse=Math.max(0,harePulse-dt);}
const hareTurnGroundBase=drawGroundEffects;drawGroundEffects=()=>{hareTurnGroundBase();if(!started||paused||dead||!p||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.Lep)||(!hareWindow&&!harePulse)||!visibleAt(p.x,p.y))return;let q=project(p.x,p.y);ctx.save();ctx.strokeStyle=harePulse?'#f5eaff':'#c3a3ef';ctx.lineWidth=2;ctx.globalAlpha=harePulse?Math.min(1,harePulse/.2):.8;for(let side of [-1,1]){ctx.beginPath();ctx.ellipse(q.x-24+side*4,q.y-94,3,9,side*.25,0,Math.PI*2);ctx.stroke();}ctx.restore();};

// Manual last-resort healing competes with the same gauge used by every job's ultimate.
function phoenixFlaskMode(){return !!(started&&p&&p.flasks===0&&hasStarBoon(namedBoonIndices.Phe));}
const phoenixHealBase=heal;heal=()=>{
 if(!started||!p||paused||dead||p.hp<=0)return;
 if(!phoenixFlaskMode())return phoenixHealBase();
 syncNamedBoons();if(p.hp>maxhp()*.5||!Number.isFinite(p.ultimate)||p.ultimate<50||phoenixCooldown>0)return;
 let owner=p;
 if(!worldTransaction(()=>{p.ultimate-=50;p.hp=Math.min(maxhp(),p.hp+maxhp()*.25);})){if(p!==owner)namedBoonOwner=p;return;}
 phoenixCooldown=8;phoenixPulse=.65;playSound('heal',p.x,p.y);burst(p.x,p.y,65,'#ffc37a');say('焔翼の再起 · 必殺50 → HP25%回復');
};
function advancePhoenixRekindle(dt){syncNamedBoons();if(dead||!p||p.hp<=0){phoenixCooldown=phoenixPulse=0;return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;phoenixCooldown=Math.max(0,phoenixCooldown-dt);phoenixPulse=Math.max(0,phoenixPulse-dt);}
function updatePhoenixFlaskHud(){let button=document.querySelector('.actions button[onclick="heal()"]');if(!button||!phoenixFlaskMode())return;let label=button.querySelector('strong');if(label)hudText(label,'焔翼の再起');let state=phoenixCooldown>0?'待機 '+phoenixCooldown.toFixed(1)+'秒':p.hp>maxhp()*.5?'HP半分以下で発動':p.ultimate<50?'必殺ゲージ不足':'回復可能';let text='焔翼の再起：'+state+' · 必殺50消費 / HP25%回復';hudTitle(button,text);hudAttribute(button,'aria-label',text);let count=$('flasks');if(count)hudText(count,phoenixCooldown>0?phoenixCooldown.toFixed(1)+' s':'必殺 '+Math.floor(p.ultimate||0)+' / 50');}
const phoenixHudBase=drawHud;drawHud=()=>{phoenixHudBase();updatePhoenixFlaskHud();};
const phoenixGroundBase=drawGroundEffects;drawGroundEffects=()=>{phoenixGroundBase();if(!started||!p||paused||dead||namedBoonOwner!==p||!phoenixPulse||!hasStarBoon(namedBoonIndices.Phe)||!visibleAt(p.x,p.y))return;ctx.save();let q=project(p.x,p.y),t=1-phoenixPulse/.65;ctx.globalAlpha=1-t;ctx.strokeStyle='#ffd39a';ctx.lineWidth=3;for(let side of [-1,1]){ctx.beginPath();ctx.moveTo(q.x,q.y-65);ctx.quadraticCurveTo(q.x+side*18,q.y-100-t*20,q.x+side*(35+t*15),q.y-95-t*30);ctx.lineTo(q.x+side*21,q.y-76);ctx.stroke();}ctx.restore();};

// Bypass only the cooldown gate. The regular dodge still owns SP, collision,
// invulnerability, action cancellation and every on-dodge skill/tag hook.
function pegasusFollowupReady(){return started&&!paused&&!dead&&p?.hp>0&&namedBoonOwner===p&&hasStarBoon(namedBoonIndices.Peg)&&pegasusWindow>0&&pegasusWindow<=.8+1e-8;}
const pegasusCastBase=cast;cast=n=>{
 syncNamedBoons();let owner=p,eligible=n===3&&started&&!paused&&!dead&&p?.hp>0&&hasStarBoon(namedBoonIndices.Peg),follow=eligible&&pegasusFollowupReady(),before=cd[3],bypass=follow&&before>0,result;
 if(bypass)cd[3]=0;
 try{result=pegasusCastBase(n);}finally{if(bypass&&cd[3]<=0)cd[3]=before;}
 if(eligible&&result===true&&p===owner&&!dead&&p.hp>0){
  if(pegasusWindow>0){pegasusWindow=0;pegasusPulse=.4;}
  else if(pegasusCooldown<=0){pegasusWindow=1;pegasusCooldown=8;pegasusPulse=.2;}
 }
 return result;
};
function advancePegasusFlight(dt){
 syncNamedBoons();if(dead||!p||p.hp<=0){pegasusWindow=pegasusCooldown=pegasusPulse=0;return;}
 if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 pegasusWindow=Math.max(0,pegasusWindow-dt);pegasusCooldown=Math.max(0,pegasusCooldown-dt);pegasusPulse=Math.max(0,pegasusPulse-dt);
}
const pegasusHudBase=drawHud;drawHud=()=>{pegasusHudBase();if(!pegasusFollowupReady())return;let label=$('cd3');if(label)hudText(label,p.sp>=staminaCost(3)?'二段回避':'SP不足');};
const pegasusGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 pegasusGroundBase();if(!started||paused||dead||!p||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.Peg)||(!pegasusWindow&&!pegasusPulse)||!visibleAt(p.x,p.y))return;
 let q=project(p.x,p.y),ready=pegasusFollowupReady()&&p.sp>=staminaCost(3),spread=pegasusPulse?1-pegasusPulse/.4:0;
 ctx.save();ctx.strokeStyle=ready?'#bfefff':'#8c9eae';ctx.lineWidth=2;ctx.globalAlpha=pegasusPulse?Math.min(1,pegasusPulse/.15):.85;
 for(let side of [-1,1]){ctx.beginPath();ctx.moveTo(q.x,q.y-88);ctx.quadraticCurveTo(q.x+side*12,q.y-105,q.x+side*(24+spread*10),q.y-105-spread*10);ctx.lineTo(q.x+side*17,q.y-87);ctx.lineTo(q.x+side*9,q.y-92);ctx.stroke();}ctx.restore();
};
