// Normal attacks paint targets; a second paid cast chooses when to cash out.
const DETONATE_SIGNATURE=['結び火の号令',20,.8,'8秒間、通常攻撃を直接当てた敵に印を蓄える（最大5体、各3個、通常攻撃1回につき各敵1個）。同じスキルを再使用すると、450以内で射線が通る印の敵へ、1個につき80%の追撃を与えて全印を消す。再使用もMP20。時間切れでは爆発しない。スキル・継続ダメージでは印が増えない。','M8 16L16 8L24 16L16 24ZM32 16L40 8L48 16L40 24ZM16 24L28 40L40 24M21 40H35M28 34V47'];
SIGNATURE_SKILLS.push(DETONATE_SIGNATURE);
Object.assign(GEM.crafted_2_0,{name:DETONATE_SIGNATURE[0],cost:20,cool:.8,desc:DETONATE_SIGNATURE[3],ability:null,signature:80,tags:['spell','area']});
SIGNATURE_AUDIO.push(['detonate',740,.32]);SKILL_AUDIO_FAMILIES.metal.add('detonate');
function detonateValid(s){return s.owner===p&&s.time<8&&!s.finished&&!dead&&p.hp>0;}
function detonateTargets(s){return [...s.marks].filter(([e])=>e.hp>0&&enemies.includes(e));}
const detonateCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 if(GEM[build.type]?.signature!==80)return detonateCastBase(build,...args);
 if(!started||paused||dead||p.hp<=0)return;
 let existing=signatureSpells.find(s=>s.mode===80&&detonateValid(s));
 if(existing){existing.finished=true;signatureSpells=signatureSpells.filter(s=>s!==existing);for(let [e,mark]of detonateTargets(existing)){if(dist(p,e)>450||!lineClear(p,e))continue;spellHit(e,existing.damage*.8*mark.count,existing.build);burst(e.x,e.y,55+mark.count*12,ELEMENTS[existing.build.elements[0]].color);}playSignatureAudio(80,true,p.x,p.y);return;}
 let result=detonateCastBase(build,...args),s=signatureSpells.at(-1);if(s?.mode===80){signatureSpells=signatureSpells.filter(v=>v.mode!==80||v===s);s.owner=p;s.marks=new Map();s.finished=false;s.target=null;}return result;
};
const detonateHitBase=hit;hit=(e,d)=>{
 let watches=started&&p.hp>0&&!paused&&!dead&&cadenceNormalAction&&classHitKind==='normal'&&!e?.dotTick&&!treeExplosion&&e?.hp>0&&enemies.includes(e)&&lineClear(p,e)?signatureSpells.filter(s=>s.mode===80&&detonateValid(s)):[];
 let hp=e?.hp,training=e?.trainingHits||0,serial=relayActionSerial,result=detonateHitBase(e,d);
 if(e?.hp>0&&(e.hp<hp||(e.trainingHits||0)>training))for(let s of watches){if(!signatureSpells.includes(s)||!detonateValid(s))continue;for(let target of s.marks.keys())if(target.hp<=0||!enemies.includes(target))s.marks.delete(target);let mark=s.marks.get(e);if(!mark&&s.marks.size<5){mark={count:0,last:-1};s.marks.set(e,mark);}if(mark&&mark.last!==serial&&mark.count<3){mark.count++;mark.last=serial;playSignatureAudio(80,false,e.x,e.y);}}
 return result;
};
const detonateStepBase=stepSignature;stepSignature=(s,dt)=>{if(s.mode!==80)return detonateStepBase(s,dt);if(!detonateValid(s))return false;if(paused)return true;s.time=Math.round((s.time+dt)*1e6)/1e6;for(let e of s.marks.keys())if(e.hp<=0||!enemies.includes(e))s.marks.delete(e);return s.time<8;};
const detonatePaintBase=paintSignatureSpells;paintSignatureSpells=()=>{detonatePaintBase();ctx.save();for(let s of signatureSpells){if(s.mode!==80||!detonateValid(s))continue;let col=ELEMENTS[s.build.elements[0]].color;for(let [e,mark]of detonateTargets(s)){if(!visibleAt(e.x,e.y))continue;let q=project(e.x,e.y);ctx.fillStyle=col;ctx.strokeStyle='#10141d';ctx.lineWidth=2;for(let i=0;i<mark.count;i++){let x=q.x+(i-(mark.count-1)/2)*13,y=q.y-100;ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x+5,y);ctx.lineTo(x,y+6);ctx.lineTo(x-5,y);ctx.closePath();ctx.fill();ctx.stroke();}}}ctx.restore();};
const detonateStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===80?{label:detonateTargets(s).length?'再使用で起爆 '+detonateTargets(s).length+'体':'通常攻撃で印',value:Math.max(0,1-s.time/8),waiting:true}:detonateStatusBase(s);
