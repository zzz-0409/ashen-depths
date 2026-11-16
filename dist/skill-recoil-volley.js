const RECOIL_VOLLEY_SIGNATURE=['反動の三連砲',24,6,'0.3・0.7・1.1秒後、現在の照準へ長さ460・半幅18の貫通砲撃を各140%。1発ごとに追加SP8を消費し、撃った方向と逆へ最大50後退する。後退は壁で止まるが射撃は行う。SP8未満で残りの砲撃を中止。各射撃の起点は後退前の位置。射線は壁で遮られる。回避扱いではなく無敵も付かない。自動移動・追跡は解除。死亡・地域移動・壁越しの移動・1更新200超の瞬間移動で解除。再発動は置き換え。範囲補正は線幅だけ。','M19 18H40L48 26L40 34H19ZM5 18L12 26L5 34M12 12L23 26L12 40M27 22H40M27 30H40'];
SIGNATURE_SKILLS.push(RECOIL_VOLLEY_SIGNATURE);Object.assign(GEM.crafted_11_3,{name:RECOIL_VOLLEY_SIGNATURE[0],cost:24,cool:6,desc:RECOIL_VOLLEY_SIGNATURE[3],ability:null,signature:123,tags:['spell','area']});
SIGNATURE_AUDIO.push(['recoilvolley',510,.3]);SKILL_AUDIO_FAMILIES.metal.add('recoilvolley');
function recoilVolleyValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0;}
const recoilVolleyCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{const result=recoilVolleyCastBase(build,...args);if(GEM[build.type]?.signature!==123)return result;const s=signatureSpells.at(-1);if(s?.mode!==123)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==123||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,target:null,heading:s.angle,ticks:0,rays:[],last:{x:p.x,y:p.y}});return result;};
const recoilVolleyStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==123)return recoilVolleyStepBase(s,dt);if(!recoilVolleyValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(dist(p,s.last)>200||!lineClear(s.last,p)){s.finished=true;return false;}s.last={x:p.x,y:p.y};s.time+=dt;const previewAim=unproject(mouse.x,mouse.y);if(dist(p,previewAim)>5)s.heading=Math.atan2(previewAim.y-p.y,previewAim.x-p.x);
 while(s.ticks<3&&s.time+1e-8>=.3+s.ticks*.4){
  if(!recoilVolleyValid(s))return false;ensureClassResources();if(p.sp<8){s.finished=true;return false;}
  const aim=unproject(mouse.x,mouse.y);if(dist(p,aim)>5)s.heading=Math.atan2(aim.y-p.y,aim.x-p.x);
  const ray={x:p.x,y:p.y,angle:s.heading,until:.3+s.ticks*.4+.18},targets=enemies.filter(e=>echoVolleyTouches(ray,e,s.build.radius));
  s.rays.push(ray);s.ticks++;p.sp-=8;classRest=Math.max(classRest,.6);route=[];moveGoal=null;attackTarget=null;lootTarget=null;
  for(const e of targets){if(!recoilVolleyValid(s))return false;if(e.hp>0&&enemies.includes(e))spellHit(e,s.damage*1.4,s.build);}
  if(!recoilVolleyValid(s))return false;
  for(let i=0;i<5;i++)moveActor(p,-Math.cos(ray.angle)*10,-Math.sin(ray.angle)*10);
  s.last={x:p.x,y:p.y};playSignatureAudio(123,true,ray.x,ray.y);
 }
 if(s.time+1e-8>=1.35){s.finished=true;return false;}return true;
};
const recoilVolleyPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{recoilVolleyPaintBase();const list=signatureRenderList(123);if(!list.length)return;for(const s of list){if(!recoilVolleyValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color;for(const ray of s.rays){if(s.time>=ray.until)continue;const end=echoVolleyEnd(ray);paintLinkLine(ray,end,color,8);paintLinkLine(ray,end,'#fff0cb',2);groundRing(ray.x,ray.y,18+20*(1-(ray.until-s.time)/.18),color,2);}if(s.ticks<3){const ray={x:p.x,y:p.y,angle:s.heading};paintLinkLine(ray,echoVolleyEnd(ray),color,1);}}};
const recoilVolleyStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===123?{label:'砲撃 '+s.ticks+'/3 · 次弾SP8',value:Math.min(1,s.time/1.1),waiting:s.ticks<3}:recoilVolleyStatusBase(s);
