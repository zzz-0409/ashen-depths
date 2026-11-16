const REFLECTED_RAY_SIGNATURE=['反照の光線',24,5,'発動位置と方向を固定し、0.6秒後に合計600までの光線。直進部分150%、地形の壁で一度反射した先300%。同じ敵には一度だけ（両方に重なれば直進部分を優先）。2枚目の壁で停止。「隔ての石垣」では反射せず停止する。半幅14、範囲補正は幅だけ。発動後に光路が壁で遮られる・起点から500超・起点が壁越し・死亡・地域移動で解除。再発動で置き換える。','M6 42L31 12L46 34M20 7H44M23 3V11M32 3V11M41 3V11M37 34H46V25'];
SIGNATURE_SKILLS.push(REFLECTED_RAY_SIGNATURE);
Object.assign(GEM.crafted_8_0,{name:REFLECTED_RAY_SIGNATURE[0],cost:24,cool:5,desc:REFLECTED_RAY_SIGNATURE[3],ability:null,signature:112,tags:['spell','area']});
SIGNATURE_AUDIO.push(['reflectedray',720,.3]);SKILL_AUDIO_FAMILIES.metal.add('reflectedray');
function reflectedRayFloor(q){const g=gridPos(q.x,q.y);return isFloor(g.x,g.y);}
function reflectedRayPath(origin,angle){
 if(!passable(origin.x,origin.y,0))return [];
 let from={...origin},q={...origin},dx=Math.cos(angle),dy=Math.sin(angle),remaining=600,bounced=false;const segments=[];
 while(remaining>1e-8){const step=Math.min(2,remaining),next={x:q.x+dx*step,y:q.y+dy*step};remaining-=step;
  if(passable(next.x,next.y,0)){q=next;continue;}
  if(dist(from,q)>1e-8)segments.push({a:from,b:{...q},reflected:bounced});
  if(bounced||reflectedRayFloor(next))return segments;
  const blockX=!reflectedRayFloor({x:next.x,y:q.y}),blockY=!reflectedRayFloor({x:q.x,y:next.y});
  if(blockX||!blockY)dx=-dx;if(blockY||!blockX)dy=-dy;
  bounced=true;from={...q};
 }
 if(dist(from,q)>1e-8)segments.push({a:from,b:{...q},reflected:bounced});return segments;
}
function reflectedRayValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&dist(p,s.origin)<=500&&lineClear(p,s.origin)&&s.segments.every(v=>lineClear(v.a,v.b));}
function reflectedRayTargets(s){const hits=[],seen=new Set();for(const seg of s.segments){const dx=seg.b.x-seg.a.x,dy=seg.b.y-seg.a.y,len=Math.hypot(dx,dy);if(!len)continue;for(const e of enemies){if(e.hp<=0||seen.has(e))continue;const along=((e.x-seg.a.x)*dx+(e.y-seg.a.y)*dy)/len,side=Math.abs((e.x-seg.a.x)*dy-(e.y-seg.a.y)*dx)/len;if(along<0||along>len||side>14*s.build.radius)continue;const foot={x:seg.a.x+dx*along/len,y:seg.a.y+dy*along/len};if(!lineClear(foot,e))continue;seen.add(e);hits.push({e,mult:seg.reflected?3:1.5});}}return hits;}
const reflectedRayCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{const result=reflectedRayCastBase(build,...args);if(GEM[build.type]?.signature!==112)return result;const s=signatureSpells.at(-1);if(s?.mode!==112)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==112||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,fired:false,target:null,segments:reflectedRayPath(s.origin,s.angle)});return result;};
const reflectedRayStepBase=stepSignature;
stepSignature=(s,dt)=>{if(s.mode!==112)return reflectedRayStepBase(s,dt);if(!reflectedRayValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;s.time+=dt;if(!s.fired&&s.time+1e-8>=.6){s.fired=true;const targets=reflectedRayTargets(s);for(const {e,mult} of targets)if(e.hp>0&&enemies.includes(e)){spellHit(e,s.damage*mult,s.build);burst(e.x,e.y,32,ELEMENTS[s.build.elements[0]].color);}playSignatureAudio(112,true,s.origin.x,s.origin.y);}if(s.time+1e-8>=.85){s.finished=true;return false;}return true;};
const reflectedRayPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{reflectedRayPaintBase();const renderList=signatureRenderList(112,112);if(!renderList.length)return;for(const s of renderList){if(s.mode!==112||!reflectedRayValid(s))continue;for(const seg of s.segments){const color=seg.reflected?'#ffe5ad':ELEMENTS[s.build.elements[0]].color,dx=seg.b.x-seg.a.x,dy=seg.b.y-seg.a.y,len=Math.hypot(dx,dy);if(!len)continue;const nx=-dy/len*14*s.build.radius,ny=dx/len*14*s.build.radius;for(const side of [-1,1])paintLinkLine({x:seg.a.x+nx*side,y:seg.a.y+ny*side},{x:seg.b.x+nx*side,y:seg.b.y+ny*side},color,1);paintLinkLine(seg.a,seg.b,color,s.fired?8:2);if(s.fired)paintLinkLine(seg.a,seg.b,'#fff9e8',3);if(seg.reflected)groundRing(seg.a.x,seg.a.y,12,color,2);}}};
const reflectedRayStatusBase=controlSkillStatus;
controlSkillStatus=s=>s.mode===112?{label:s.segments.some(v=>v.reflected)?'反射先300%':'直進150%',value:clamp(s.time/.6,0,1),waiting:!s.fired}:reflectedRayStatusBase(s);
