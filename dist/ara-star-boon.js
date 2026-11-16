// Sacrifice three different active potion buffs only after a successful ultimate.
NAMED_STAR_BOONS.Ara=['三薬の献火','3種類以上の強化ポーション効果中に必殺技の発動に成功すると、残り時間が短い3種類の強化を終了し、必殺ゲージ40を直接回復（上限100・再準備20秒）。HP・MP・SPの即時回復薬は数えない。薬の所持数や待ち時間は変えず、残る強化は維持する。必殺技を出せなかった時は消費しない。保存に失敗した場合は強化を維持し、ゲージ追加と再準備も発生しない。地域移動・訓練リセット・加護解除で再準備をリセット。'];
{const star=TREE_STARS.find(s=>s.code==='Ara');if(!star)throw Error('Missing Ara');namedBoonIndices.Ara=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Ara);treeOwnershipRef=null;treeOwnershipLength=-1;}
let araCooldown=0,araPulse=0,araWorld=null;
function resetAra(){araCooldown=araPulse=0;araWorld=typeof dungeon==='undefined'?null:dungeon;}
const araResetBase=resetNamedBoons;resetNamedBoons=()=>{araResetBase();resetAra();};
const araSyncBase=syncNamedBoons;syncNamedBoons=()=>{araSyncBase();if(araWorld!==dungeon||!hasStarBoon(namedBoonIndices.Ara))resetAra();};
function araOffering(){return Object.keys(POTIONS).filter(id=>POTIONS[id].kind==='buff'&&Number.isFinite(p?.potionBuffs?.[id])&&p.potionBuffs[id]>0).sort((a,b)=>p.potionBuffs[a]-p.potionBuffs[b]||a.localeCompare(b)).slice(0,3);}
const araUltimateBase=activateUltimate;
activateUltimate=(...args)=>{
 syncNamedBoons();const owner=p,world=dungeon,offering=araOffering(),eligible=started&&!paused&&!dead&&p?.hp>0&&araCooldown<=0&&hasStarBoon(namedBoonIndices.Ara)&&offering.length===3;
 const result=araUltimateBase(...args);
 if(!result||!eligible||owner!==p||world!==dungeon||dead||p.hp<=0||!offering.every(id=>p.potionBuffs[id]>0))return result;
 if(!worldTransaction(()=>{for(const id of offering)p.potionBuffs[id]=0;p.ultimate=Math.min(100,p.ultimate+40);})){if(p!==owner)namedBoonOwner=p;return result;}
 araCooldown=20;araPulse=.7;burst(p.x,p.y,85,'#f7b777');playSound('impact',p.x,p.y);say('三薬の献火 · 必殺ゲージ +40');return result;
};
function advanceAra(dt){syncNamedBoons();if(dead||!p||p.hp<=0){resetAra();return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;araCooldown=Math.max(0,araCooldown-dt);araPulse=Math.max(0,araPulse-dt);}
const araUpdateBase=update;update=dt=>{advanceAra(dt);return araUpdateBase(dt);};
const araGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 araGroundBase();if(!started||paused||dead||!p||!hasStarBoon(namedBoonIndices.Ara)||!visibleAt(p.x,p.y))return;
 const ready=araCooldown<=0&&araOffering().length===3;if(!ready&&araPulse<=0)return;
 const radius=araPulse>0?40+50*(1-araPulse/.7):38;groundRing(p.x,p.y,radius,'#f7b777',2);
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3-Math.PI/2;groundRing(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius,6,'#ffe4b3',2);}
};
