// Release the fixed mark manually during its visible timing window.
const TIMING_SIGNATURE=['時機の抜刀',18,.35,'照準地点に3秒の印を置く。同じスキルの再発動が成立すると半径140へ160%、設置から1～1.6秒の金色の好機なら480%。再使用もMP18。タイミングはボタン入力ではなく攻撃が出た瞬間で判定。3秒放置では攻撃せず消える。発動時に印から500以内・射線内が必要。移動しても印は動かない。','M10 40L39 11M29 11H39V21M10 21A19 19 0 1 1 18 43M26 14V26L35 31'];
SIGNATURE_SKILLS.push(TIMING_SIGNATURE);
Object.assign(GEM.crafted_2_1,{name:TIMING_SIGNATURE[0],cost:18,cool:.35,desc:TIMING_SIGNATURE[3],ability:null,signature:81,tags:['spell','area']});
SIGNATURE_AUDIO.push(['timing',1180,.3]);SKILL_AUDIO_FAMILIES.metal.add('timing');
function timingValid(s){return s.owner===p&&s.time<3&&!dead&&p.hp>0;}
function timingPerfect(s){return s.time>=1&&s.time<=1.6;}
const timingCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 if(GEM[build.type]?.signature!==81)return timingCastBase(build,...args);
 if(!started||paused||dead||p.hp<=0)return;
 let old=signatureSpells.find(s=>s.mode===81&&timingValid(s));
 if(old){signatureSpells=signatureSpells.filter(s=>s!==old);if(dist(p,old)<=500&&lineClear(p,old)){signatureArea(old,old,140,timingPerfect(old)?4.8:1.6);playSignatureAudio(81,true,old.x,old.y);}else say('印が遠いか、壁に遮られています');return;}
 let result=timingCastBase(build,...args),s=signatureSpells.at(-1);if(s?.mode===81){signatureSpells=signatureSpells.filter(v=>v.mode!==81||v===s);s.owner=p;s.target=null;s.cued=false;}return result;
};
const timingStepBase=stepSignature;stepSignature=(s,dt)=>{if(s.mode!==81)return timingStepBase(s,dt);if(!timingValid(s))return false;if(paused)return true;if(!Number.isFinite(dt)||dt<=0)return true;s.time=Math.round((s.time+dt)*1e6)/1e6;if(!s.cued&&timingPerfect(s)){s.cued=true;playSignatureAudio(81,false,s.x,s.y);}return s.time<3;};
const timingPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{timingPaintBase();const renderList=signatureRenderList(81,81);if(!renderList.length)return;ctx.save();for(const s of renderList){if(s.mode!==81||!timingValid(s)||!visibleAt(s.x,s.y))continue;let r=140*s.build.radius,col=timingPerfect(s)?'#ffe59a':ELEMENTS[s.build.elements[0]].color;groundRing(s.x,s.y,r,col,timingPerfect(s)?4:2);ctx.strokeStyle='#ffe59a';ctx.lineWidth=5;ctx.beginPath();for(let i=0;i<=20;i++){let a=-Math.PI/2+(1+i*.03)/3*Math.PI*2,q=project(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}ctx.stroke();let a=-Math.PI/2+s.time/3*Math.PI*2,q=project(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r);glowAt(q,10,'#ffffff',.8);paintLinkLine(s,{x:s.x+Math.cos(a)*r,y:s.y+Math.sin(a)*r},col,2);}ctx.restore();};
const timingStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===81?{label:timingPerfect(s)?'好機 · 再使用で強撃':s.time<1?'好機まで待つ':'再使用 / まもなく消滅',value:Math.max(0,1-s.time/3),waiting:true}:timingStatusBase(s);
