const BLOOD_WAGER_SIGNATURE=['命賭けの契約',18,10,'敵1体へ5秒の契約。現在HPの20%を先払いし（最低1HPは残す）、時間内にその敵を討伐すると支払ったHPの2倍を回復する。HP上限を超えず、この技自体は攻撃しない。通常攻撃・スキル・継続ダメージ・召喚の討伐に対応。訓練標的・HP1以下では契約できない。対象の消失・距離500超・壁・死亡・地域移動・時間切れで先払い分を失う。再発動では前の契約を破棄し、再びHPを支払う。属性・威力・範囲補正で支払額や回復量は変わらない。','M26 5Q8 24 13 35Q26 49 39 35Q44 24 26 5ZM18 28H34M26 20V36M6 42H15M37 42H46'];
SIGNATURE_SKILLS.push(BLOOD_WAGER_SIGNATURE);Object.assign(GEM.crafted_6_3,{name:BLOOD_WAGER_SIGNATURE[0],cost:18,cool:10,desc:BLOOD_WAGER_SIGNATURE[3],ability:null,signature:107,tags:['spell']});
SIGNATURE_AUDIO.push(['bloodwager',280,.3]);SKILL_AUDIO_FAMILIES.dark.add('bloodwager');
function bloodWagerValid(s){return s.owner===p&&s.world===dungeon&&!s.finished&&s.time<5&&!dead&&p?.hp>0&&(s.claimed||s.target?.hp>0&&enemies.includes(s.target))&&dist(p,s.target)<=500&&lineClear(p,s.target);}
const bloodWagerCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const result=bloodWagerCastBase(build,...args);if(GEM[build.type]?.signature!==107)return result;
 const s=signatureSpells.at(-1);if(s?.mode!==107)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==107||v===s);
 Object.assign(s,{owner:p,world:dungeon,finished:false,claimed:false,stake:0});
 if(!bloodWagerValid(s)||s.target.dummy||!Object.hasOwn(SPECIES,s.target.species)||p.hp<=1){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('HPを残し、討伐できる敵を指名してください');return result;}
 s.stake=Math.min(p.hp-1,p.hp*.2);p.hp-=s.stake;burst(p.x,p.y,35,'#e7838b');return result;
};
const bloodWagerKillBase=worldKill;
worldKill=e=>{
 const watches=started&&!paused&&e&&!e.rewarded&&Number.isFinite(e.hp)&&e.hp<=0&&!e.dummy&&enemies.includes(e)?signatureSpells.filter(s=>s.mode===107&&!s.claimed&&s.target===e&&s.owner===p&&s.world===dungeon&&!s.finished&&s.time<5&&!dead&&p?.hp>0&&dist(p,e)<=500&&lineClear(p,e)):[];
 const result=bloodWagerKillBase(e);
 if(e?.rewarded)for(const s of watches)if(signatureSpells.includes(s)&&s.owner===p&&s.world===dungeon&&!dead&&p.hp>0)s.claimed=true;
 return result;
};
const bloodWagerStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==107)return bloodWagerStepBase(s,dt);
 if(!bloodWagerValid(s)){s.finished=true;return false;}
 if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(s.claimed){s.finished=true;p.hp=Math.min(maxhp(),p.hp+s.stake*2);burst(p.x,p.y,70,ELEMENTS[s.build.elements[0]].color);playSound('heal',p.x,p.y);return false;}
 s.time+=dt;if(s.time+1e-8>=5){s.finished=true;return false;}return true;
};
const bloodWagerPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{bloodWagerPaintBase();const renderList=signatureRenderList(107,107);if(!renderList.length)return;for(const s of renderList){if(s.mode!==107||!bloodWagerValid(s)||!visibleAt(s.target.x,s.target.y))continue;const e=s.target;groundRing(e.x,e.y,34,'#e7838b',3);groundRing(e.x,e.y,48*(1-s.time/5),ELEMENTS[s.build.elements[0]].color,2);}};
const bloodWagerStatusBase=controlSkillStatus;
controlSkillStatus=s=>s.mode===107?{label:'討伐でHP '+Math.round(s.stake*2)+'回復 · '+Math.max(0,5-s.time).toFixed(1)+'秒',value:s.time/5,waiting:true}:bloodWagerStatusBase(s);
