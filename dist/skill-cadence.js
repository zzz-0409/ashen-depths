// Time normal hits to three windows. Forged elements affect the finale, not timing rules.
const CADENCE_SIGNATURE=['三拍の律動',24,7,'発動後0.5～1.0秒、1.5～2.0秒、2.5～3.0秒の合図中に通常攻撃を直接命中させる（各拍1回）。3.25秒後、現在位置の半径180へ成功1/2/3拍で120/240/420%。空振り・スキル・召喚獣・継続ダメージは数えず、0拍なら不発。再発動でやり直す。','M8 35V25M20 42V12M32 38V18M44 32V25M5 46H47M5 7H47'];
SIGNATURE_SKILLS.push(CADENCE_SIGNATURE);
Object.assign(GEM.crafted_1_3,{name:CADENCE_SIGNATURE[0],cost:24,cool:7,desc:CADENCE_SIGNATURE[3],ability:null,signature:75,tags:['spell','area']});
SIGNATURE_AUDIO.push(['cadence',560,.18]);SKILL_AUDIO_FAMILIES.metal.add('cadence');
function cadenceWindow(time){for(let i=0;i<3;i++)if(time>=i+.5-1e-8&&time<i+1-1e-8)return i;return -1;}
function cadenceCount(s){return (s.beats&1)+((s.beats>>1)&1)+((s.beats>>2)&1);}
const cadenceCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=cadenceCastBase(build,...args);if(GEM[build.type]?.signature!==75)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==75)return result;signatureSpells=signatureSpells.filter(other=>other.mode!==75||other===s);
 s.owner=p;s.beats=0;s.cued=0;s.target=null;s.x=p.x;s.y=p.y;return result;
};
let cadenceNormalAction=false;
const cadencePerformBase=performAction;performAction=action=>{let previous=cadenceNormalAction;cadenceNormalAction=action.n===0;try{return cadencePerformBase(action);}finally{cadenceNormalAction=previous;}};
const cadenceHitBase=hit;hit=(e,d)=>{
 let normal=cadenceNormalAction&&classHitKind==='normal'&&!e?.dotTick&&!treeExplosion&&!paused&&!dead,hp=e?.hp,training=e?.trainingHits||0;
 let watches=normal?signatureSpells.filter(s=>s.mode===75&&s.owner===p&&cadenceWindow(s.time)>=0).map(s=>[s,cadenceWindow(s.time)]):[];
 let result=cadenceHitBase(e,d);
 if(e&&(e.hp<hp||(e.trainingHits||0)>training)&&!dead)for(let [s,beat]of watches)if(signatureSpells.includes(s)&&!(s.beats&(1<<beat))){s.beats|=1<<beat;burst(p.x,p.y,42+beat*14,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(75,true,p.x,p.y);}
 return result;
};
const cadenceStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==75)return cadenceStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p)return false;if(paused)return true;
 s.time=Math.round((s.time+dt)*1e6)/1e6;s.x=p.x;s.y=p.y;let beat=cadenceWindow(s.time);
 if(beat>=0&&!(s.cued&(1<<beat))){s.cued|=1<<beat;playSignatureAudio(75,false,p.x,p.y);}
 if(s.time+1e-8>=3.25){let count=cadenceCount(s);if(count)signatureArea(s,p,180,[0,1.2,2.4,4.2][count]);return false;}return true;
};
const cadencePaintBase=paintSignatureSpells;paintSignatureSpells=()=>{cadencePaintBase();ctx.save();ctx.globalCompositeOperation='lighter';for(let s of signatureSpells){if(s.mode!==75||s.owner!==p||!visibleAt(p.x,p.y))continue;let beat=cadenceWindow(s.time),color=ELEMENTS[s.build.elements[0]].color;groundRing(p.x,p.y,72,color,beat>=0?3:1);if(beat>=0)groundRing(p.x,p.y,90-36*(s.time-beat-.5),'#fff2cd',2);for(let i=0;i<3;i++){let a=-Math.PI/2+(i-1)*.65,at={x:p.x+Math.cos(a)*72,y:p.y+Math.sin(a)*72};groundRing(at.x,at.y,s.beats&(1<<i)?10:6,s.beats&(1<<i)?'#fff2cd':beat===i?color:'#6c7482',s.beats&(1<<i)?4:2);}}ctx.restore();};
const cadenceStatusBase=controlSkillStatus;controlSkillStatus=s=>{if(s.mode!==75)return cadenceStatusBase(s);let beat=cadenceWindow(s.time),count=cadenceCount(s),open=beat>=0&&!(s.beats&(1<<beat));return {label:count+'/3拍 · '+(open?'今：通常攻撃':s.time>=3?'終奏':'合図を待つ'),value:count/3,waiting:!open};};
