NAMED_STAR_BOONS.Ant=['薬液の予備槽','HPポーションで最大HPを超える回復分を予備槽へ蓄える（現在の最大HP25%まで）。負傷中に回避の発動に成功すると、不足HPの分だけ予備槽から即時回復し、残りは保持する。回避のSP消費・待ち時間は通常どおり。HP満タンでの服用、MPへの変換、薬なしの代用回復では蓄えない。回復量低下は服用時に適用。保存失敗では増えない。予備槽は一時的で、死亡・地域移動・訓練リセット・加護解除・再読み込みで空になる。'];
{const star=TREE_STARS.find(s=>s.code==='Ant');if(!star)throw Error('Missing Ant');namedBoonIndices.Ant=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Ant);treeOwnershipRef=null;treeOwnershipLength=-1;}
let antReserve=0,antWorld=null,antPulse=0;
function resetAntlia(){antReserve=antPulse=0;antWorld=typeof dungeon==='undefined'?null:dungeon;}
const antResetBase=resetNamedBoons;resetNamedBoons=()=>{antResetBase();resetAntlia();};
const antSyncBase=syncNamedBoons;syncNamedBoons=()=>{antSyncBase();if(antWorld!==dungeon||!hasStarBoon(namedBoonIndices.Ant)||dead||p?.hp<=0)resetAntlia();else antReserve=Math.min(antReserve,Math.max(0,maxhp()*.25));};
const antDrinkBase=drinkPotion;
drinkPotion=(slot=0)=>{
 syncNamedBoons();const owner=p,world=dungeon,id=p?.potionSlots?.[slot],def=POTIONS[id],maximum=p?maxhp():0;
 const eligible=started&&!paused&&!dead&&p?.hp>0&&p.hp<maximum&&hasStarBoon(namedBoonIndices.Ant)&&def?.kind==='hp'&&p.potions?.[id]>0;
 const overflow=eligible?Math.max(0,p.hp+maximum*def.value*(hasKey('ember')?.5:1)-maximum):0;
 const result=antDrinkBase(slot);
 if(!result){if(eligible&&p!==owner&&world===dungeon)namedBoonOwner=p;return result;}
 if(eligible&&p===owner&&world===dungeon&&!dead&&p.hp>0&&overflow>0){antReserve=Math.min(maxhp()*.25,antReserve+overflow);antPulse=.6;}
 return result;
};
const antCastBase=cast;
cast=n=>{
 syncNamedBoons();const owner=p,world=dungeon,eligible=n===3&&started&&!paused&&!dead&&p?.hp>0&&antReserve>0&&hasStarBoon(namedBoonIndices.Ant);
 const result=antCastBase(n);
 if(result===true&&eligible&&p===owner&&world===dungeon&&!dead&&p.hp>0){const heal=Math.min(antReserve,Math.max(0,maxhp()-p.hp));if(heal>0){p.hp+=heal;antReserve-=heal;antPulse=.6;burst(p.x,p.y,50,'#b8efdf');playSound('heal',p.x,p.y);}}
 return result;
};
function advanceAntlia(dt){syncNamedBoons();if(!started||paused||!Number.isFinite(dt)||dt<=0)return;antPulse=Math.max(0,antPulse-dt);}
const antUpdateBase=update;update=dt=>{advanceAntlia(dt);return antUpdateBase(dt);};
const antGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 antGroundBase();if(!started||paused||dead||!p||!hasStarBoon(namedBoonIndices.Ant)||antReserve<=0&&antPulse<=0||!visibleAt(p.x,p.y))return;
 const q=project(p.x,p.y),fill=clamp(antReserve/(maxhp()*.25),0,1);ctx.save();ctx.strokeStyle='#b8efdf';ctx.fillStyle='#69cdb5';ctx.lineWidth=2;ctx.strokeRect(q.x+27,q.y-82,10,25);ctx.fillRect(q.x+29,q.y-59-21*fill,6,21*fill);ctx.restore();if(antPulse>0)groundRing(p.x,p.y,35+25*(1-antPulse/.6),'#b8efdf',2);
};
