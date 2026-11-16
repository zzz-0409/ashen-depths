const FORESHADOW_SIGNATURE=['予兆の反写',24,6,'予兆中の敵1体が狙う地点を写し取る。その攻撃が実行されると0.4秒後、記録地点の半径150へ320%。敵の攻撃が中断・対象が実行前に死亡すると不発。記録は最長8秒。自分や味方には当たらない。','M8 13H21L26 7L31 13H44V39H31L26 45L21 39H8ZM16 26H36M26 16V36M11 9L5 15M45 9L51 15'];
SIGNATURE_SKILLS.push(FORESHADOW_SIGNATURE);
Object.assign(GEM.crafted_1_2,{name:FORESHADOW_SIGNATURE[0],cost:24,cool:6,desc:FORESHADOW_SIGNATURE[3]+' 敵の威力や形状はコピーしない。',ability:null,signature:74,tags:['spell','area']});
SIGNATURE_AUDIO.push(['foreshadow',710,.42]);SKILL_AUDIO_FAMILIES.metal.add('foreshadow');
const foreshadowCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=foreshadowCastBase(build,...args);if(GEM[build.type]?.signature!==74)return result;let s=signatureSpells.at(-1);if(!s||s.mode!==74)return result;
 let e=s.target,aim=e?.attack?.target||e?.aim,token=e?.attack||e?.aim;
 if(!e||e.state!=='attack'||e.struck||!aim||!Number.isFinite(aim.x)||!Number.isFinite(aim.y)||dist(s.origin,aim)>600||!lineClear(s.origin,aim)){signatureSpells.pop();say('狙う地点が見える、予兆中の敵を選んでください');return result;}
 signatureSpells=signatureSpells.filter(other=>other.mode!==74||other===s);s.x=aim.x;s.y=aim.y;s.attackToken=token;s.attackElapsed=e.elapsed||0;s.committed=false;s.releaseAt=null;return result;
};
const foreshadowStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==74)return foreshadowStepBase(s,dt);if(dead||p.hp<=0)return false;s.time=Math.round((s.time+dt)*1e6)/1e6;
 if(!s.committed){let e=s.target;if(s.time>=8||!lineClear(s.origin,s))return false;
  if(s.attackCommitted||(e?.struck&&(e.attack||e.aim)===s.attackToken)){s.committed=true;s.releaseAt=s.time+.4;s.target=null;}
  else if(!e||e.hp<=0||!enemies.includes(e)||(e.attack||e.aim)!==s.attackToken||(e.elapsed||0)<s.attackElapsed||e.state!=='attack')return false;
 }
 if(s.committed&&s.time+1e-8>=s.releaseAt){if(lineClear(s.origin,s))signatureArea(s,s,150,3.2);return false;}return true;
};
const foreshadowPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{foreshadowPaintBase();const renderList=signatureRenderList(74,74);if(!renderList.length)return;ctx.save();ctx.globalCompositeOperation='lighter';for(const s of renderList){if(s.mode!==74||!visibleAt(s.x,s.y))continue;let color=ELEMENTS[s.build.elements[0]].color;groundRing(s.x,s.y,150*s.build.radius,color,s.committed?3:1);boundarySigil(s,35,color,s.time*(s.committed?3:1),4);if(s.target?.hp>0&&lineClear(s,s.target))paintLinkLine(s,s.target,color,1);}ctx.restore();};
const foreshadowStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===74?{label:s.committed?'反写 '+Math.max(0,s.releaseAt-s.time).toFixed(1)+'秒':'敵の攻撃実行を待つ',value:s.committed?Math.max(0,1-(s.releaseAt-s.time)/.4):s.time/8,waiting:!s.committed}:foreshadowStatusBase(s);

const foreshadowEnemyBase=animateEnemy;animateEnemy=(e,dt)=>{let token=e.attack||e.aim,watch=e.hp>0&&!e.struck&&Number.isFinite(dt)&&dt>0&&!paused&&!dead,result=foreshadowEnemyBase(e,dt);if(watch&&e.struck)for(let s of signatureSpells)if(s.mode===74&&!s.committed&&s.target===e&&s.attackToken===token)s.attackCommitted=true;return result;};
