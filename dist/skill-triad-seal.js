const TRIAD_SEAL_SIGNATURE=['三杭の囲い',12,.3,'6秒以内に3回発動し、照準位置へ杭を置く（毎回MP12、プロコンは1回押すと1本）。3点で囲む三角形が完成すると0.6秒後、内側へ360%を一度だけ与える。杭同士は35～400、面積2500以上必要。配置できない発動もMPを消費する。自分から500を超える杭や壁で遮られた辺があると解除。完成後の再発動は置き換え。属性・範囲補正で配置形状は変わらない。','M8 44L26 8L44 44ZM8 38V50M26 2V14M44 38V50M18 36H34'];
SIGNATURE_SKILLS.push(TRIAD_SEAL_SIGNATURE);Object.assign(GEM.crafted_3_7,{name:TRIAD_SEAL_SIGNATURE[0],cost:12,cool:.3,desc:TRIAD_SEAL_SIGNATURE[3],ability:null,pressOnly:true,signature:95,tags:['spell','area']});
SIGNATURE_AUDIO.push(['triadseal',690,.35]);SKILL_AUDIO_FAMILIES.electric.add('triadseal');
function triadSealCross(a,b,q){return (b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x);}
function triadSealArea(points){return points.length===3?Math.abs(triadSealCross(points[0],points[1],points[2]))*.5:0;}
function triadSealContains(points,q){if(points.length!==3)return false;let signs=points.map((a,i)=>triadSealCross(a,points[(i+1)%3],q));return signs.every(v=>v>=-1e-8)||signs.every(v=>v<=1e-8);}
function triadSealValid(s){return s.owner===p&&s.world===dungeon&&!s.finished&&!dead&&p.hp>0&&s.points?.length&&s.points.every(q=>dist(p,q)<=500&&lineClear(p,q));}
function triadSealPlacement(points,q){return passable(q.x,q.y,18)&&points.every(a=>dist(a,q)>=35&&dist(a,q)<=400&&lineClear(a,q))&&(points.length!==2||triadSealArea([...points,q])>=2500);}
const triadSealCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 if(GEM[build.type]?.signature!==95)return triadSealCastBase(build,...args);
 let previous=signatureSpells.find(s=>s.mode===95&&triadSealValid(s)&&s.points.length<3&&s.time<6),result=triadSealCastBase(build,...args),fresh=signatureSpells.at(-1);
 if(fresh?.mode!==95||fresh===previous)return result;
 let point={x:fresh.x,y:fresh.y};
 if(previous&&signatureSpells.includes(previous)){signatureSpells=signatureSpells.filter(s=>s!==fresh);if(!triadSealPlacement(previous.points,point)){say('杭は35～400離し、三角形を広く囲んでください');return result;}previous.points.push(point);if(previous.points.length===3)previous.releaseAt=previous.time+.6;playSignatureAudio(95,false,point.x,point.y);return result;}
 signatureSpells=signatureSpells.filter(s=>s.mode!==95||s===fresh);fresh.owner=p;fresh.world=dungeon;fresh.points=[point];fresh.target=null;fresh.finished=false;
 if(!triadSealPlacement([],point)){signatureSpells=signatureSpells.filter(s=>s!==fresh);say('杭を置ける場所がありません');}return result;
};
const triadSealStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==95)return triadSealStepBase(s,dt);if(!triadSealValid(s))return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(s.points.some((q,i)=>s.points.slice(i+1).some(r=>!lineClear(q,r))))return false;
 s.time+=dt;if(s.points.length<3)return s.time<6;if(s.time+1e-8<s.releaseAt)return true;s.finished=true;
 let center={x:s.points.reduce((v,q)=>v+q.x,0)/3,y:s.points.reduce((v,q)=>v+q.y,0)/3};
 for(let e of enemies)if(e.hp>0&&triadSealContains(s.points,e)&&lineClear(p,e)&&lineClear(center,e))spellHit(e,s.damage*3.6,s.build);
 for(let point of s.points)burst(point.x,point.y,45,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(95,true,center.x,center.y);return false;
};
const triadSealPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{triadSealPaintBase();const renderList=signatureRenderList(95,95);if(!renderList.length)return;for(const s of renderList){if(s.mode!==95||!triadSealValid(s))continue;let color=ELEMENTS[s.build.elements[0]].color;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();s.points.forEach((point,i)=>{let q=project(point.x,point.y);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});if(s.points.length===3){ctx.closePath();ctx.fillStyle='#a283e52b';ctx.fill();}ctx.stroke();ctx.restore();for(let point of s.points)if(visibleAt(point.x,point.y)){groundRing(point.x,point.y,20,color,2);let q=project(point.x,point.y);ctx.save();ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(q.x,q.y-48);ctx.lineTo(q.x+7,q.y-21);ctx.lineTo(q.x,q.y);ctx.lineTo(q.x-7,q.y-21);ctx.closePath();ctx.fill();ctx.restore();}}};
const triadSealStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===95?{label:s.points.length===3?'囲いが炸裂':'杭 '+s.points.length+'/3',value:s.points.length===3?clamp(1-(s.releaseAt-s.time)/.6,0,1):s.points.length/3,waiting:true}:triadSealStatusBase(s);
