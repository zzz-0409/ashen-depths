// Turn a finishing blow's excess damage into a bounded, single delayed blast.
const OVERKILL_SIGNATURE=['余命の継火',24,7,'照準付近の敵1体に5秒の刻印。通常攻撃・スキルの直撃で倒すと、0.25秒後に倒れた場所の半径180へ基礎威力100%＋余剰ダメージの爆発（合計最大500%）。余剰は敵の残りHPを超えた実ダメージ。継続ダメージ・召喚・訓練標的は対象外。自分が500を超えて離れるか壁に隠れると消滅。再発動で置き換える。','M26 5L34 19L29 28L44 23Q48 42 28 47Q8 47 9 29L19 35L26 5ZM25 34H37M31 28V40'];
SIGNATURE_SKILLS.push(OVERKILL_SIGNATURE);
Object.assign(GEM.crafted_2_6,{name:OVERKILL_SIGNATURE[0],cost:24,cool:7,desc:OVERKILL_SIGNATURE[3],ability:null,signature:86,tags:['spell','area']});
SIGNATURE_AUDIO.push(['overkill',220,.4]);SKILL_AUDIO_FAMILIES.heavy.add('overkill');
let overkillResolving=false;
const overkillCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{let result=overkillCastBase(build,...args);if(GEM[build.type]?.signature!==86)return result;let s=signatureSpells.at(-1);if(s?.mode!==86)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==86||v===s);s.owner=p;s.pending=false;s.blastAge=0;s.power=1;if(!s.target||s.target.dummy||!SPECIES[s.target.species]){signatureSpells=signatureSpells.filter(v=>v!==s);say('照準の近くに討伐対象がいません');}else{s.x=s.target.x;s.y=s.target.y;}return result;};
const overkillKillBase=worldKill;worldKill=e=>{let direct=!overkillResolving&&!treeExplosion&&!e?.dotTick&&['normal','skill'].includes(classHitKind),eligible=direct&&e&&!e.rewarded&&Number.isFinite(e.hp)&&e.hp<=0&&!paused&&!dead;
 let watches=eligible?signatureSpells.filter(s=>s.mode===86&&s.owner===p&&!s.pending&&s.time<5&&s.target===e&&dist(p,e)<=500&&lineClear(p,e)):[],excess=e?Math.max(0,-e.hp):0,result=overkillKillBase(e);
 if(e?.rewarded&&!dead&&p.hp>0)for(let s of watches){s.pending=true;s.x=e.x;s.y=e.y;s.target=null;s.blastAge=0;s.power=1+Math.min(4,excess/Math.max(1,s.damage));}return result;};
const overkillStepBase=stepSignature;stepSignature=(s,dt)=>{if(s.mode!==86)return overkillStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p)return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(!s.pending){if(!s.target||s.target.hp<=0||!enemies.includes(s.target))return false;s.x=s.target.x;s.y=s.target.y;}if(dist(p,s)>500||!lineClear(p,s))return false;
 if(s.pending){s.blastAge=Math.round((s.blastAge+dt)*1e6)/1e6;if(s.blastAge>=.25){overkillResolving=true;try{signatureArea(s,s,180,s.power);}finally{overkillResolving=false;}burst(s.x,s.y,180*s.build.radius,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(86,true,s.x,s.y);return false;}return true;}
 s.time=Math.round((s.time+dt)*1e6)/1e6;return s.time<5;};
const overkillPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{overkillPaintBase();for(let s of signatureSpells){if(s.mode!==86||s.owner!==p||!visibleAt(s.x,s.y))continue;let color=ELEMENTS[s.build.elements[0]].color;groundRing(s.x,s.y,s.pending?180*s.build.radius:32,color,s.pending?3:2);if(s.pending)groundRing(s.x,s.y,180*s.build.radius*Math.min(1,s.blastAge/.25),'#fff0bd',2);}};
const overkillStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===86?{label:s.pending?'継火 '+Math.round(s.power*100)+'%':'刻印した敵へとどめ',value:s.pending?Math.min(1,s.blastAge/.25):Math.max(0,1-s.time/5),waiting:true}:overkillStatusBase(s);
