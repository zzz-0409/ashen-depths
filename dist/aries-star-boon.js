NAMED_STAR_BOONS.Ari=['破陣の角','敵の攻撃予兆の最後0.2秒（選択中の敵には角の印）に通常攻撃を直接命中させると、追加SP20でその攻撃を中断（再準備12秒）。通常敵は0.8秒、ボスは0.25秒行動停止し、次の攻撃まで最低1秒。射程220・射線が必要。最初の予兆だけが対象で、既に放たれた弾や地面攻撃は消さない。SP不足・空振り・訓練標的・継続ダメージ・仲間や追撃は対象外。地域移動・死亡・訓練リセット・加護解除で再準備を解除。'];
{const star=TREE_STARS.find(s=>s.code==='Ari');if(!star)throw Error('Missing Aries');namedBoonIndices.Ari=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Ari);treeOwnershipRef=null;treeOwnershipLength=-1;}
let ariesCooldown=0,ariesPulse=0,ariesPoint=null,ariesWorld=null,ariesResolving=false;
function resetAries(){ariesCooldown=ariesPulse=0;ariesPoint=null;ariesWorld=typeof dungeon==='undefined'?null:dungeon;}
const ariesResetBase=resetNamedBoons;resetNamedBoons=()=>{ariesResetBase();resetAries();};
const ariesSyncBase=syncNamedBoons;syncNamedBoons=()=>{ariesSyncBase();if(ariesWorld!==dungeon||!hasStarBoon(namedBoonIndices.Ari)||dead||p?.hp<=0)resetAries();};
function ariesWindow(e){
 if(!e||e.hp<=0||e.dummy||!SPECIES[e.species]||e.state!=='attack'||e.struck||!enemies.includes(e))return false;
 const windup=e.attack?.windup??e.wardenAttack?.windup;
 return Number.isFinite(windup)&&windup>0&&Number.isFinite(e.elapsed)&&e.elapsed>=0&&e.elapsed<windup&&windup-e.elapsed<=.2+1e-8;
}
const ariesHitBase=hit;
hit=(e,d)=>{
 syncNamedBoons();const owner=p,world=dungeon,before=e?.hp,token=e?.attack,warden=e?.wardenAttack;
 const eligible=started&&!paused&&!dead&&p?.hp>0&&ariesCooldown<=0&&p.sp>=20&&hasStarBoon(namedBoonIndices.Ari)&&!ariesResolving&&!namedBoonResolving&&cadenceNormalAction&&classHitKind==='normal'&&!classNormalHit&&!treeExplosion&&!e?.dotTick&&Number.isFinite(d)&&d>0&&ariesWindow(e)&&dist(p,e)<=220&&lineClear(p,e);
 const previous=ariesResolving;let result;ariesResolving=true;try{result=ariesHitBase(e,d);}finally{ariesResolving=previous;}
 if(eligible&&p===owner&&dungeon===world&&!dead&&p.hp>0&&p.sp>=20&&e.hp<before&&e.hp>0&&e.attack===token&&e.wardenAttack===warden&&ariesWindow(e)){
  p.sp-=20;ariesCooldown=12;ariesPulse=.6;ariesPoint={x:e.x,y:e.y};
  e.attack=null;e.wardenAttack=null;e.aim=null;e.path=[];e.nav=0;e.state='idle';e.elapsed=0;e.struck=true;e.t=Math.max(e.t||0,1);e.reactionStun=Math.max(e.reactionStun||0,e.boss?.25:.8);
  burst(e.x,e.y,60,'#ffe0a6');playSound('impact',e.x,e.y);say('破陣の角 · 攻撃中断');
 }
 return result;
};
function advanceAries(dt){syncNamedBoons();if(!started||paused||!Number.isFinite(dt)||dt<=0)return;ariesCooldown=Math.max(0,ariesCooldown-dt);ariesPulse=Math.max(0,ariesPulse-dt);}
const ariesUpdateBase=update;update=dt=>{advanceAries(dt);return ariesUpdateBase(dt);};
const ariesGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 ariesGroundBase();if(!started||paused||dead||!p||!hasStarBoon(namedBoonIndices.Ari))return;
 const e=enemyNameFocus;if(ariesCooldown<=0&&p.sp>=20&&ariesWindow(e)&&dist(p,e)<=220&&lineClear(p,e)&&visibleAt(e.x,e.y)){
  const q=project(e.x,e.y);ctx.save();ctx.strokeStyle='#ffe0a6';ctx.lineWidth=3;ctx.beginPath();for(const side of [-1,1]){ctx.moveTo(q.x+side*7,q.y-70);ctx.quadraticCurveTo(q.x+side*25,q.y-91,q.x+side*12,q.y-101);}ctx.stroke();ctx.restore();
 }
 if(ariesPulse>0&&ariesPoint&&visibleAt(ariesPoint.x,ariesPoint.y))groundRing(ariesPoint.x,ariesPoint.y,30+50*(1-ariesPulse/.6),'#ffe0a6',3);
};
