const TRIPLE_HARVEST_SIGNATURE=['三命の収穫',28,9,'0.4・0.95・1.5秒後、現在の照準へ長さ460・半幅18の光線を撃つ。各光線は最初の敵で止まり110%。3射で別々の討伐敵3体に実HPダメージを与えると、発動時の最大HP18%を一度だけ回復（現在のHP上限まで）。討伐した敵も数える。同じ敵への再命中・空振り・訓練標的では種類数が増えない。壁で遮られる。移動・照準で射線を変えられる。死亡・地域移動・壁越しの移動・1更新200超の瞬間移動で解除。再発動で記録を破棄。範囲補正は線幅だけ、属性と威力で回復量は変わらない。','M6 8H18V20H6ZM34 8H46V20H34ZM20 34H32V46H20ZM12 20L26 29L40 20M26 29V34M21 26H31M26 21V31'];
SIGNATURE_SKILLS.push(TRIPLE_HARVEST_SIGNATURE);Object.assign(GEM.crafted_11_4,{name:TRIPLE_HARVEST_SIGNATURE[0],cost:28,cool:9,desc:TRIPLE_HARVEST_SIGNATURE[3],ability:null,signature:124,tags:['spell','area']});
SIGNATURE_AUDIO.push(['tripleharvest',620,.3]);SKILL_AUDIO_FAMILIES.airy.add('tripleharvest');
function tripleHarvestValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0;}
function tripleHarvestTarget(ray,radius){const dx=Math.cos(ray.angle),dy=Math.sin(ray.angle);let target=null,nearest=Infinity;for(const e of enemies){if(!echoVolleyTouches(ray,e,radius))continue;const along=(e.x-ray.x)*dx+(e.y-ray.y)*dy;if(along<nearest){nearest=along;target=e;}}return target;}
const tripleHarvestCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{const result=tripleHarvestCastBase(build,...args);if(GEM[build.type]?.signature!==124)return result;const s=signatureSpells.at(-1);if(s?.mode!==124)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==124||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,target:null,heading:s.angle,ticks:0,targets:new Set(),heal:maxhp()*.18,healed:false,rays:[],last:{x:p.x,y:p.y}});return result;};
const tripleHarvestStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==124)return tripleHarvestStepBase(s,dt);if(!tripleHarvestValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(dist(p,s.last)>200||!lineClear(s.last,p)){s.finished=true;return false;}s.last={x:p.x,y:p.y};s.time+=dt;
 const aim=unproject(mouse.x,mouse.y);if(dist(p,aim)>5)s.heading=Math.atan2(aim.y-p.y,aim.x-p.x);
 while(s.ticks<3&&s.time+1e-8>=.4+s.ticks*.55){
  if(!tripleHarvestValid(s))return false;const ray={x:p.x,y:p.y,angle:s.heading,until:.4+s.ticks*.55+.2},e=tripleHarvestTarget(ray,s.build.radius);ray.end=e?{x:e.x,y:e.y}:echoVolleyEnd(ray);s.rays.push(ray);s.ticks++;
  if(e){const before=e.hp,eligible=!e.dummy&&!!SPECIES[e.species];spellHit(e,s.damage*1.1,s.build);if(!tripleHarvestValid(s))return false;if(eligible&&e.hp<before)s.targets.add(e);}
  if(s.ticks===3&&s.targets.size===3&&!s.healed){s.healed=true;const amount=Math.max(0,Math.min(s.heal,maxhp()-p.hp));p.hp+=amount;if(amount>0){burst(p.x,p.y,65,'#a4edd2');playSound('heal',p.x,p.y);}}
  playSignatureAudio(124,true,ray.x,ray.y);
 }
 if(s.time+1e-8>=1.75){s.finished=true;return false;}return true;
};
const tripleHarvestPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{tripleHarvestPaintBase();const list=signatureRenderList(124);if(!list.length)return;for(const s of list){if(!tripleHarvestValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color;for(const ray of s.rays){if(s.time>=ray.until||!lineClear(ray,ray.end))continue;paintLinkLine(ray,ray.end,color,6);paintLinkLine(ray,ray.end,'#d9ffe9',2);groundRing(ray.end.x,ray.end.y,14,color,2);}for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3;groundRing(p.x+Math.cos(a)*32,p.y+Math.sin(a)*32,5,i<s.targets.size?'#b5f5d8':'#506c66',2);}if(s.ticks<3){const ray={x:p.x,y:p.y,angle:s.heading},e=tripleHarvestTarget(ray,s.build.radius);paintLinkLine(ray,e||echoVolleyEnd(ray),color,1);}}};
const tripleHarvestStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===124?{label:'収穫 '+s.targets.size+'/3体 · 射撃 '+s.ticks+'/3',value:s.targets.size/3,waiting:s.ticks<3}:tripleHarvestStatusBase(s);
