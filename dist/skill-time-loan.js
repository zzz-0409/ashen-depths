// Trade another equipped skill's remaining cooldown for a longer wait on this skill.
const TIME_LOAN_SIGNATURE=['時貸しの針',22,8,'装備・割当済みの別スキルのうち、残り待ち時間が最長の1種類を最大3秒短縮し、同じ秒数をこのスキルの待ち時間へ加える。同じスキルの複数枠はまとめて処理。通常攻撃・回避・必殺技は対象外。0.3秒後、照準付近の敵1体へ180%。短縮対象がなくても攻撃する。攻撃は射程500・壁で遮られる。','M10 7H38M10 45H38M14 7L34 45M34 7L14 45M6 40L46 10M38 10H46V18'];
SIGNATURE_SKILLS.push(TIME_LOAN_SIGNATURE);
Object.assign(GEM.crafted_2_7,{name:TIME_LOAN_SIGNATURE[0],cost:22,cool:8,desc:TIME_LOAN_SIGNATURE[3],ability:null,signature:87,tags:['spell']});
SIGNATURE_AUDIO.push(['timeloan',640,.35]);SKILL_AUDIO_FAMILIES.airy.add('timeloan');
function borrowSkillTime(type){
 let best=null,seen=new Set();for(let [i,other]of p.bindings.entries()){
  if(!other||other===type||seen.has(other)||!skillBuild(other))continue;seen.add(other);
  let actions=SKILL_ACTIONS.filter((action,j)=>p.bindings[j]===other),remaining=Math.max(...actions.map(action=>Number.isFinite(cd[action])?Math.max(0,cd[action]):0));
  if(remaining>0&&(!best||remaining>best.remaining))best={type:other,actions,remaining};
 }
 if(!best)return{seconds:0,type:null};let seconds=Math.min(3,best.remaining);
 for(let action of best.actions)cd[action]=best.remaining-seconds;
 for(let [i,other]of p.bindings.entries())if(other===type)cd[SKILL_ACTIONS[i]]=Math.max(0,cd[SKILL_ACTIONS[i]]||0)+seconds;
 return{seconds,type:best.type};
}
const timeLoanCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{let result=timeLoanCastBase(build,...args);if(GEM[build.type]?.signature!==87)return result;let s=signatureSpells.at(-1);if(s?.mode===87){s.owner=p;s.borrowed=borrowSkillTime(build.type);if(s.borrowed.seconds>0)burst(p.x,p.y,45,'#94f5df');}return result;};
const timeLoanStepBase=stepSignature;stepSignature=(s,dt)=>{if(s.mode!==87)return timeLoanStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p)return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;s.time=Math.round((s.time+dt)*1e6)/1e6;if(s.time<.3)return true;let e=s.target;if(e&&e.hp>0&&enemies.includes(e)&&dist(p,e)<=500&&lineClear(p,e)){spellHit(e,s.damage*1.8,s.build);burst(e.x,e.y,45,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(87,true,e.x,e.y);}return false;};
const timeLoanPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{timeLoanPaintBase();const renderList=signatureRenderList(87,87);if(!renderList.length)return;ctx.save();for(const s of renderList){if(s.mode!==87||s.owner!==p)continue;let color=ELEMENTS[s.build.elements[0]].color;groundRing(p.x,p.y,45,'#94f5df',2);if(s.target?.hp>0&&visibleAt(s.target.x,s.target.y)){groundRing(s.target.x,s.target.y,36*(1-Math.min(1,s.time/.3)),color,3);let a=project(p.x,p.y),b=project(s.target.x,s.target.y);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y-35);ctx.lineTo(a.x+(b.x-a.x)*Math.min(1,s.time/.3),a.y+(b.y-a.y)*Math.min(1,s.time/.3)-35);ctx.stroke();}}ctx.restore();};
const timeLoanStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===87?{label:s.borrowed?.seconds?'待ち時間 -'+s.borrowed.seconds.toFixed(1)+'秒':'針を放つ',value:Math.max(0,1-s.time/.3),waiting:false}:timeLoanStatusBase(s);
