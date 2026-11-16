// Potion consumption, not a heal button press, detonates the placed sigil.
const POTION_SIGIL_SIGNATURE=['調薬の火印',18,8,'足元に5秒の印を置く。その間に設定中のポーションを1個消費すると、印の半径180へ360%の爆発を一度だけ起こす。3枠すべて・回復薬と強化薬に対応。飲めなかった時や、アイテムを消費しない回復では発動しない。ポーションの効果・消費数・待ち時間は通常どおり。印は動かず、自分が500を超えて離れる・壁に隠れる・死亡・地域移動で解除。再発動で置き換える。','M19 5H33V15L40 26V40Q40 46 34 46H18Q12 46 12 40V26L19 15ZM19 12H33M17 30H35M26 32L22 38H29L25 43'];
SIGNATURE_SKILLS.push(POTION_SIGIL_SIGNATURE);
Object.assign(GEM.crafted_6_2,{name:POTION_SIGIL_SIGNATURE[0],cost:18,cool:8,desc:POTION_SIGIL_SIGNATURE[3],ability:null,signature:106,tags:['spell','area']});
SIGNATURE_AUDIO.push(['potionsigil',320,.35]);SKILL_AUDIO_FAMILIES.heavy.add('potionsigil');
function potionSigilValid(s){return s.owner===p&&s.world===dungeon&&!s.finished&&s.time<5&&!dead&&p?.hp>0&&dist(p,s)<=500&&lineClear(p,s);}
const potionSigilCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const result=potionSigilCastBase(build,...args);if(GEM[build.type]?.signature!==106)return result;
 const s=signatureSpells.at(-1);if(s?.mode!==106)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==106||v===s);
 Object.assign(s,{x:p.x,y:p.y,target:null,owner:p,world:dungeon,finished:false});return result;
};
const potionSigilDrinkBase=drinkPotion;
drinkPotion=(slot=0)=>{
 const owner=p,id=p?.potionSlots?.[slot],before=p?.potions?.[id]||0;
 const watches=started&&!paused?signatureSpells.filter(s=>s.mode===106&&potionSigilValid(s)):[];
 const result=potionSigilDrinkBase(slot);
 // Saving/validation may reject a use or replace player state. Neither can detonate.
 if(result&&p===owner&&before>0&&p.potions?.[id]===before-1)for(const s of watches){
  if(!signatureSpells.includes(s)||!potionSigilValid(s))continue;
  s.finished=true;signatureArea(s,s,180,3.6);playSignatureAudio(106,true,s.x,s.y);
 }
 return result;
};
const potionSigilStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==106)return potionSigilStepBase(s,dt);
 if(!potionSigilValid(s)){s.finished=true;return false;}
 if(paused||!Number.isFinite(dt)||dt<=0)return true;
 s.time+=dt;if(s.time+1e-8>=5){s.finished=true;return false;}return true;
};
const potionSigilPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{
 potionSigilPaintBase();const renderList=signatureRenderList(106,106);if(!renderList.length)return;for(const s of renderList){if(s.mode!==106||!potionSigilValid(s)||!visibleAt(s.x,s.y))continue;
  const color=ELEMENTS[s.build.elements[0]].color;
  groundRing(s.x,s.y,180*s.build.radius,color,2);groundRing(s.x,s.y,44*(1-s.time/5),'#ffe4aa',3);
  boundarySigil(s,36,color,s.time*.5,5);
 }
};
const potionSigilStatusBase=controlSkillStatus;
controlSkillStatus=s=>s.mode===106?{label:'ポーション消費で起爆 · '+Math.max(0,5-s.time).toFixed(1)+'秒',value:s.time/5,waiting:true}:potionSigilStatusBase(s);
