const THREE_SIDES_SIGNATURE=['三方封殺',30,10,'6秒間、1秒ごとに現在の照準へ長さ460・半幅18の光線を放つ（最大6射）。各射は最初の敵へ70%。敵から見た射撃起点を記録し、過去の起点と角度が60度以上離れた方向だけを追加する。同じ敵に3方向から命中すると、その敵へ350%の追撃を一度だけ行う。敵ごとに記録。敵と起点の距離60未満では方向を記録しない。壁で遮られ、範囲補正は線幅のみ。死亡・地域移動・壁越しの移動・1更新200超の瞬間移動で解除。再発動は記録を破棄。','M26 5L46 40H6ZM26 15V25M14 35L23 29M38 35L29 29'];
SIGNATURE_SKILLS.push(THREE_SIDES_SIGNATURE);Object.assign(GEM.crafted_11_5,{name:THREE_SIDES_SIGNATURE[0],cost:30,cool:10,desc:THREE_SIDES_SIGNATURE[3],ability:null,signature:125,tags:['spell','area']});
SIGNATURE_AUDIO.push(['threesides',490,.3]);SKILL_AUDIO_FAMILIES.metal.add('threesides');
function threeSidesValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0;}
function threeSidesSeparated(a,b){return Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))+1e-8>=Math.PI/3;}
const threeSidesCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{const result=threeSidesCastBase(build,...args);if(GEM[build.type]?.signature!==125)return result;const s=signatureSpells.at(-1);if(s?.mode!==125)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==125||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,target:null,heading:s.angle,ticks:0,marks:new Map(),rays:[],last:{x:p.x,y:p.y}});return result;};
const threeSidesStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==125)return threeSidesStepBase(s,dt);if(!threeSidesValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(dist(p,s.last)>200||!lineClear(s.last,p)){s.finished=true;return false;}s.last={x:p.x,y:p.y};s.time+=dt;const aim=unproject(mouse.x,mouse.y);if(dist(p,aim)>5)s.heading=Math.atan2(aim.y-p.y,aim.x-p.x);
 for(const [e] of s.marks)if(e.hp<=0||!enemies.includes(e))s.marks.delete(e);
 while(s.ticks<6&&s.time+1e-8>=s.ticks+1){
  if(!threeSidesValid(s))return false;const ray={x:p.x,y:p.y,angle:s.heading,until:s.ticks+1.2},e=tripleHarvestTarget(ray,s.build.radius);ray.end=e?{x:e.x,y:e.y}:echoVolleyEnd(ray);s.rays.push(ray);s.ticks++;
  if(e){const before=e.hp,a=Math.atan2(ray.y-e.y,ray.x-e.x),range=dist(ray,e);spellHit(e,s.damage*.7,s.build);if(!threeSidesValid(s))return false;
   if(e.hp>0&&e.hp<before&&enemies.includes(e)&&range>=60){let m=s.marks.get(e);if(!m){m={angles:[],done:false};s.marks.set(e,m);}if(!m.done&&m.angles.every(b=>threeSidesSeparated(a,b))){m.angles.push(a);if(m.angles.length===3){m.done=true;spellHit(e,s.damage*3.5,s.build);if(!threeSidesValid(s))return false;burst(e.x,e.y,60,ELEMENTS[s.build.elements[0]].color);}}}
  }playSignatureAudio(125,true,ray.x,ray.y);
 }if(s.time+1e-8>=6.25){s.finished=true;return false;}return true;
};
const threeSidesPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{threeSidesPaintBase();for(const s of signatureRenderList(125)){if(!threeSidesValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color;for(const ray of s.rays){if(s.time>=ray.until||!lineClear(ray,ray.end))continue;paintLinkLine(ray,ray.end,color,5);paintLinkLine(ray,ray.end,'#fff3da',2);}for(const [e,m] of s.marks){if(e.hp<=0||!visibleAt(e.x,e.y))continue;for(const a of m.angles)groundRing(e.x+Math.cos(a)*40,e.y+Math.sin(a)*40,6,m.done?'#fff3da':color,2);}}};
const threeSidesStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===125?{label:'三方封殺 '+s.ticks+'/6射',value:s.ticks/6,waiting:s.ticks<6}:threeSidesStatusBase(s);
