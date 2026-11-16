NAMED_STAR_BOONS.Aur=['御者の乗り継ぎ','必殺技の発動に成功すると6秒間、SP不足の回避をMP20で代わりに使える（最大2回）。その回避ではSPを消費せず、移動・無敵・待ち時間は通常の回避と同じ。SPが足りるときは通常どおりSPで払い、権利は残る。MP不足・回避失敗では権利もMPも消費しない。再び必殺技を発動すると残り6秒・2回に更新し、加算しない。死亡・地域移動・訓練リセット・加護解除・再読み込みで権利は消える。'];
{const star=TREE_STARS.find(s=>s.code==='Aur');if(!star)throw Error('Missing Auriga');namedBoonIndices.Aur=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Aur);treeOwnershipRef=null;treeOwnershipLength=-1;}
let aurigaWindow=0,aurigaCharges=0,aurigaPulse=0,aurigaWorld=null,aurigaPayment=null;
function resetAuriga(){aurigaWindow=aurigaCharges=aurigaPulse=0;aurigaWorld=typeof dungeon==='undefined'?null:dungeon;}
const aurigaResetBase=resetNamedBoons;resetNamedBoons=()=>{aurigaResetBase();resetAuriga();};
const aurigaSyncBase=syncNamedBoons;syncNamedBoons=()=>{aurigaSyncBase();if(aurigaWorld!==dungeon||!hasStarBoon(namedBoonIndices.Aur)||dead||p?.hp<=0)resetAuriga();};
const aurigaUltimateBase=activateUltimate;activateUltimate=(...args)=>{syncNamedBoons();const owner=p,world=dungeon,result=aurigaUltimateBase(...args);if(result===true&&p===owner&&world===dungeon&&!dead&&p?.hp>0&&hasStarBoon(namedBoonIndices.Aur)){aurigaWindow=6;aurigaCharges=2;aurigaPulse=.6;}return result;};
const aurigaStaminaBase=staminaCost;staminaCost=action=>action===3&&aurigaPayment?.owner===p&&aurigaPayment.world===dungeon?0:aurigaStaminaBase(action);
const aurigaCastBase=cast;
cast=n=>{
 if(n!==3)return aurigaCastBase(n);
 syncNamedBoons();if(p)ensureClassResources();
 const eligible=started&&!paused&&!dead&&p?.hp>0&&aurigaWindow>0&&aurigaCharges>0&&hasStarBoon(namedBoonIndices.Aur)&&p.sp<aurigaStaminaBase(3)&&p.mp>=20&&!aurigaPayment;
 if(!eligible)return aurigaCastBase(n);
 const owner=p,world=dungeon,previous=aurigaPayment;let result,completed=false;p.mp-=20;aurigaPayment={owner,world};
 // Reserve MP for this synchronous attempt. Failed attempts restore it and the normal cost.
 try{result=aurigaCastBase(n);completed=result===true;}finally{aurigaPayment=previous;if(!completed&&p===owner&&world===dungeon)p.mp=Math.min(100,p.mp+20);}
 if(completed&&p===owner&&world===dungeon&&!dead&&p.hp>0){aurigaCharges=Math.max(0,aurigaCharges-1);aurigaPulse=.6;}
 return result;
};
function advanceAuriga(dt){syncNamedBoons();if(!started||paused||!Number.isFinite(dt)||dt<=0)return;aurigaWindow=Math.max(0,aurigaWindow-dt);aurigaPulse=Math.max(0,aurigaPulse-dt);if(aurigaWindow<=1e-8){aurigaWindow=0;aurigaCharges=0;}}
const aurigaUpdateBase=update;update=dt=>{advanceAuriga(dt);return aurigaUpdateBase(dt);};
const aurigaGroundBase=drawGroundEffects;drawGroundEffects=()=>{aurigaGroundBase();if(!started||paused||dead||!p||!hasStarBoon(namedBoonIndices.Aur)||aurigaWindow<=0||aurigaCharges<=0||!visibleAt(p.x,p.y))return;const q=project(p.x,p.y);ctx.save();ctx.strokeStyle='#a8d9ff';ctx.lineWidth=2;for(let i=0;i<aurigaCharges;i++){const x=q.x+(i-.5)*17,y=q.y-85;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();}ctx.restore();if(aurigaPulse>0)groundRing(p.x,p.y,30+25*(1-aurigaPulse/.6),'#a8d9ff',2);};
const aurigaHudBase=drawHud;drawHud=()=>{aurigaHudBase();if(!started||paused||dead||!p||aurigaWindow<=0||aurigaCharges<=0||!hasStarBoon(namedBoonIndices.Aur)||p.sp>=aurigaStaminaBase(3))return;const label=$('cd3');if(label&&(cd[3]<=0||pegasusFollowupReady()))hudText(label,p.mp>=20?'MP20 回避 ×'+aurigaCharges:'MP不足');};
