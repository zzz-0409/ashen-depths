// Enemy separation, not the player's distance or a repeated elemental variant, triggers this spell.
const PARTING_CHAIN_SIGNATURE=['離反の鎖',26,7,'照準付近の敵と、その200以内の別の敵を5秒間結ぶ。2体の間隔が発動時より120以上広がると、両方へ240%の一撃。起動0.3秒。敵の誘導や押し出しで鎖を張る。どちらかが倒れる・自分から550を超える・2体が450を超えて離れる・壁に遮られると解除。2体必要。再発動で置き換える。','M8 12L20 24M32 28L44 40M17 17L24 17L27 23M29 29L32 35L39 35M21 31L27 25L32 20M25 39L28 32M24 20L21 12'];
SIGNATURE_SKILLS.push(PARTING_CHAIN_SIGNATURE);Object.assign(GEM.crafted_3_4,{name:PARTING_CHAIN_SIGNATURE[0],cost:26,cool:7,desc:PARTING_CHAIN_SIGNATURE[3],ability:null,signature:92,tags:['spell']});
SIGNATURE_AUDIO.push(['partingchain',280,.32]);SKILL_AUDIO_FAMILIES.heavy.add('partingchain');
function partingChainValid(s){return s.pair?.length===2&&s.pair.every(e=>e.hp>0&&enemies.includes(e)&&dist(p,e)<=550&&lineClear(p,e))&&dist(...s.pair)<=450&&lineClear(...s.pair);}
const partingChainCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=partingChainCastBase(build,...args);if(GEM[build.type]?.signature!==92)return result;let s=signatureSpells.at(-1);if(s?.mode!==92)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==92||v===s);s.owner=p;let a=s.target,b=a&&enemies.filter(e=>e!==a&&e.hp>0&&dist(a,e)<=200&&dist(p,e)<=550&&lineClear(p,e)&&lineClear(a,e)).sort((x,y)=>dist(a,x)-dist(a,y))[0];s.pair=b?[a,b]:[];
 if(!partingChainValid(s)){signatureSpells=signatureSpells.filter(v=>v!==s);say('近くの敵2体を結べません');return result;}s.initialGap=dist(...s.pair);s.breakGap=s.initialGap+120;return result;
};
const partingChainStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==92)return partingChainStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p)return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;if(!partingChainValid(s))return false;
 s.time=Math.round((s.time+dt)*1e6)/1e6;if(s.time>=5)return false;
 if(s.time>=.3&&dist(...s.pair)>=s.breakGap){for(let e of s.pair)if(e.hp>0&&enemies.includes(e)){spellHit(e,s.damage*2.4,s.build);burst(e.x,e.y,65,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(92,true,e.x,e.y);}return false;}return true;
};
const partingChainPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 partingChainPaintBase();for(let s of signatureSpells){if(s.mode!==92||s.owner!==p||s.pair?.length!==2||s.pair.some(e=>e.hp<=0))continue;let [a,b]=s.pair,tension=clamp((dist(a,b)-s.initialGap)/120,0,1),color=ELEMENTS[s.build.elements[0]].color;
  for(let e of s.pair)if(visibleAt(e.x,e.y)){groundRing(e.x,e.y,25,color,2);boundarySigil(e,30,'#e5c88e',s.time*(1+tension),4);}
  if(visibleAt(a.x,a.y)&&visibleAt(b.x,b.y)){paintLinkLine(a,b,tension>.75?'#fff0bb':color,2+tension*2);let q=project((a.x+b.x)/2,(a.y+b.y)/2);ctx.save();ctx.strokeStyle='#ffe6a1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y-46,12,-Math.PI/2,-Math.PI/2+Math.PI*2*tension);ctx.stroke();ctx.restore();}
 }
};
const partingChainStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===92?{label:'離反 あと'+Math.max(0,Math.ceil(s.breakGap-dist(...s.pair))),value:clamp((dist(...s.pair)-s.initialGap)/120,0,1),waiting:true}:partingChainStatusBase(s);
