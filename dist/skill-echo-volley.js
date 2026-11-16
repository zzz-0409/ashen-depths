const ECHO_VOLLEY_SIGNATURE=['残照の斉射',28,6,'発動時・0.5秒後・1秒後の自分の位置と照準方向を記録し、1.5秒後に3本の光線を同時に放つ。各光線は長さ460・半幅18で120%、重なれば同じ敵に最大3回。記録済みの射線は追従しない。移動して射点を分けたり、同じ敵へ収束させられる。壁で遮られ、自分から500超か壁越しになった射点は消える。死亡・地域移動・壁越しの移動・1更新200超の瞬間移動で全解除。再発動は置き換え。範囲補正は線幅だけ。','M7 12L41 24M7 26H41M7 40L41 28M3 8H11V16H3ZM3 22H11V30H3ZM3 36H11V44H3ZM35 20L45 26L35 32'];
SIGNATURE_SKILLS.push(ECHO_VOLLEY_SIGNATURE);Object.assign(GEM.crafted_11_1,{name:ECHO_VOLLEY_SIGNATURE[0],cost:28,cool:6,desc:ECHO_VOLLEY_SIGNATURE[3],ability:null,signature:121,tags:['spell','area']});
SIGNATURE_AUDIO.push(['echovolley',670,.3]);SKILL_AUDIO_FAMILIES.metal.add('echovolley');
function echoVolleyValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0;}
function echoVolleyRecord(s){s.rays.push({x:p.x,y:p.y,angle:s.heading,lost:false});}
function echoVolleyEnd(r){const at=d=>({x:r.x+Math.cos(r.angle)*d,y:r.y+Math.sin(r.angle)*d}),end=at(460);if(lineClear(r,end))return end;let low=0,high=460;for(let i=0;i<9;i++){const middle=(low+high)/2;if(lineClear(r,at(middle)))low=middle;else high=middle;}return at(low);}
function echoVolleyTouches(r,e,radius){const dx=e.x-r.x,dy=e.y-r.y,along=dx*Math.cos(r.angle)+dy*Math.sin(r.angle);return e.hp>0&&along>=0&&along<=460&&Math.abs(dx*Math.sin(r.angle)-dy*Math.cos(r.angle))<=18*radius&&lineClear(r,e);}
const echoVolleyCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{const result=echoVolleyCastBase(build,...args);if(GEM[build.type]?.signature!==121)return result;const s=signatureSpells.at(-1);if(s?.mode!==121)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==121||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,fired:false,target:null,heading:s.angle,rays:[],last:{x:p.x,y:p.y}});echoVolleyRecord(s);return result;};
const echoVolleyStepBase=stepSignature;
stepSignature=(s,dt)=>{if(s.mode!==121)return echoVolleyStepBase(s,dt);if(!echoVolleyValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;if(dist(p,s.last)>200||!lineClear(s.last,p)){s.finished=true;return false;}s.last={x:p.x,y:p.y};s.time+=dt;
 const aim=unproject(mouse.x,mouse.y);if(dist(p,aim)>5)s.heading=Math.atan2(aim.y-p.y,aim.x-p.x);while(s.rays.length<3&&s.time+1e-8>=s.rays.length*.5)echoVolleyRecord(s);
 for(const r of s.rays)if(!r.lost&&(dist(p,r)>500||!lineClear(p,r)))r.lost=true;
 if(!s.fired&&s.time+1e-8>=1.5){s.fired=true;for(const r of s.rays){if(r.lost)continue;const targets=enemies.filter(e=>echoVolleyTouches(r,e,s.build.radius));for(const e of targets){if(!echoVolleyValid(s))return false;if(e.hp>0&&enemies.includes(e))spellHit(e,s.damage*1.2,s.build);}playSignatureAudio(121,true,r.x,r.y);}}
 if(s.time+1e-8>=1.8){s.finished=true;return false;}return true;};
const echoVolleyPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{echoVolleyPaintBase();const list=signatureRenderList(121);if(!list.length)return;for(const s of list){if(!echoVolleyValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color;for(const r of s.rays){if(r.lost)continue;const end=echoVolleyEnd(r);groundRing(r.x,r.y,16,'#ffe4b8',2);boundarySigil(r,12,color,s.time,4);paintLinkLine(r,end,color,s.fired?7:1);if(s.fired)paintLinkLine(r,end,'#fff4d2',2);}}};
const echoVolleyStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===121?{label:s.fired?'斉射':('射線 '+s.rays.filter(r=>!r.lost).length+'/3 · 移動と照準で記録'),value:Math.min(1,s.time/1.5),waiting:!s.fired}:echoVolleyStatusBase(s);
