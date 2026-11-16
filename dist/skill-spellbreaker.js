// The enemy's state at impact is the timing challenge, not its state at cast.
const SPELLBREAKER_SIGNATURE=['破詠の杭',24,6,'照準付近の敵1体へ0.35秒後に160%の一撃。その瞬間に攻撃予兆中なら480%になり、通常敵の攻撃を中断して次の攻撃まで最低0.8秒空ける。ボス・訓練標的は中断しない。攻撃実行後なら通常威力。対象が自分から500を超える・壁に隠れる・倒れると解除。再発動で前の杭を置き換える。','M26 5L34 17L29 40L26 48L23 40L18 17ZM9 18L17 22M35 22L43 18M8 38L16 34M36 34L44 38M17 46L21 41M31 41L35 46'];
SIGNATURE_SKILLS.push(SPELLBREAKER_SIGNATURE);Object.assign(GEM.crafted_3_6,{name:SPELLBREAKER_SIGNATURE[0],cost:24,cool:6,desc:SPELLBREAKER_SIGNATURE[3],ability:null,signature:94,tags:['spell']});
SIGNATURE_AUDIO.push(['spellbreaker',185,.3]);SKILL_AUDIO_FAMILIES.metal.add('spellbreaker');
function spellbreakerWindup(e){if(!e||e.state!=='attack'||e.struck)return false;let windup=e.attack?.windup??e.wardenAttack?.windup??.42;return Number.isFinite(windup)&&windup>0&&Number.isFinite(e.elapsed)&&e.elapsed>=0&&e.elapsed<windup;}
const spellbreakerCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{let result=spellbreakerCastBase(build,...args);if(GEM[build.type]?.signature!==94)return result;let s=signatureSpells.at(-1);if(s?.mode!==94)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==94||v===s);s.owner=p;s.finished=false;if(!s.target){signatureSpells=signatureSpells.filter(v=>v!==s);say('照準の近くに敵がいません');}return result;};
const spellbreakerStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==94)return spellbreakerStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p||s.finished)return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;
 let e=s.target;if(!e||e.hp<=0||!enemies.includes(e)||dist(p,e)>500||!lineClear(p,e))return false;
 s.time=Math.round((s.time+dt)*1e6)/1e6;if(s.time<.35)return true;s.finished=true;let counter=spellbreakerWindup(e);
 if(counter&&!e.boss&&!e.dummy){e.path=[];e.nav=0;e.attack=null;e.aim=null;e.state='idle';e.elapsed=0;e.struck=true;e.t=Math.max(e.t||0,.8);}
 spellHit(e,s.damage*(counter?4.8:1.6),s.build);burst(e.x,e.y,counter?75:40,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(94,true,e.x,e.y);return false;
};
const spellbreakerPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 spellbreakerPaintBase();const renderList=signatureRenderList(94,94);if(!renderList.length)return;for(const s of renderList){let e=s.target;if(s.mode!==94||s.owner!==p||s.finished||!e||e.hp<=0||!visibleAt(e.x,e.y))continue;let q=project(e.x,e.y),t=clamp(s.time/.35,0,1),color=spellbreakerWindup(e)?'#ffe6a1':ELEMENTS[s.build.elements[0]].color;
 groundRing(e.x,e.y,24+20*(1-t),color,2);ctx.save();ctx.strokeStyle=color;ctx.fillStyle='#c8d5df';ctx.lineWidth=2;let y=q.y-115+70*t;ctx.beginPath();ctx.moveTo(q.x,y-22);ctx.lineTo(q.x+6,y-10);ctx.lineTo(q.x,y+12);ctx.lineTo(q.x-6,y-10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 }
};
const spellbreakerStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===94?{label:(spellbreakerWindup(s.target)?'破詠の好機 ':'杭の落下 ')+Math.max(0,.35-s.time).toFixed(1)+'秒',value:clamp(s.time/.35,0,1),waiting:true}:spellbreakerStatusBase(s);
