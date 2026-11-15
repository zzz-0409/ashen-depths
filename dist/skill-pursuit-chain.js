// A tracking mark punishes enemy movement rather than player movement.
const PURSUIT_CHAIN_SIGNATURE=['逃走封じの鎖',22,4,'照準付近の敵1体に2秒の鎖。対象の移動距離を最大300まで蓄積し、2秒後に100%＋距離1ごとに1%（最大400%）の一撃。移動は妨げない。瞬間移動や壁越しの移動は蓄積しない。対象が自分から500を超えるか壁に遮られると消滅。','M9 15L19 7L29 17L19 27ZM27 29L37 19L47 29L37 39ZM19 19L37 31'];
SIGNATURE_SKILLS.push(PURSUIT_CHAIN_SIGNATURE);
Object.assign(GEM.crafted_2_3,{name:PURSUIT_CHAIN_SIGNATURE[0],cost:22,cool:4,desc:PURSUIT_CHAIN_SIGNATURE[3],ability:null,signature:83,tags:['spell']});
SIGNATURE_AUDIO.push(['pursuitchain',520,.3]);SKILL_AUDIO_FAMILIES.metal.add('pursuitchain');
const pursuitChainCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{let result=pursuitChainCastBase(build,...args);if(GEM[build.type]?.signature!==83)return result;let s=signatureSpells.at(-1);if(s?.mode!==83)return result;if(!s.target){signatureSpells=signatureSpells.filter(v=>v!==s);say('照準の近くに敵がいません');return result;}s.owner=p;s.travel=0;s.lastPosition={x:s.target.x,y:s.target.y};s.x=s.target.x;s.y=s.target.y;return result;};
const pursuitChainStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==83)return pursuitChainStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p)return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;
 let e=s.target;if(!e||e.hp<=0||!enemies.includes(e)||dist(p,e)>500||!lineClear(p,e))return false;
 s.x=e.x;s.y=e.y;s.time=Math.round((s.time+dt)*1e6)/1e6;
 if(s.time>=2){spellHit(e,s.damage*(1+s.travel/100),s.build);burst(s.x,s.y,65,'#ffe1a3');playSignatureAudio(83,true,s.x,s.y);return false;}return true;
};
const pursuitChainPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{pursuitChainPaintBase();ctx.save();for(let s of signatureSpells){if(s.mode!==83||s.owner!==p||!visibleAt(s.x,s.y))continue;if(typeof paintPursuitChainCharge==='function'&&paintPursuitChainCharge(s))continue;groundRing(s.x,s.y,40+s.travel/15,'#ffe1a3',2+s.travel/100);let a=project(s.x,s.y);ctx.strokeStyle='#ffe1a3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x-20,a.y-55);ctx.lineTo(a.x+20,a.y-20);ctx.moveTo(a.x+20,a.y-55);ctx.lineTo(a.x-20,a.y-20);ctx.stroke();}ctx.restore();};
const pursuitChainStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===83?{label:'鎖の威力 '+Math.round(100+s.travel)+'%',value:Math.min(1,s.time/2),waiting:true}:pursuitChainStatusBase(s);

// Sample each world update so fixed spell substeps neither reject slow frames nor miss fast reversals.
const pursuitChainAdvanceBase=advanceSignatureSpells;advanceSignatureSpells=dt=>{
 if(Number.isFinite(dt)&&dt>0&&!paused&&!dead&&p.hp>0)for(let s of signatureSpells){if(s.mode!==83||s.owner!==p)continue;let e=s.target;if(!e||e.hp<=0||!enemies.includes(e)||dist(p,e)>500||!lineClear(p,e))continue;let moved=dist(s.lastPosition,e);if(Number.isFinite(moved)&&moved<=600*dt+1&&lineClear(s.lastPosition,e))s.travel=Math.min(300,s.travel+moved);s.lastPosition={x:e.x,y:e.y};}
 return pursuitChainAdvanceBase(dt);
};
