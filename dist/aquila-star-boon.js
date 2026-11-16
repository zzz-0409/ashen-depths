NAMED_STAR_BOONS.Aql=['鷲の離脱','通常攻撃1回の最初の直撃を当てた討伐敵を3秒間標的にする。次の回避に成功した際、その敵との距離が回避前より100以上広がれば必殺ゲージを基礎12獲得（獲得量補正を適用、上限100、再準備8秒）。回避に成功すると方向にかかわらず標的は消える。失敗した回避は消費しない。射程500・射線が必要。倒した敵・訓練標的・スキル・継続ダメージ・仲間・追撃は対象外。SP消費と回避の待ち時間は通常どおり。死亡・地域移動・訓練リセット・加護解除・再読み込みで記録は消える。'];
{const star=TREE_STARS.find(s=>s.code==='Aql');if(!star)throw Error('Missing Aquila');namedBoonIndices.Aql=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Aql);treeOwnershipRef=null;treeOwnershipLength=-1;}
let aquilaMark=null,aquilaCooldown=0,aquilaPulse=0,aquilaWorld=null,aquilaResolving=false;
function resetAquila(){aquilaMark=null;aquilaCooldown=aquilaPulse=0;aquilaWorld=typeof dungeon==='undefined'?null:dungeon;}
const aquilaResetBase=resetNamedBoons;resetNamedBoons=()=>{aquilaResetBase();resetAquila();};
function aquilaTargetValid(mark=aquilaMark){return !!mark?.target&&mark.time>0&&mark.target.hp>0&&!mark.target.dummy&&!!SPECIES[mark.target.species]&&enemies.includes(mark.target)&&dist(p,mark.target)<=500&&lineClear(p,mark.target);}
const aquilaSyncBase=syncNamedBoons;syncNamedBoons=()=>{aquilaSyncBase();if(aquilaWorld!==dungeon||!hasStarBoon(namedBoonIndices.Aql)||dead||p?.hp<=0)resetAquila();else if(aquilaMark&&!aquilaTargetValid())aquilaMark=null;};
const aquilaHitBase=hit;
hit=(e,d)=>{
 const normal=started&&!paused&&!dead&&p?.hp>0&&!aquilaResolving&&!namedBoonResolving&&cadenceNormalAction&&classHitKind==='normal'&&!classNormalHit&&!treeExplosion&&!e?.dotTick;
 if(!normal||!hasStarBoon(namedBoonIndices.Aql))return aquilaHitBase(e,d);
 syncNamedBoons();const owner=p,world=dungeon,before=e?.hp,eligible=aquilaCooldown<=0&&Number.isFinite(d)&&d>0&&aquilaTargetValid({target:e,time:3});
 let result;aquilaResolving=true;try{result=aquilaHitBase(e,d);}finally{aquilaResolving=false;}
 if(eligible&&p===owner&&dungeon===world&&!dead&&p.hp>0&&e.hp<before&&aquilaTargetValid({target:e,time:3}))aquilaMark={target:e,time:3};return result;
};
const aquilaCastBase=cast;
cast=n=>{
 if(n!==3)return aquilaCastBase(n);
 syncNamedBoons();const owner=p,world=dungeon,mark=aquilaMark,origin=p?{x:p.x,y:p.y}:null,target=mark?{x:mark.target.x,y:mark.target.y}:null,eligible=started&&!paused&&!dead&&p?.hp>0&&aquilaCooldown<=0&&hasStarBoon(namedBoonIndices.Aql)&&aquilaTargetValid(mark);
 const result=aquilaCastBase(n);
 if(result===true&&eligible&&p===owner&&world===dungeon&&!dead&&p.hp>0){
  aquilaMark=null;
  // Compare against the enemy's pre-dodge position; its own motion cannot earn credit.
  if(aquilaTargetValid(mark)&&dist(origin,p)<=200&&lineClear(origin,p)&&dist(p,target)-dist(origin,target)>=100-1e-8){gainUltimate(12);aquilaCooldown=8;aquilaPulse=.65;playSound('arc',p.x,p.y);}
 }return result;
};
function advanceAquila(dt){syncNamedBoons();if(!started||paused||!Number.isFinite(dt)||dt<=0)return;aquilaCooldown=Math.max(0,aquilaCooldown-dt);aquilaPulse=Math.max(0,aquilaPulse-dt);if(aquilaMark){aquilaMark.time-=dt;if(aquilaMark.time<=1e-8)aquilaMark=null;}}
const aquilaUpdateBase=update;update=dt=>{advanceAquila(dt);return aquilaUpdateBase(dt);};
const aquilaGroundBase=drawGroundEffects;drawGroundEffects=()=>{aquilaGroundBase();if(!started||paused||dead||!p||!hasStarBoon(namedBoonIndices.Aql))return;if(aquilaTargetValid()&&visibleAt(aquilaMark.target.x,aquilaMark.target.y)){const e=aquilaMark.target;groundRing(e.x,e.y,enemyHitRadius(e)+10,'#e8d89e',2);const d=dist(p,e)||1,tip={x:p.x+(p.x-e.x)/d*55,y:p.y+(p.y-e.y)/d*55};paintLinkLine(p,tip,'#e8d89e',2);}if(aquilaPulse>0&&visibleAt(p.x,p.y))groundRing(p.x,p.y,35+60*(1-aquilaPulse/.65),'#fff0b8',3);};
