const FOCUS_TRIPLET_SIGNATURE=['集光の三節',24,5,'0.5秒ごとに3回、自分から照準方向へ300先の焦点（半径45）だけを攻撃。手前の光路には攻撃判定がない。同じ敵を連続して焦点に捉えると60%→120%→240%。外した敵の連続数はリセット。移動と照準変更で間合いを合わせる。壁に遮られた焦点は不発。範囲補正は焦点の半径だけ。死亡・地域移動・壁越しの移動・1更新200超の瞬間移動で解除。再発動は置き換え。','M5 26H34M6 19L34 26L6 33M34 17A9 9 0 1 0 34 35A9 9 0 1 0 34 17M30 26H38M34 22V30'];
SIGNATURE_SKILLS.push(FOCUS_TRIPLET_SIGNATURE);Object.assign(GEM.crafted_11_2,{name:FOCUS_TRIPLET_SIGNATURE[0],cost:24,cool:5,desc:FOCUS_TRIPLET_SIGNATURE[3],ability:null,signature:122,tags:['spell','area']});
SIGNATURE_AUDIO.push(['focustriplet',750,.3]);SKILL_AUDIO_FAMILIES.metal.add('focustriplet');
function focusTripletValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0;}
function focusTripletPoint(s){return {x:p.x+Math.cos(s.heading)*300,y:p.y+Math.sin(s.heading)*300};}
const focusTripletCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{const result=focusTripletCastBase(build,...args);if(GEM[build.type]?.signature!==122)return result;const s=signatureSpells.at(-1);if(s?.mode!==122)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==122||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,target:null,heading:s.angle,ticks:0,streaks:new Map(),last:{x:p.x,y:p.y},flash:null});return result;};
const focusTripletStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==122)return focusTripletStepBase(s,dt);if(!focusTripletValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(dist(p,s.last)>200||!lineClear(s.last,p)){s.finished=true;return false;}s.last={x:p.x,y:p.y};s.time+=dt;
 const aim=unproject(mouse.x,mouse.y);if(dist(p,aim)>5)s.heading=Math.atan2(aim.y-p.y,aim.x-p.x);
 while(s.ticks<3&&s.time+1e-8>=(s.ticks+1)*.5){
  if(!focusTripletValid(s))return false;
  const point=focusTripletPoint(s),targets=lineClear(p,point)?enemies.filter(e=>e.hp>0&&dist(e,point)<=45*s.build.radius&&lineClear(point,e)&&lineClear(p,e)):[],previous=s.streaks;
  s.ticks++;s.streaks=new Map();s.flash={...point,origin:{x:p.x,y:p.y},until:s.ticks*.5+.15,level:0};
  for(const e of targets){if(!focusTripletValid(s))return false;if(e.hp<=0||!enemies.includes(e))continue;const streak=(previous.get(e)||0)+1;s.streaks.set(e,streak);s.flash.level=Math.max(s.flash.level,streak);spellHit(e,s.damage*.6*2**(streak-1),s.build);}
  playSignatureAudio(122,true,point.x,point.y);
 }
 if(s.time+1e-8>=1.7){s.finished=true;return false;}return true;
};
const focusTripletPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{focusTripletPaintBase();const list=signatureRenderList(122);if(!list.length)return;for(const s of list){if(!focusTripletValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color,point=focusTripletPoint(s);if(s.ticks<3){const end=echoVolleyEnd({x:p.x,y:p.y,angle:s.heading});const visible={x:p.x+(end.x-p.x)*Math.min(1,300/Math.max(1,dist(p,end))),y:p.y+(end.y-p.y)*Math.min(1,300/Math.max(1,dist(p,end)))};paintLinkLine(p,visible,color,1);if(lineClear(p,point)){groundRing(point.x,point.y,45*s.build.radius,color,2);boundarySigil(point,16,color,s.time,4);}}if(s.flash&&s.time<s.flash.until&&lineClear(s.flash.origin,s.flash)){paintLinkLine(s.flash.origin,s.flash,color,3+s.flash.level);groundRing(s.flash.x,s.flash.y,45*s.build.radius,'#fff2cf',2+s.flash.level);}}};
const focusTripletStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===122?{label:'集光 '+s.ticks+'/3 · 300先を狙う',value:Math.min(1,s.time/1.5),waiting:s.ticks<3}:focusTripletStatusBase(s);
