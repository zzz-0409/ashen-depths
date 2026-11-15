// Follow a fixed target order with direct normal hits; forged elements only change damage elements.
const RELAY_SIGNATURE=['輪番の刻印',24,7,'狙った地点の半径280から近い順に最大3体へ8秒の刻印。光る順番の敵に通常攻撃を直接当てると80%の追撃が発生し、次へ移る（通常攻撃1回につき1体）。全員を順番に当てると最後の地点の半径200へ、指定数×120%の終撃。別の敵への攻撃・スキルでは進まない。未達成の対象が倒れると中断。再発動でやり直す。','M8 12H20V24H8ZM32 12H44V24H32ZM20 34H32V46H20ZM21 18H30M37 26L30 32M19 32L12 26'];
SIGNATURE_SKILLS.push(RELAY_SIGNATURE);
Object.assign(GEM.crafted_1_5,{name:RELAY_SIGNATURE[0],cost:24,cool:7,desc:RELAY_SIGNATURE[3],ability:null,signature:77,tags:['spell','area']});
SIGNATURE_AUDIO.push(['relay',620,.24]);SKILL_AUDIO_FAMILIES.metal.add('relay');
const relayCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=relayCastBase(build,...args);if(GEM[build.type]?.signature!==77)return result;let s=signatureSpells.at(-1);if(!s||s.mode!==77)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==77||v===s);s.owner=p;s.target=null;s.index=0;s.finished=false;
 s.order=enemies.filter(e=>e.hp>0&&dist(e,s)<=280*s.build.radius&&lineClear(s,e)&&lineClear(p,e)).sort((a,b)=>dist(a,s)-dist(b,s)).slice(0,3);
};
function relayValid(s){return s.owner===p&&!s.finished&&s.time<8&&s.order.length>0&&s.order.slice(s.index).every(e=>e.hp>0&&enemies.includes(e));}
let relayResolving=false,relayActionSerial=0;
const relayPerformBase=performAction;performAction=action=>{if(action.n===0)relayActionSerial++;return relayPerformBase(action);};
const relayHitBase=hit;hit=(e,d)=>{
 let watches=!relayResolving&&cadenceNormalAction&&classHitKind==='normal'&&!e?.dotTick&&!treeExplosion&&!paused&&!dead?signatureSpells.filter(s=>s.mode===77&&s.lastAction!==relayActionSerial&&relayValid(s)&&s.order[s.index]===e&&lineClear(p,e)):[];
 let hp=e?.hp,training=e?.trainingHits||0,result=relayHitBase(e,d);
 if(e&&(e.hp<hp||(e.trainingHits||0)>training)&&!dead&&p.hp>0)for(let s of watches){if(!signatureSpells.includes(s)||s.finished)continue;
  s.index++;s.lastAction=relayActionSerial;relayResolving=true;try{if(e.hp>0)spellHit(e,s.damage*.8,s.build);playSignatureAudio(77,true,e.x,e.y);burst(e.x,e.y,45,ELEMENTS[s.build.elements[0]].color);if(s.index===s.order.length){s.finished=true;signatureArea(s,e,200,s.order.length*1.2);}}finally{relayResolving=false;}
 }
 return result;
};
const relayStepBase=stepSignature;stepSignature=(s,dt)=>{if(s.mode!==77)return relayStepBase(s,dt);if(dead||p.hp<=0||!relayValid(s))return false;if(paused)return true;s.time=Math.round((s.time+dt)*1e6)/1e6;return s.time<8;};
const relayPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{relayPaintBase();ctx.save();for(let s of signatureSpells){if(s.mode!==77||!relayValid(s))continue;for(let i=s.index;i<s.order.length;i++){let e=s.order[i];if(!visibleAt(e.x,e.y))continue;let active=i===s.index,col=active?'#fff1c3':ELEMENTS[s.build.elements[0]].color;groundRing(e.x,e.y,active?42:28,col,active?3:1);let q=project(e.x,e.y);ctx.fillStyle=col;ctx.strokeStyle='#10141d';ctx.lineWidth=4;ctx.textAlign='center';ctx.font='bold 18px sans-serif';ctx.strokeText(String(i+1),q.x,q.y-105);ctx.fillText(String(i+1),q.x,q.y-105);}}ctx.restore();};
const relayStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===77?{label:s.finished?'終撃':s.order.length?'通常攻撃 '+Math.min(s.index+1,s.order.length)+'/'+s.order.length:'対象なし',value:s.order.length?s.index/s.order.length:0,waiting:!s.finished}:relayStatusBase(s);
