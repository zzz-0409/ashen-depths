// A killing blow is the gate: surviving targets cannot pass the blade onward.
const EXECUTION_RELAY_SIGNATURE=['断頭の継走',28,8,'残りHP35%以下の敵1体を狙い、0.4秒後に150%の一撃。この技の一撃で倒せた場合だけ、その地点から240以内で最も近い瀕死の敵へ継走する。0.4秒間隔で2体目300%、3体目450%（最大3体・各1回）。倒し損ねる、着弾前に対象が死ぬ・HP35%を超えると終了。訓練標的は対象外。自分から500超・壁・死亡・地域移動で解除。範囲補正で継走距離は変わらない。再発動で置き換える。','M13 7V43M39 7V43M13 10H39L13 26ZM8 46H44M19 32L26 39L33 32'];
SIGNATURE_SKILLS.push(EXECUTION_RELAY_SIGNATURE);
Object.assign(GEM.crafted_6_5,{name:EXECUTION_RELAY_SIGNATURE[0],cost:28,cool:8,desc:EXECUTION_RELAY_SIGNATURE[3],ability:null,signature:109,tags:['spell','chain']});
SIGNATURE_AUDIO.push(['executionrelay',240,.3]);SKILL_AUDIO_FAMILIES.heavy.add('executionrelay');
function executionRelayEnemy(e){return !!(e&&!e.dummy&&Number.isFinite(e.hp)&&Number.isFinite(e.max)&&e.max>0&&e.hp>0&&e.hp/e.max<=.35&&enemies.includes(e)&&dist(p,e)<=500&&lineClear(p,e));}
function executionRelayValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&executionRelayEnemy(s.target)&&(!s.anchor||dist(s.anchor,s.target)<=240&&lineClear(s.anchor,s.target));}
const executionRelayCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const result=executionRelayCastBase(build,...args);if(GEM[build.type]?.signature!==109)return result;
 const s=signatureSpells.at(-1);if(s?.mode!==109)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==109||v===s);
 Object.assign(s,{owner:p,world:dungeon,finished:false,next:.4,strikes:0,anchor:null});
 if(!executionRelayValid(s)){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('残りHP35%以下の敵を狙ってください');}return result;
};
const executionRelayStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==109)return executionRelayStepBase(s,dt);
 if(!executionRelayValid(s)){s.finished=true;return false;}
 if(paused||!Number.isFinite(dt)||dt<=0)return true;
 s.time+=dt;
 while(s.time+1e-8>=s.next){
  if(!executionRelayValid(s)){s.finished=true;return false;}
  const e=s.target,impact={x:e.x,y:e.y};s.seen.add(e);s.strikes++;
  spellHit(e,s.damage*1.5*s.strikes,s.build);burst(impact.x,impact.y,45,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(109,true,impact.x,impact.y);
  if(e.hp>0||s.strikes>=3||s.owner!==p||s.world!==dungeon||dead||p.hp<=0){s.finished=true;return false;}
  s.anchor=impact;s.target=enemies.filter(v=>!s.seen.has(v)&&executionRelayEnemy(v)&&dist(impact,v)<=240&&lineClear(impact,v)).sort((a,b)=>dist(impact,a)-dist(impact,b))[0];s.next+=.4;
  if(!s.target){s.finished=true;return false;}
 }
 return true;
};
const executionRelayPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{executionRelayPaintBase();for(const s of signatureSpells){if(s.mode!==109||!executionRelayValid(s)||!visibleAt(s.target.x,s.target.y))continue;const e=s.target,color=ELEMENTS[s.build.elements[0]].color,q=project(e.x,e.y),progress=clamp(1-(s.next-s.time)/.4,0,1);groundRing(e.x,e.y,32,'#ffb6a0',2);groundRing(e.x,e.y,42-24*progress,color,3);if(s.anchor)paintLinkLine(s.anchor,e,color,2);ctx.save();ctx.strokeStyle='#ffe2bc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(q.x-14,q.y-70+progress*35);ctx.lineTo(q.x+14,q.y-60+progress*35);ctx.moveTo(q.x-17,q.y-76);ctx.lineTo(q.x-17,q.y-25);ctx.moveTo(q.x+17,q.y-76);ctx.lineTo(q.x+17,q.y-25);ctx.stroke();ctx.restore();}};
const executionRelayStatusBase=controlSkillStatus;
controlSkillStatus=s=>s.mode===109?{label:'継走 '+(s.strikes+1)+'/3 · '+(s.strikes+1)*150+'%',value:clamp(1-(s.next-s.time)/.4,0,1),waiting:true}:executionRelayStatusBase(s);
