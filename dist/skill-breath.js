// A deliberate recovery window: no damage, no instant refill, no action weaving.
const BREATH_SIGNATURE=['静息の構え',18,8,'発動地点から10以内で1.25秒構えるとSP35回復。移動・回避・別の行動の開始・ライフダメージで中断。SP最大値を超えて回復しない。','M9 39H43M16 34V20M26 34V11M36 34V20M8 16Q26 4 44 16M20 42H32'];
SIGNATURE_SKILLS.push(BREATH_SIGNATURE);
Object.assign(GEM.crafted_7_5,{name:BREATH_SIGNATURE[0],cost:18,cool:8,desc:BREATH_SIGNATURE[3]+' 属性抽選で構えの効果は変わらない。',ability:null,signature:69,tags:['spell']});
if(typeof SIGNATURE_AUDIO!=='undefined'){SIGNATURE_AUDIO.push(['breath',520,.65]);SKILL_AUDIO_FAMILIES.airy?.add('breath');}
const breathCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=breathCastBase(build,...args);if(GEM[build.type]?.signature!==69)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==69)return result;
 s.x=s.origin.x;s.y=s.origin.y;s.target=null;s.action=playerAction;s.cancelled=false;return result;
};
function interruptBreath(){for(let s of signatureSpells)if(s.mode===69)s.cancelled=true;}
const breathUltimateBase=activateUltimate;activateUltimate=()=>{let result=breathUltimateBase();if(result)interruptBreath();return result};
const breathActionBase=cast;cast=n=>{let previous=signatureSpells.filter(s=>s.mode===69),action=playerAction,cool=cd[n]||0,result=breathActionBase(n);if((playerAction&&playerAction!==action)||(cd[n]||0)>cool)for(let s of previous)s.cancelled=true;return result};
const breathHurtBase=hurt;hurt=amount=>{let before=p.hp;let result=breathHurtBase(amount);if(p.hp<before)interruptBreath();return result};
const breathStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==69)return breathStepBase(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;
 if(dead||p.hp<=0||s.cancelled||dist(p,s.origin)>10||(playerAction&&playerAction!==s.action))return false;
 if(s.time>=1.25){ensureClassResources();let amount=Math.min(35,maxsp()-p.sp);p.sp+=amount;burst(p.x,p.y,70,'#91deb4');texts.push({x:p.x,y:p.y-30,s:'SP +'+Math.round(amount),c:'#a9edc4',life:.9});playSound('heal',p.x,p.y);return false;}
 return true;
};
const breathPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{breathPaintBase();const renderList=signatureRenderList(69,69);if(!renderList.length)return;ctx.save();ctx.globalCompositeOperation='lighter';for(const s of renderList){if(s.mode!==69||s.cancelled)continue;let color='#91deb4',r=60*(1-Math.min(1,s.time/1.25)) + 12;groundRing(s.x,s.y,r,color,2);boundarySigil(s,28,color,-s.time*2,3);let q=project(s.x,s.y);for(let i=0;i<3;i++){let a=s.time*3+i*Math.PI*2/3;circle(q.x+Math.cos(a)*22,q.y-32+Math.sin(a)*7,2.5,color);}}ctx.restore();};
const breathStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===69?{label:'SP回復 '+Math.max(0,1.25-s.time).toFixed(1)+'秒',value:Math.min(1,s.time/1.25),waiting:true}:breathStatusBase(s);
