// Record real incoming life loss after mitigation, never nominal damage or life costs.
const REPRISAL_SIGNATURE=['血潮の返歌',24,7,'4秒間に受けた実HPダメージを、発動時の最大HP30%まで蓄積。終了時、現在位置の周囲150へ100～300%の反撃。HPが減らなければ不発。無敵・盾・マナで防いだ分や、自分で支払うHPは含まない。','M26 6Q8 26 13 36Q26 51 39 36Q44 26 26 6ZM17 29L26 36L35 29M26 36V19'];
SIGNATURE_SKILLS.push(REPRISAL_SIGNATURE);
Object.assign(GEM.crafted_1_0,{name:REPRISAL_SIGNATURE[0],cost:24,cool:7,desc:REPRISAL_SIGNATURE[3]+' 再発動は蓄積をリセット。属性抽選で蓄積条件は変わらない。',ability:null,signature:72,tags:['spell','area']});
SIGNATURE_AUDIO.push(['reprisal',125,.49]);SKILL_AUDIO_FAMILIES.dark.add('reprisal');
const reprisalCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=reprisalCastBase(build,...args);if(GEM[build.type]?.signature!==72)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==72)return result;
 signatureSpells=signatureSpells.filter(other=>other.mode!==72||other===s);s.loss=0;s.capacity=Math.max(1,maxhp()*.3);s.x=p.x;s.y=p.y;s.target=null;return result;
};
const reprisalHurtBase=hurt;hurt=amount=>{
 let before=p.hp,states=signatureSpells.filter(s=>s.mode===72&&s.time<4),result=reprisalHurtBase(amount),loss=Math.max(0,before-p.hp);
 if(loss>0)for(let s of states)s.loss=Math.min(s.capacity,s.loss+loss);return result;
};
const reprisalStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==72)return reprisalStepBase(s,dt);if(dead||p.hp<=0)return false;
 s.time=Math.round((s.time+dt)*1000000)/1000000;s.x=p.x;s.y=p.y;
 if(s.time>=4){if(s.loss>0)signatureArea(s,p,150,1+2*s.loss/s.capacity);return false;}return true;
};
const reprisalPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 reprisalPaintBase();const renderList=signatureRenderList(72,72);if(!renderList.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of renderList){if(s.mode!==72)continue;let ratio=s.loss/s.capacity,color=ELEMENTS[s.build.elements[0]].color;
 groundRing(p.x,p.y,35+ratio*30,color,1+ratio*2);boundarySigil({...s,x:p.x,y:p.y},48,color,-s.time*1.4,6);
 let q=project(p.x,p.y);for(let i=0;i<6;i++){let a=i*Math.PI/3+s.time*2;circle(q.x+Math.cos(a)*28,q.y-35+Math.sin(a)*10,1.5+ratio*3,color);}
 }ctx.restore();
};
const reprisalStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===72?{label:'反撃 '+Math.round(s.loss/s.capacity*100)+'% · '+Math.max(0,4-s.time).toFixed(1)+'秒',value:s.loss/s.capacity,waiting:s.loss===0}:reprisalStatusBase(s);
