// Keep the saved gem/signature IDs; replace the old isolation check with an escort objective.
const ISOLATION_BELL_SIGNATURE=['掃討の鐘',24,7,'敵1体を5秒間指名し、その周囲240から近い順に最大3体の取り巻きへ印を付ける。印付きの取り巻きを討伐するたび、指名した敵へ180%の追撃（各1回・最大3回）。通常攻撃・スキル・継続ダメージ・召喚での討伐に対応。後から現れた敵や訓練標的は数えず、単なる消失では起爆しない。取り巻きがいなければ不発。対象が自分から500を超える・壁に隠れる・倒れる・自分の死亡や地域移動で解除。範囲補正で印の選定範囲は変わらない。再発動で置き換える。','M18 31V20Q18 9 28 9Q38 9 38 20V31L43 37H13ZM24 43H32M4 15L8 11L12 15L8 19ZM4 29L8 25L12 29L8 33ZM40 5L44 1L48 5L44 9Z'];
SIGNATURE_SKILLS.push(ISOLATION_BELL_SIGNATURE);
Object.assign(GEM.crafted_6_0,{name:ISOLATION_BELL_SIGNATURE[0],cost:24,cool:7,desc:ISOLATION_BELL_SIGNATURE[3],ability:null,signature:104,tags:['spell']});
SIGNATURE_AUDIO.push(['isolationbell',410,.4]);SKILL_AUDIO_FAMILIES.heavy.add('isolationbell');
function isolationBellValid(s){return s.owner===p&&s.world===dungeon&&!s.finished&&s.time<5&&!dead&&p?.hp>0&&s.target?.hp>0&&enemies.includes(s.target)&&dist(p,s.target)<=500&&lineClear(p,s.target);}
const isolationBellCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const result=isolationBellCastBase(build,...args);if(GEM[build.type]?.signature!==104)return result;
 const s=signatureSpells.at(-1);if(s?.mode!==104)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==104||v===s);
 Object.assign(s,{owner:p,world:dungeon,finished:false,escorts:[],fallen:new Set(),pending:0,strikes:0});
 if(isolationBellValid(s))s.escorts=enemies.filter(e=>e!==s.target&&e.hp>0&&!e.dummy&&Object.hasOwn(SPECIES,e.species)&&dist(s.target,e)<=240&&lineClear(s.target,e)).sort((a,b)=>dist(s.target,a)-dist(s.target,b)).slice(0,3);
 if(!s.escorts.length){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('周囲240に取り巻きがいる敵を狙ってください');}return result;
};
const isolationBellKillBase=worldKill;
worldKill=e=>{
 const eligible=started&&!paused&&e&&!e.rewarded&&Number.isFinite(e.hp)&&e.hp<=0&&!e.dummy;
 const watches=eligible?signatureSpells.filter(s=>s.mode===104&&isolationBellValid(s)&&s.escorts.includes(e)&&!s.fallen.has(e)):[];
 const result=isolationBellKillBase(e);
 if(e?.rewarded)for(const s of watches)if(signatureSpells.includes(s)&&isolationBellValid(s)&&!s.fallen.has(e)){s.fallen.add(e);s.pending++;}
 return result;
};
const isolationBellStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==104)return isolationBellStepBase(s,dt);
 if(!isolationBellValid(s)){s.finished=true;return false;}
 if(paused||!Number.isFinite(dt)||dt<=0)return true;
 // Resolve outside worldKill to avoid mutating the enemy list during reward handling.
 const pending=s.pending;s.pending=0;
 for(let i=0;i<pending&&s.strikes<3;i++){
  if(!isolationBellValid(s)){s.finished=true;return false;}
  s.strikes++;const e=s.target;spellHit(e,s.damage*1.8,s.build);burst(e.x,e.y,60,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(104,true,e.x,e.y);
 }
 s.time+=dt;
 if(s.time+1e-8>=5||s.strikes>=s.escorts.length){s.finished=true;return false;}return true;
};
const isolationBellPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{
 isolationBellPaintBase();for(const s of signatureSpells){if(s.mode!==104||!isolationBellValid(s))continue;
  const e=s.target,color=ELEMENTS[s.build.elements[0]].color;
  if(visibleAt(e.x,e.y)){groundRing(e.x,e.y,38,'#ffe4aa',3);groundRing(e.x,e.y,52*(1-s.time/5),color,2);}
  for(const escort of s.escorts)if(escort.hp>0&&enemies.includes(escort)&&visibleAt(escort.x,escort.y)){groundRing(escort.x,escort.y,22,color,2);if(lineClear(e,escort))paintLinkLine(e,escort,color,1);}
 }
};
const isolationBellStatusBase=controlSkillStatus;
controlSkillStatus=s=>s.mode===104?{label:'取り巻き '+s.fallen.size+'/'+s.escorts.length+'体 · '+Math.max(0,5-s.time).toFixed(1)+'秒',value:s.fallen.size/Math.max(1,s.escorts.length),waiting:true}:isolationBellStatusBase(s);
