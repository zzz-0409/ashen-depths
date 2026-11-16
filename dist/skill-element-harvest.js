// Spend existing elemental marks, rather than duplicating a damage spell with another colour.
const ELEMENT_HARVEST_SIGNATURE=['元素の収束',26,6,'狙った地点に収束陣。0.6秒後、半径160の敵から異なる付着属性を最大3種類吸収し、その種類の付着を円内の敵から消費する。0.95秒後、半径220へ吸収1/2/3種類で100/240/450%。付着がなければ不発。攻撃属性はジェムの属性。継続ダメージや既に発生した反応は消さない。','M26 21L31 26L26 31L21 26ZM8 10L21 21M44 10L31 21M26 47V32M6 6H14V14H6ZM38 6H46V14H38ZM22 43H30V51H22Z'];
SIGNATURE_SKILLS.push(ELEMENT_HARVEST_SIGNATURE);
Object.assign(GEM.crafted_1_4,{name:ELEMENT_HARVEST_SIGNATURE[0],cost:26,cool:6,desc:ELEMENT_HARVEST_SIGNATURE[3],ability:null,signature:76,tags:['spell','area']});
SIGNATURE_AUDIO.push(['harvest',465,.35]);SKILL_AUDIO_FAMILIES.electric.add('harvest');
const harvestCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=harvestCastBase(build,...args);if(GEM[build.type]?.signature!==76)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==76)return result;s.owner=p;s.harvested=null;s.target=null;return result;
};
function harvestElementMarks(s){
 let targets=enemies.filter(e=>e.hp>0&&dist(e,s)<=160*s.build.radius&&lineClear(s,e)).sort((a,b)=>dist(a,s)-dist(b,s)),chosen=[];
 for(let e of targets)for(let [key,time]of Object.entries(e.elementMarks||{})){let id=Number(key);if(String(id)!==key||!Number.isInteger(id)||!ELEMENTS[id]||!Number.isFinite(time)||time<=0||chosen.includes(id)||chosen.length>=3)continue;chosen.push(id);}
 for(let e of targets)for(let id of chosen)if(e.elementMarks?.[id]>0)delete e.elementMarks[id];
 return chosen;
}
const harvestStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==76)return harvestStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p)return false;if(paused)return true;
 s.time=Math.round((s.time+dt)*1e6)/1e6;
 if(!lineClear(s.origin,s))return false;
 if(s.time+1e-8>=.6&&s.harvested===null){s.harvested=harvestElementMarks(s);if(!s.harvested.length)return false;playSignatureAudio(76,true,s.x,s.y);}
 if(s.time+1e-8>=.95){signatureArea(s,s,220,[0,1,2.4,4.5][s.harvested.length]);return false;}return true;
};
const harvestPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 harvestPaintBase();const renderList=signatureRenderList(76,76);if(!renderList.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of renderList){if(s.mode!==76||!visibleAt(s.x,s.y))continue;let color=ELEMENTS[s.build.elements[0]].color;
  groundRing(s.x,s.y,s.harvested?220:160,color,s.harvested?2:1);
  if(!s.harvested){for(let i=0;i<3;i++){let angle=i*Math.PI*2/3+s.time*1.8,r=160*(1-s.time/.8);groundRing(s.x+Math.cos(angle)*r,s.y+Math.sin(angle)*r,10,color,2);}}
  else{let t=Math.min(1,(s.time-.6)/.35);s.harvested.forEach((id,i)=>{let angle=i*Math.PI*2/s.harvested.length+t*2,r=100*(1-t);groundRing(s.x+Math.cos(angle)*r,s.y+Math.sin(angle)*r,12+8*t,ELEMENTS[id].color,4);});groundRing(s.x,s.y,25+60*t,'#fff0cf',2);}
 }ctx.restore();
};
const harvestStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===76?{label:s.harvested?'収束 '+s.harvested.length+'/3種類':'付着属性を吸収',value:s.harvested?s.harvested.length/3:s.time/.6,waiting:s.harvested===null}:harvestStatusBase(s);
