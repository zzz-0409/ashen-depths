const TWIN_BEAT_SIGNATURE=['双敵の拍子',28,8,'照準付近の敵と、その220以内の別の敵を8秒結ぶ。光る敵へ通常攻撃を直接当てると（召喚士・滅竜師系は、その敵への集中攻撃指示が成功すると）、もう片方へ100%の追撃を与え、次に狙う敵が入れ替わる（最大4回・発動間隔0.3秒）。最初は照準側。同じ敵への連打・スキル・仲間の自動攻撃・継続ダメージ・訓練標的では進まない。直撃で敵が倒れた場合も追撃しない。どちらかの死亡・自分から500超・敵同士350以上・壁・地域移動で解除。再発動で置き換える。範囲補正で接続距離は変わらない。','M8 14L18 5L28 14L18 23ZM25 37L35 28L45 37L35 46ZM18 23V37H25M35 28V14H28'];
SIGNATURE_SKILLS.push(TWIN_BEAT_SIGNATURE);Object.assign(GEM.crafted_11_6,{name:TWIN_BEAT_SIGNATURE[0],cost:28,cool:8,desc:TWIN_BEAT_SIGNATURE[3],ability:null,signature:126,tags:['spell']});
SIGNATURE_AUDIO.push(['twinbeat',410,.25]);SKILL_AUDIO_FAMILIES.metal.add('twinbeat');
function twinBeatValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&s.time<8&&s.pair?.length===2&&s.pair.every(e=>e.hp>0&&!e.dummy&&enemies.includes(e)&&dist(p,e)<=500&&lineClear(p,e))&&dist(...s.pair)<350&&lineClear(...s.pair);}
const twinBeatCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{const result=twinBeatCastBase(build,...args);if(GEM[build.type]?.signature!==126)return result;const s=signatureSpells.at(-1);if(s?.mode!==126)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==126||v===s);const a=s.target,b=a&&enemies.filter(e=>e!==a&&e.hp>0&&!e.dummy&&dist(a,e)<=220&&dist(p,e)<=500&&lineClear(p,e)&&lineClear(a,e)).sort((x,y)=>dist(a,x)-dist(a,y))[0];Object.assign(s,{owner:p,world:dungeon,finished:false,pair:b?[a,b]:[],turn:0,count:0,nextAt:0,pulse:0});if(!twinBeatValid(s)){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('近くの敵2体を結べません');}return result;};
let twinBeatResolving=false;
function resolveTwinBeat(s){const target=s.pair[1-s.turn];s.turn=1-s.turn;s.count++;s.nextAt=s.time+.3;s.pulse=.25;if(s.count>=4)s.finished=true;twinBeatResolving=true;try{spellHit(target,s.damage,s.build);playSignatureAudio(126,true,target.x,target.y);}finally{twinBeatResolving=false;}}
const twinBeatCommandBase=performAction;performAction=action=>{
 const job=combatProfessionType(),owner=p,world=dungeon,command=action.n===0&&job>=6&&started&&!paused&&!dead&&p?.hp>0;
 const watches=command?signatureSpells.filter(s=>s.mode===126&&twinBeatValid(s)&&s.time+1e-8>=s.nextAt):[];
 const result=twinBeatCommandBase(action);
 const ally=command&&(job===7?!!p?.activeDragon&&companions.some(c=>c.dragon&&c.dragonId===p.activeDragon&&c.life>0):companions.some(c=>!c.dragon&&c.life>0));
 if(command&&p===owner&&dungeon===world&&ally&&!companionRecall)for(const s of watches)if(signatureSpells.includes(s)&&twinBeatValid(s)&&s.pair[s.turn]===companionFocus)resolveTwinBeat(s);
 return result;
};
const twinBeatHitBase=hit;hit=(e,d)=>{
 const normal=started&&!paused&&!dead&&p?.hp>0&&cadenceNormalAction&&classHitKind==='normal'&&!e?.dotTick&&!e?.dummy&&!treeExplosion&&!twinBeatResolving,before=e?.hp;
 const watches=normal?signatureSpells.filter(s=>s.mode===126&&twinBeatValid(s)&&s.pair[s.turn]===e&&s.time+1e-8>=s.nextAt):[];const result=twinBeatHitBase(e,d);
 if(e?.hp<before)for(const s of watches){if(!signatureSpells.includes(s)||!twinBeatValid(s))continue;resolveTwinBeat(s); }
 return result;
};
const twinBeatStepBase=stepSignature;stepSignature=(s,dt)=>{if(s.mode!==126)return twinBeatStepBase(s,dt);if(!twinBeatValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;s.time+=dt;s.pulse=Math.max(0,s.pulse-dt);if(s.time+1e-8>=8){s.finished=true;return false;}return true;};
const twinBeatPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{twinBeatPaintBase();for(const s of signatureRenderList(126)){if(!twinBeatValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color;paintLinkLine(...s.pair,color,s.pulse>0?4:1);for(let i=0;i<2;i++){const e=s.pair[i];if(!visibleAt(e.x,e.y))continue;groundRing(e.x,e.y,i===s.turn?35:24,i===s.turn?'#fff0ad':color,i===s.turn?3:1);if(i===s.turn){const q=project(e.x,e.y);ctx.save();ctx.fillStyle='#fff0ad';ctx.beginPath();ctx.moveTo(q.x,q.y-82);ctx.lineTo(q.x-7,q.y-94);ctx.lineTo(q.x+7,q.y-94);ctx.closePath();ctx.fill();ctx.restore();}}}};
const twinBeatStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===126?{label:(combatProfessionType()>=6?'交互に集中指示 ':'交互に通常攻撃 ')+s.count+'/4 · '+Math.max(0,8-s.time).toFixed(1)+'秒',value:s.count/4,waiting:s.time<s.nextAt}:twinBeatStatusBase(s);
