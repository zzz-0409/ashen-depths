// Only paid normal attacks and dodges charge this skill; recovery and damage do not.
const EXERTION_SIGNATURE=['踏破の蓄勢',22,7,'5秒間、通常攻撃・回避で実際に消費したSPを40まで蓄積。40到達または時間終了で周囲180へ100%＋蓄積SP×5%の衝撃波。SP8未満なら不発。再発動は蓄積をリセット。','M9 35L18 26L12 19L24 7L32 19L27 27L43 35M8 43Q26 28 44 43M20 46H32'];
SIGNATURE_SKILLS.push(EXERTION_SIGNATURE);
Object.assign(GEM.crafted_7_6,{name:EXERTION_SIGNATURE[0],cost:22,cool:7,desc:EXERTION_SIGNATURE[3]+' 属性抽選で蓄積方法は変わらない。',ability:null,signature:70,tags:['spell','area']});
SIGNATURE_AUDIO.push(['exertion',165,.47]);SKILL_AUDIO_FAMILIES.heavy.add('exertion');
const exertionCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=exertionCastBase(build,...args);if(GEM[build.type]?.signature!==70)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==70)return result;
 signatureSpells=signatureSpells.filter(other=>other.mode!==70||other===s);
 s.x=p.x;s.y=p.y;s.target=null;s.spent=0;return result;
};
const exertionActionBase=cast;cast=n=>{
 let states=signatureSpells.filter(s=>s.mode===70),before=p.sp,result=exertionActionBase(n);
 if(n===0||n===3){let spent=Number.isFinite(before)?Math.max(0,before-p.sp):0;for(let s of states)if(s.time<5)s.spent=Math.min(40,s.spent+spent);}
 return result;
};
const exertionStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==70)return exertionStepBase(s,dt);
 if(dead||p.hp<=0)return false;
 s.time=Math.round((s.time+dt)*1000000)/1000000;s.x=p.x;s.y=p.y;
 if(s.spent>=40||s.time>=5){if(s.spent>=8)signatureArea(s,p,180,1+s.spent*.05);return false;}
 return true;
};
const exertionPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 exertionPaintBase();ctx.save();ctx.globalCompositeOperation='lighter';
 for(let s of signatureSpells){if(s.mode!==70)continue;let color=ELEMENTS[s.build.elements[0]].color,r=38+30*s.spent/40;
 groundRing(p.x,p.y,r,color,1.5);boundarySigil({...s,x:p.x,y:p.y},r,color,s.time*1.8,4);
 let q=project(p.x,p.y);for(let i=0;i<5;i++){let a=-Math.PI/2+i*Math.PI*2/5;circle(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r*.5,2+(s.spent>=(i+1)*8?3:0),color);}
 }ctx.restore();
};
const exertionStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===70?{label:'SP蓄積 '+Math.floor(s.spent)+'/40 · '+Math.max(0,5-s.time).toFixed(1)+'秒',value:s.spent/40,waiting:s.spent<8}:exertionStatusBase(s);
