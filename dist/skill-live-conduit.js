// The hostile anchor is not damaged: positioning both ends controls the attack.
const LIVE_CONDUIT_SIGNATURE=['導線の結び目',24,6,'照準付近の敵1体と自分を4秒結ぶ。0.5秒ごと、2者の間の半幅20以内にいる別の敵へ55%（最大8回）。結び目に選んだ敵には当たらない。自分と対象の移動に線が追従する。対象の死亡・消失、距離500超、壁で遮られる、死亡・地域移動で解除。範囲補正は線幅だけ。再発動は結び直し。','M6 40L42 10M7 32L15 40M18 22L30 34M28 12L40 24M35 5H47V17H35ZM3 37H11V45H3Z'];
SIGNATURE_SKILLS.push(LIVE_CONDUIT_SIGNATURE);Object.assign(GEM.crafted_8_2,{name:LIVE_CONDUIT_SIGNATURE[0],cost:24,cool:6,desc:LIVE_CONDUIT_SIGNATURE[3],ability:null,signature:114,tags:['spell','area']});
SIGNATURE_AUDIO.push(['liveconduit',610,.3]);SKILL_AUDIO_FAMILIES.metal.add('liveconduit');
function liveConduitValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&s.target?.hp>0&&enemies.includes(s.target)&&dist(p,s.target)<=500&&lineClear(p,s.target);}
function liveConduitTouches(s,e){
 if(e===s.target||e.hp<=0)return false;
 const dx=s.target.x-p.x,dy=s.target.y-p.y,len=Math.hypot(dx,dy);if(len<1)return false;
 const along=((e.x-p.x)*dx+(e.y-p.y)*dy)/len;
 if(along<=0||along>=len||Math.abs((e.x-p.x)*dy-(e.y-p.y)*dx)/len>20*s.build.radius)return false;
 return lineClear({x:p.x+dx*along/len,y:p.y+dy*along/len},e);
}
const liveConduitCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const result=liveConduitCastBase(build,...args);if(GEM[build.type]?.signature!==114)return result;const s=signatureSpells.at(-1);if(s?.mode!==114)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==114||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,ticks:0,next:.5});
 if(!liveConduitValid(s)){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('500以内の敵を照準で選んでください');}return result;
};
const liveConduitStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==114)return liveConduitStepBase(s,dt);if(!liveConduitValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 s.time+=dt;s.x=s.target.x;s.y=s.target.y;
 while(s.ticks<8&&s.time+1e-8>=s.next){
  if(!liveConduitValid(s)){s.finished=true;return false;}
  // Each pulse resolves against current endpoints; rendering never deals damage.
  const targets=enemies.filter(e=>liveConduitTouches(s,e));s.ticks++;s.next=.5*(s.ticks+1);
  for(const e of targets){if(!liveConduitValid(s))break;if(e.hp>0&&enemies.includes(e))spellHit(e,s.damage*.55,s.build);}
  if(targets.length)playSignatureAudio(114,true,p.x,p.y);
 }
 if(s.ticks>=8){s.finished=true;return false;}return true;
};
const liveConduitPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{
 liveConduitPaintBase();const renderList=signatureRenderList(114,114);if(!renderList.length)return;for(const s of renderList){if(s.mode!==114||!liveConduitValid(s))continue;
  const e=s.target,color=ELEMENTS[s.build.elements[0]].color,dx=e.x-p.x,dy=e.y-p.y,len=Math.hypot(dx,dy);if(len<1)continue;
  const nx=-dy/len*20*s.build.radius,ny=dx/len*20*s.build.radius;
  for(const side of [-1,1])paintLinkLine({x:p.x+nx*side,y:p.y+ny*side},{x:e.x+nx*side,y:e.y+ny*side},color,1);
  const flash=s.ticks>0&&s.time-s.ticks*.5<.12;paintLinkLine(p,e,color,flash?6:2);
  if(flash)paintLinkLine(p,e,'#fff3c9',2);
  groundRing(e.x,e.y,28,'#ffe5ad',2);boundarySigil(e,20,'#ffe5ad',s.time,4);
  for(let i=0;i<3;i++){const t=(s.time*1.5+i/3)%1;groundRing(p.x+dx*t,p.y+dy*t,4,color,2);}
 }
};
const liveConduitStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===114?{label:'導線 '+s.ticks+'/8 · 結び目は対象外',value:clamp(s.time/4,0,1),waiting:true}:liveConduitStatusBase(s);
