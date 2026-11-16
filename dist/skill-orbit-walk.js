// Complete a continuous orbit; reversing direction cancels angular progress.
const ORBIT_WALK_SIGNATURE=['輪還の星環',28,8,'照準地点に6秒間の星環を設置。中心から80～180の帯の中を時計回りか反時計回りに一周すると、中心の半径240へ500%の一撃。往復では進捗が相殺される。帯の外・壁を横切る移動・瞬間移動で周回をリセット。自分が中心から500を超えるか壁に遮られると消滅。帯の幅は範囲補正で変わらず、爆発半径だけ変化する。','M26 7A19 19 0 1 1 8 20M8 8V20H20M26 20L32 26L26 32L20 26ZM37 8L42 13'];
SIGNATURE_SKILLS.push(ORBIT_WALK_SIGNATURE);
Object.assign(GEM.crafted_2_5,{name:ORBIT_WALK_SIGNATURE[0],cost:28,cool:8,desc:ORBIT_WALK_SIGNATURE[3],ability:null,signature:85,tags:['spell','area']});
SIGNATURE_AUDIO.push(['orbitwalk',740,.4]);SKILL_AUDIO_FAMILIES.airy.add('orbitwalk');
function orbitWalkBand(point,s){let r=dist(point,s);return r>=80-1e-7&&r<=180+1e-7;}
const orbitWalkCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{let result=orbitWalkCastBase(build,...args);if(GEM[build.type]?.signature!==85)return result;let s=signatureSpells.at(-1);if(s?.mode===85){signatureSpells=signatureSpells.filter(v=>v.mode!==85||v===s);s.owner=p;s.previous={x:p.x,y:p.y};s.winding=0;s.ready=false;s.inBand=orbitWalkBand(p,s);s.target=null;}return result;};
const orbitWalkAdvanceBase=advanceSignatureSpells;advanceSignatureSpells=dt=>{
 if(Number.isFinite(dt)&&dt>0&&!paused&&!dead&&p.hp>0)for(let s of signatureSpells){if(s.mode!==85||s.owner!==p||s.ready||s.time+dt>6+1e-6)continue;let previous=s.previous,dx=p.x-previous.x,dy=p.y-previous.y,length2=dx*dx+dy*dy,t=length2?Math.max(0,Math.min(1,((s.x-previous.x)*dx+(s.y-previous.y)*dy)/length2)):0;
  let valid=orbitWalkBand(previous,s)&&orbitWalkBand(p,s)&&Math.hypot(previous.x+dx*t-s.x,previous.y+dy*t-s.y)>=80-1e-7&&Math.sqrt(length2)<=900*dt+1&&lineClear(previous,p);
  if(valid){let a=Math.atan2(previous.y-s.y,previous.x-s.x),b=Math.atan2(p.y-s.y,p.x-s.x);s.winding+=Math.atan2(Math.sin(b-a),Math.cos(b-a));s.ready=Math.abs(s.winding)>=Math.PI*2-1e-6;}else s.winding=0;
  s.inBand=orbitWalkBand(p,s);s.previous={x:p.x,y:p.y};
 }
 return orbitWalkAdvanceBase(dt);
};
const orbitWalkStepBase=stepSignature;stepSignature=(s,dt)=>{if(s.mode!==85)return orbitWalkStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p)return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;if(dist(p,s)>500||!lineClear(p,s))return false;s.time=Math.round((s.time+dt)*1e6)/1e6;if(s.time>6)return false;if(s.ready){signatureArea(s,s,240,5);burst(s.x,s.y,240*s.build.radius,'#bfeaf4');playSignatureAudio(85,true,s.x,s.y);return false;}return s.time<6;};
const orbitWalkPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{orbitWalkPaintBase();const renderList=signatureRenderList(85,85);if(!renderList.length)return;ctx.save();for(const s of renderList){if(s.mode!==85||s.owner!==p||!visibleAt(s.x,s.y))continue;groundRing(s.x,s.y,80,'#789ba8',1);groundRing(s.x,s.y,180,'#adcfd8',2);let progress=Math.min(1,Math.abs(s.winding)/(Math.PI*2));ctx.strokeStyle='#ffe5a2';ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<=40;i++){let angle=-Math.PI/2+i/40*progress*Math.PI*2*(s.winding<0?-1:1),q=project(s.x+Math.cos(angle)*130,s.y+Math.sin(angle)*130);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}ctx.stroke();}ctx.restore();};
const orbitWalkStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===85?{label:s.inBand?'周回 '+Math.min(100,Math.floor(Math.abs(s.winding)/(Math.PI*2)*100))+'%':'星環の帯へ移動',value:Math.max(0,1-s.time/6),waiting:true}:orbitWalkStatusBase(s);
