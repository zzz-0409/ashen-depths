const STILL_CLOCK_SIGNATURE=['静縛の時計',24,7,'敵1体を2秒減速し、最大5秒の時計を付ける。敵が半径18の範囲に1.25秒留まると360%の追撃を一度だけ与える。範囲を出るとその位置を新しい中心にして蓄積を0へ戻す。移動だけを減速し攻撃は止めない。拘束技や敵の攻撃後の隙と組み合わせる。射程500。壁・対象消失・対象の200超の瞬間移動・死亡・地域移動で解除。再発動で時計を置き換え、付与済みの減速は残り時間どおり。属性・範囲補正で静止判定や時間は変わらない。','M8 26A18 18 0 1 0 44 26A18 18 0 1 0 8 26M26 13V26L36 32M5 8H15M10 3V13M37 7L45 15M14 45L9 50M38 45L43 50'];
SIGNATURE_SKILLS.push(STILL_CLOCK_SIGNATURE);Object.assign(GEM.crafted_8_6,{name:STILL_CLOCK_SIGNATURE[0],cost:24,cool:7,desc:STILL_CLOCK_SIGNATURE[3],ability:null,signature:118,tags:['spell']});
SIGNATURE_AUDIO.push(['stillclock',390,.3]);SKILL_AUDIO_FAMILIES.metal.add('stillclock');
function stillClockValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&s.target?.hp>0&&enemies.includes(s.target)&&dist(p,s.target)<=500&&lineClear(p,s.target);}
const stillClockCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{const result=stillClockCastBase(build,...args);if(GEM[build.type]?.signature!==118)return result;const s=signatureSpells.at(-1);if(s?.mode!==118)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==118||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,still:0});if(!stillClockValid(s)){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('500以内で見える敵を狙ってください');return result;}s.anchor={x:s.target.x,y:s.target.y};s.last={...s.anchor};s.target.slow=Math.max(s.target.slow||0,2);return result;};
const stillClockStepBase=stepSignature;
stepSignature=(s,dt)=>{if(s.mode!==118)return stillClockStepBase(s,dt);if(!stillClockValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 const e=s.target;if(dist(e,s.last)>200||!lineClear(s.last,e)){s.finished=true;return false;}s.last={x:e.x,y:e.y};const before=s.time,charge=s.still;s.time=Math.min(5,s.time+dt);
 if(dist(e,s.anchor)>18){s.anchor={...s.last};s.still=0;}else s.still+=s.time-before;
 if(s.still+1e-8>=1.25&&before+Math.max(0,1.25-charge)<5-1e-8){s.finished=true;spellHit(e,s.damage*3.6,s.build);burst(e.x,e.y,65,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(118,true,e.x,e.y);return false;}if(s.time>=5-1e-8){s.finished=true;return false;}return true;
};
const stillClockPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{stillClockPaintBase();const list=signatureRenderList(118);if(!list.length)return;for(const s of list){if(!stillClockValid(s))continue;const e=s.target,color=ELEMENTS[s.build.elements[0]].color,progress=clamp(s.still/1.25,0,1);groundRing(s.anchor.x,s.anchor.y,18,'#ffe4b8',1);groundRing(e.x,e.y,42-20*progress,color,2);boundarySigil(e,30,color,s.time,6);const angle=-Math.PI/2+progress*Math.PI*2;paintLinkLine(e,{x:e.x+Math.cos(angle)*32,y:e.y+Math.sin(angle)*32},'#ffe4b8',3);}};
const stillClockStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===118?{label:'時計 · 範囲内 '+Math.min(1.25,s.still).toFixed(2)+'/1.25秒',value:clamp(s.still/1.25,0,1),waiting:true}:stillClockStatusBase(s);
