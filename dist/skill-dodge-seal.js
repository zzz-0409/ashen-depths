// A dodge leaves its origin behind as a delayed counterattack.
const DODGE_SEAL_SIGNATURE=['輪転の護符',26,9,'8秒間、回避の発動地点に最大3個の印を残す。印は0.8秒後、半径110へ各160%の爆発。回避しなければ攻撃しない。再発動すると前の印は消える。','M9 38L19 24L29 30L43 13M35 13H43V21M8 42A7 7 0 1 0 22 42M25 39A7 7 0 1 0 39 39'];
SIGNATURE_SKILLS.push(DODGE_SEAL_SIGNATURE);
Object.assign(GEM.crafted_7_7,{name:DODGE_SEAL_SIGNATURE[0],cost:26,cool:9,desc:DODGE_SEAL_SIGNATURE[3]+' 属性抽選で回避への連動は変わらない。',ability:null,signature:71,tags:['spell','area']});
SIGNATURE_AUDIO.push(['dodgeseal',570,.39]);SKILL_AUDIO_FAMILIES.electric.add('dodgeseal');
const dodgeSealCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=dodgeSealCastBase(build,...args);if(GEM[build.type]?.signature!==71)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==71)return result;
 signatureSpells=signatureSpells.filter(other=>other.mode!==71||other===s);s.seals=[];s.charges=3;s.target=null;return result;
};
const dodgeSealActionBase=cast;cast=n=>{
 let states=n===3?signatureSpells.filter(s=>s.mode===71&&s.time<8&&s.charges>0):[],origin={x:p.x,y:p.y},before=cd[3],result=dodgeSealActionBase(n);
 if(n===3&&cd[3]>before)for(let s of states){s.charges--;s.seals.push({...origin,at:s.time+.8});}
 return result;
};
const dodgeSealStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==71)return dodgeSealStepBase(s,dt);if(dead||p.hp<=0)return false;
 s.time=Math.round((s.time+dt)*1000000)/1000000;
 let ready=s.seals.filter(mark=>s.time+1e-9>=mark.at);s.seals=s.seals.filter(mark=>s.time+1e-9<mark.at);
 for(let mark of ready)signatureArea(s,mark,110,1.6);
 return s.seals.length>0||(s.time<8&&s.charges>0);
};
const dodgeSealPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 dodgeSealPaintBase();ctx.save();ctx.globalCompositeOperation='lighter';
 for(let s of signatureSpells){if(s.mode!==71)continue;let color=ELEMENTS[s.build.elements[0]].color;
 if(s.time<8&&s.charges>0){let q=project(p.x,p.y);for(let i=0;i<s.charges;i++)circle(q.x+(i-(s.charges-1)/2)*9,q.y-60,3,color);}
 for(let mark of s.seals){let progress=clamp(1-(mark.at-s.time)/.8,0,1);groundRing(mark.x,mark.y,110*s.build.radius,color,1);groundRing(mark.x,mark.y,110*s.build.radius*(1-progress),color,3);boundarySigil(mark,22,color,progress*Math.PI,4);}
 }ctx.restore();
};
const dodgeSealStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===71?{label:s.time<8&&s.charges>0?'回避の印 '+s.charges+'回 · '+Math.max(0,8-s.time).toFixed(1)+'秒':'印の起爆待ち',value:Math.max(0,1-s.time/8),waiting:s.seals.length===0}:dodgeSealStatusBase(s);
