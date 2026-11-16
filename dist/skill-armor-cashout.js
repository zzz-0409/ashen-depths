// Trade remaining vulnerability uptime for one strike, consuming it before damage.
const ARMOR_CASHOUT_SIGNATURE=['裂甲の換撃',26,6,'敵1体へ0.35秒後、付いている「被ダメージ増加」を消費して攻撃。威力は100%＋増加率の数値×残り秒数×5%（最大500%）。例：被ダメージ+20%が残り3秒なら400%。着弾時に弱体化がなければ不発。消費した弱体化はこの一撃を増幅しない。付着属性・継続ダメージ・減速・拘束は消さず、この一撃が起こす元素反応での再付与は可能。距離500超・壁・対象消失・死亡・地域移動で中断し、その場合は弱体化を消費しない。再発動で置き換える。','M12 8H40V30L26 46L12 30ZM28 9L20 23L31 27L23 42M4 28H10M42 28H48'];
SIGNATURE_SKILLS.push(ARMOR_CASHOUT_SIGNATURE);
Object.assign(GEM.crafted_6_7,{name:ARMOR_CASHOUT_SIGNATURE[0],cost:26,cool:6,desc:ARMOR_CASHOUT_SIGNATURE[3],ability:null,signature:111,tags:['spell']});
SIGNATURE_AUDIO.push(['armorcashout',260,.3]);SKILL_AUDIO_FAMILIES.heavy.add('armorcashout');
function armorCashoutValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&s.target?.hp>0&&enemies.includes(s.target)&&dist(p,s.target)<=500&&lineClear(p,s.target);}
function armorCashoutMultiplier(e){const strength=e?.reactionVuln,time=e?.reactionVulnTime;return Number.isFinite(strength)&&strength>0&&Number.isFinite(time)&&time>0?Math.min(5,1+strength*time*.05):0;}
const armorCashoutCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const result=armorCashoutCastBase(build,...args);if(GEM[build.type]?.signature!==111)return result;
 const s=signatureSpells.at(-1);if(s?.mode!==111)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==111||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false});
 if(!armorCashoutValid(s)){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('照準付近の敵を狙ってください');}return result;
};
const armorCashoutStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==111)return armorCashoutStepBase(s,dt);
 if(!armorCashoutValid(s)){s.finished=true;return false;}
 if(paused||!Number.isFinite(dt)||dt<=0)return true;
 s.time+=dt;if(s.time+1e-8<.35)return true;s.finished=true;
 const e=s.target,mult=armorCashoutMultiplier(e);if(!mult){say('消費できる被ダメージ増加がありません');return false;}
 e.reactionVuln=0;e.reactionVulnTime=0;
 spellHit(e,s.damage*mult,s.build);burst(e.x,e.y,65,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(111,true,e.x,e.y);return false;
};
const armorCashoutPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{armorCashoutPaintBase();const renderList=signatureRenderList(111,111);if(!renderList.length)return;for(const s of renderList){if(s.mode!==111||!armorCashoutValid(s)||!visibleAt(s.target.x,s.target.y))continue;const e=s.target,q=project(e.x,e.y),t=clamp(s.time/.35,0,1),ready=armorCashoutMultiplier(e)>0,color=ready?'#ffd292':'#8d939c';groundRing(e.x,e.y,45-18*t,color,2);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(q.x-18,q.y-68);ctx.lineTo(q.x+18,q.y-68);ctx.lineTo(q.x+18,q.y-44);ctx.lineTo(q.x,q.y-28);ctx.lineTo(q.x-18,q.y-44);ctx.closePath();ctx.moveTo(q.x+4,q.y-67);ctx.lineTo(q.x-5-t*8,q.y-51);ctx.lineTo(q.x+6+t*8,q.y-46);ctx.lineTo(q.x-3,q.y-30);ctx.stroke();ctx.restore();}};
const armorCashoutStatusBase=controlSkillStatus;
controlSkillStatus=s=>s.mode===111?{label:armorCashoutMultiplier(s.target)?'換撃 '+Math.round(armorCashoutMultiplier(s.target)*100)+'%':'被ダメージ増加が必要',value:clamp(s.time/.35,0,1),waiting:true}:armorCashoutStatusBase(s);
