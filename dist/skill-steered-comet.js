const STEERED_COMET_SIGNATURE=['操星の彗星',26,7,'足元から秒速220の彗星を放ち、飛行中の照準地点へ毎秒最大120度で曲げる。敵を自動追尾しない。敵の中心から16以内に接触するか3秒経つと、半径100へ320%の爆発を一度だけ起こす。飛行中に触れていない敵も爆発に巻き込む。壁に当たると爆発せず消える。範囲補正は爆発半径だけ。自分は自由に移動・攻撃できる。自分から700超・死亡・地域移動で解除、再発動で置き換える。','M6 40Q5 10 30 12M22 6L31 12L23 20M32 28L39 20L43 30L50 35L40 39L35 48L30 38L21 34Z'];
SIGNATURE_SKILLS.push(STEERED_COMET_SIGNATURE);Object.assign(GEM.crafted_12_0,{name:STEERED_COMET_SIGNATURE[0],cost:26,cool:7,desc:STEERED_COMET_SIGNATURE[3],ability:null,signature:128,tags:['spell','area']});
SIGNATURE_AUDIO.push(['steeredcomet',480,.35]);SKILL_AUDIO_FAMILIES.metal.add('steeredcomet');
function steeredCometValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&dist(p,s)<=700;}
function steeredCometContact(a,b,e){
 const dx=b.x-a.x,dy=b.y-a.y,ox=a.x-e.x,oy=a.y-e.y,c=ox*ox+oy*oy-256;
 if(c<=0)return 0;const length=dx*dx+dy*dy;if(!length)return null;
 const dot=ox*dx+oy*dy,disc=dot*dot-length*c;if(disc<0)return null;
 const t=(-dot-Math.sqrt(disc))/length;return t>=0&&t<=1?t:null;
}
function explodeSteeredComet(s){
 s.finished=true;s.exploded=true;const targets=enemies.filter(e=>e.hp>0&&dist(s,e)<=100*s.build.radius+1e-8&&lineClear(s,e));
 for(const e of targets){if(s.owner!==p||s.world!==dungeon||dead||p?.hp<=0)break;if(e.hp>0&&enemies.includes(e)&&lineClear(s,e))spellHit(e,s.damage*3.2,s.build);}
 burst(s.x,s.y,100*s.build.radius,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(128,true,s.x,s.y);
}
const steeredCometCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{const result=steeredCometCastBase(build,...args);if(GEM[build.type]?.signature!==128)return result;const s=signatureSpells.at(-1);if(s?.mode!==128)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==128||v===s);Object.assign(s,{x:p.x,y:p.y,owner:p,world:dungeon,target:null,finished:false,exploded:false,flightRemainder:0,trail:[]});return result;};
const steeredCometStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==128)return steeredCometStepBase(s,dt);
 if(!steeredCometValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 s.flightRemainder+=Math.min(dt,3);const tick=1/120,aim=unproject(mouse.x,mouse.y);
 while(s.flightRemainder+1e-9>=tick&&s.time<3){
  s.flightRemainder=Math.max(0,s.flightRemainder-tick);if(!steeredCometValid(s)){s.finished=true;return false;}
  if(dist(s,aim)>4){const wanted=Math.atan2(aim.y-s.y,aim.x-s.x),delta=Math.atan2(Math.sin(wanted-s.angle),Math.cos(wanted-s.angle));s.angle+=clamp(delta,-Math.PI*2/3*tick,Math.PI*2/3*tick);}
  const old={x:s.x,y:s.y},next={x:s.x+Math.cos(s.angle)*220*tick,y:s.y+Math.sin(s.angle)*220*tick};let first=1,contact=false;
  for(const e of enemies){if(e.hp<=0)continue;const t=steeredCometContact(old,next,e);if(t!==null&&t<=first&&lineClear(old,e)){first=t;contact=true;}}
  const end={x:old.x+(next.x-old.x)*first,y:old.y+(next.y-old.y)*first};
  if(!lineClear(old,end)){s.finished=true;return false;}
  s.x=end.x;s.y=end.y;s.time=Math.min(3,s.time+tick);s.trail.push(old);if(s.trail.length>24)s.trail.shift();
  if(!steeredCometValid(s)){s.finished=true;return false;}
  if(contact||s.time+1e-8>=3){explodeSteeredComet(s);return false;}
 }
 return true;
};
const steeredCometPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{steeredCometPaintBase();for(const s of signatureRenderList(128)){if(!steeredCometValid(s)||!visibleAt(s.x,s.y))continue;const color=ELEMENTS[s.build.elements[0]].color;for(let i=1;i<s.trail.length;i+=3)paintLinkLine(s.trail[Math.max(0,i-3)],s.trail[i],color,1+i/s.trail.length*5);groundRing(s.x,s.y,100*s.build.radius,color,1);const q=project(s.x,s.y);ctx.save();ctx.fillStyle='#fff2cf';ctx.shadowColor=color;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(q.x,q.y-14,9,0,Math.PI*2);ctx.fill();ctx.restore();paintLinkLine(s,{x:s.x+Math.cos(s.angle)*40,y:s.y+Math.sin(s.angle)*40},'#fff2cf',2);}};
const steeredCometStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===128?{label:'照準で彗星を操縦 · '+Math.max(0,3-s.time).toFixed(1)+'秒',value:s.time/3,waiting:true}:steeredCometStatusBase(s);
