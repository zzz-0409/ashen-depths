const SOUL_PICKUP_SIGNATURE=['魂拾いの契約',22,8,'照準付近の敵1体に8秒の刻印。討伐するとその場所に6秒残る魂を落とす。出現0.25秒後から、自分が半径40へ近づくと一度だけ回収し、MP18・SP24を回復して周囲180へ180%の追撃。壁越しには回収できない。訓練用標的は対象外。再発動で古い刻印・魂は消える。','M26 7L37 20L26 33L15 20ZM26 33V44M10 35Q26 52 42 35M7 30L10 35L16 33M36 33L42 35L45 30'];
SIGNATURE_SKILLS.push(SOUL_PICKUP_SIGNATURE);
Object.assign(GEM.crafted_1_6,{name:SOUL_PICKUP_SIGNATURE[0],cost:22,cool:8,desc:SOUL_PICKUP_SIGNATURE[3],ability:null,signature:78,tags:['spell','area']});
SIGNATURE_AUDIO.push(['soulPickup',740,.3]);SKILL_AUDIO_FAMILIES.electric.add('soulPickup');
const soulPickupCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=soulPickupCastBase(build,...args);if(GEM[build.type]?.signature!==78)return result;let s=signatureSpells.at(-1);if(!s||s.mode!==78)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==78||v===s);s.owner=p;s.phase='mark';s.orbAge=0;s.collected=false;
 if(!s.target||s.target.dummy||!SPECIES[s.target.species]){signatureSpells=signatureSpells.filter(v=>v!==s);say('照準の近くに討伐対象がいません');}
};
const soulPickupKillBase=worldKill;worldKill=e=>{
 let rewarded=e?.rewarded,result=soulPickupKillBase(e);
 if(e?.rewarded&&!rewarded&&!e.dummy&&!dead&&p.hp>0)for(let s of signatureSpells){if(s.mode!==78||s.owner!==p||s.phase!=='mark'||s.target!==e||s.time>=8)continue;s.phase='orb';s.x=e.x;s.y=e.y;s.target=null;s.orbAge=0;playSignatureAudio(78,false,s.x,s.y);}
 return result;
};
const soulPickupStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==78)return soulPickupStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p||s.collected)return false;if(paused)return true;s.time=Math.round((s.time+dt)*1e6)/1e6;
 if(s.phase==='mark'){if(!s.target||s.target.hp<=0||!enemies.includes(s.target)||s.time>=8)return false;s.x=s.target.x;s.y=s.target.y;return true;}
 s.orbAge=Math.round((s.orbAge+dt)*1e6)/1e6;if(s.orbAge>=6)return false;
 if(s.orbAge>=.25&&dist(p,s)<=40&&lineClear(p,s)){s.collected=true;p.mp=Math.min(100,p.mp+18);ensureClassResources();p.sp=Math.min(maxsp(),p.sp+24);playSignatureAudio(78,true,s.x,s.y);signatureArea(s,s,180,1.8);return false;}return true;
};
const soulPickupPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{soulPickupPaintBase();const renderList=signatureRenderList(78,78);if(!renderList.length)return;ctx.save();for(const s of renderList){if(s.mode!==78||s.owner!==p||s.collected||!visibleAt(s.x,s.y))continue;let color=ELEMENTS[s.build.elements[0]].color,q=project(s.x,s.y);ctx.strokeStyle=color;ctx.lineWidth=s.phase==='orb'?3:2;let y=q.y-(s.phase==='orb'?30:100),r=s.phase==='orb'?12:8;ctx.beginPath();ctx.moveTo(q.x,y-r);ctx.lineTo(q.x+r,y);ctx.lineTo(q.x,y+r);ctx.lineTo(q.x-r,y);ctx.closePath();ctx.stroke();if(s.phase==='orb'){groundRing(s.x,s.y,40,color,1);groundRing(s.x,s.y,16+8*Math.sin(s.orbAge*3),color,2);ctx.beginPath();ctx.moveTo(q.x,y+r+3);ctx.lineTo(q.x,q.y-5);ctx.stroke();}}ctx.restore();};
const soulPickupStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===78?{label:s.phase==='orb'?'魂を回収 '+Math.max(0,Math.ceil(6-s.orbAge))+'秒':'刻印した敵を討伐',value:s.phase==='orb'?1-s.orbAge/6:1-s.time/8,waiting:true}:soulPickupStatusBase(s);
