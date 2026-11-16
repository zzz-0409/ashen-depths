const ENDURANCE_CHAIN_SIGNATURE=['持久の縛鎖',24,7,'敵1体と鎖を結び、最大4秒、毎秒SP10を消費して減速させる（攻撃は止めない）。維持中はSP自然回復を止める。4秒経過かSP切れで、消費SP1につき5%の一撃（最大200%）。開始時SP0では不発。対象が自分から300を超える・壁・死亡・対象消失・地域移動で解除し、最後の一撃は出ない。解除後の減速は最大0.2秒で消える。他の減速は解除しない。再発動は前の鎖を破棄。範囲補正で鎖の長さは変わらない。','M7 16L16 7L25 16L16 25ZM27 36L36 27L45 36L36 45ZM16 16L36 36M7 43H19M13 37V49'];
SIGNATURE_SKILLS.push(ENDURANCE_CHAIN_SIGNATURE);
Object.assign(GEM.crafted_6_6,{name:ENDURANCE_CHAIN_SIGNATURE[0],cost:24,cool:7,desc:ENDURANCE_CHAIN_SIGNATURE[3],ability:null,signature:110,tags:['spell']});
SIGNATURE_AUDIO.push(['endurancechain',390,.3]);SKILL_AUDIO_FAMILIES.metal.add('endurancechain');
function enduranceChainValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&s.target?.hp>0&&enemies.includes(s.target)&&dist(p,s.target)<=300&&lineClear(p,s.target);}
const enduranceChainRegenBase=staminaRegen;
staminaRegen=()=>signatureSpells.some(s=>s.mode===110&&enduranceChainValid(s))?0:enduranceChainRegenBase();
const enduranceChainCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const result=enduranceChainCastBase(build,...args);if(GEM[build.type]?.signature!==110)return result;
 const s=signatureSpells.at(-1);if(s?.mode!==110)return result;
 ensureClassResources();signatureSpells=signatureSpells.filter(v=>v.mode!==110||v===s);
 Object.assign(s,{owner:p,world:dungeon,finished:false,spent:0});
 if(!enduranceChainValid(s)||!Number.isFinite(p.sp)||p.sp<=0){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('SPを残し、300以内の敵を狙ってください');}return result;
};
const enduranceChainStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==110)return enduranceChainStepBase(s,dt);
 if(!enduranceChainValid(s)||!Number.isFinite(p.sp)){s.finished=true;return false;}
 if(paused||!Number.isFinite(dt)||dt<=0)return true;
 const duration=Math.min(dt,Math.max(0,4-s.time)),paid=Math.min(Math.max(0,p.sp),duration*10,Math.max(0,40-s.spent));
 p.sp=Math.max(0,p.sp-paid);s.spent=Math.min(40,s.spent+paid);s.time+=duration;
 if(paid>0){s.target.slow=Math.max(s.target.slow||0,.2);classRest=Math.max(classRest,.25);}
 if(s.time+1e-8>=4||p.sp<=1e-8){
  s.finished=true;if(s.spent>0){spellHit(s.target,s.damage*s.spent*.05,s.build);burst(s.target.x,s.target.y,55,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(110,true,s.target.x,s.target.y);}return false;
 }
 return true;
};
const enduranceChainPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{enduranceChainPaintBase();for(const s of signatureSpells){if(s.mode!==110||!enduranceChainValid(s))continue;const e=s.target,color=ELEMENTS[s.build.elements[0]].color;if(visibleAt(e.x,e.y)){groundRing(e.x,e.y,30,color,3);groundRing(e.x,e.y,10+20*s.spent/40,'#ffe1a3',2);}if(visibleAt(p.x,p.y)||visibleAt(e.x,e.y)){paintLinkLine(p,e,color,3);for(let i=1;i<=4;i++){const t=i/5;groundRing(p.x+(e.x-p.x)*t,p.y+(e.y-p.y)*t,5,'#ffe1a3',2);}}}};
const enduranceChainStatusBase=controlSkillStatus;
controlSkillStatus=s=>s.mode===110?{label:'縛鎖 · SP '+Math.ceil(p.sp)+' · 終撃 '+Math.round(s.spent*5)+'%',value:s.time/4,waiting:true}:enduranceChainStatusBase(s);
