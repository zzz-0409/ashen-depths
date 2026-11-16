const FORECAST_STAR_SIGNATURE=['先読みの星撃',26,7,'照準付近の敵1体の移動を0.6秒観測し、平均速度で0.8秒後に進む地点を予測（対象から最大180先）。そこで着弾地点を固定し、0.8秒後に半径90へ450%。固定後は追尾せず、対象が倒れても爆発する。壁の手前で予測を止める。観測中の対象消失・射程500超・壁、または自分の死亡・地域移動で解除。固定後も地点から500超・壁で解除。範囲補正は爆発半径のみ。再発動で置き換える。','M8 39L20 27L32 15M26 15H32V21M36 24L40 32L48 36L40 40L36 48L32 40L24 36L32 32ZM7 12H17M12 7V17'];
SIGNATURE_SKILLS.push(FORECAST_STAR_SIGNATURE);Object.assign(GEM.crafted_12_2,{name:FORECAST_STAR_SIGNATURE[0],cost:26,cool:7,desc:FORECAST_STAR_SIGNATURE[3],ability:null,signature:130,tags:['spell','area']});
SIGNATURE_AUDIO.push(['forecaststar',560,.3]);SKILL_AUDIO_FAMILIES.metal.add('forecaststar');
function forecastStarValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0;}
function forecastStarPoint(s,position,elapsed){
 const dx=position.x-s.start.x,dy=position.y-s.start.y,length=Math.hypot(dx,dy),distance=Math.min(180,length*.8/Math.max(.001,elapsed));
 if(!length)return {x:position.x,y:position.y};
 // Walk the prediction ray, stopping before the first obstruction rather than jumping over it.
 let end={x:position.x,y:position.y};for(let d=5;d<distance+5;d+=5){const next={x:position.x+dx/length*Math.min(d,distance),y:position.y+dy/length*Math.min(d,distance)};if(!lineClear(position,next))break;end=next;}return end;
}
const forecastStarCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 const result=forecastStarCastBase(build,...args);if(GEM[build.type]?.signature!==130)return result;const s=signatureSpells.at(-1);if(s?.mode!==130)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==130||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,locked:false,start:s.target?{x:s.target.x,y:s.target.y}:null,lastTarget:s.target?{x:s.target.x,y:s.target.y}:null});
 if(!s.target){s.finished=true;say('照準の近くに敵がいません');}return result;
};
const forecastStarStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==130)return forecastStarStepBase(s,dt);if(!forecastStarValid(s))return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(!s.locked){const e=s.target;if(!e||e.hp<=0||!enemies.includes(e)||dist(p,e)>500||!lineClear(p,e)){s.finished=true;return false;}
  const before=s.time;s.time+=dt;if(s.time+1e-8>=.6){const portion=Math.min(1,Math.max(0,(.6-before)/dt)),sample={x:s.lastTarget.x+(e.x-s.lastTarget.x)*portion,y:s.lastTarget.y+(e.y-s.lastTarget.y)*portion};Object.assign(s,forecastStarPoint(s,sample,.6));s.locked=true;s.target=null;playSignatureAudio(130,true,s.x,s.y);}s.lastTarget={x:e.x,y:e.y};
 }else s.time+=dt;
 if(s.locked){if(dist(p,s)>500||!lineClear(p,s)){s.finished=true;return false;}if(s.time+1e-8>=1.4){s.finished=true;signatureArea(s,s,90,4.5);playSignatureAudio(130,true,s.x,s.y);return false;}}
 return true;
};
const forecastStarPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{forecastStarPaintBase();for(const s of signatureRenderList(130)){if(!forecastStarValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color;if(!s.locked){const e=s.target;if(!e||e.hp<=0)continue;const point=forecastStarPoint(s,e,Math.max(.05,s.time));groundRing(e.x,e.y,25,'#bcefff',2);paintLinkLine(e,point,'#bcefff',1);groundRing(point.x,point.y,90*s.build.radius,'#728b99',1);}else{const t=Math.max(0,Math.min(1,(s.time-.6)/.8));groundRing(s.x,s.y,90*s.build.radius,color,3);groundRing(s.x,s.y,90*s.build.radius*(1-t),'#fff2ce',2);const q=project(s.x,s.y);ctx.save();ctx.strokeStyle='#fff2ce';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(q.x-90*(1-t),q.y-170*(1-t));ctx.lineTo(q.x,q.y);ctx.stroke();ctx.restore();}}};
const forecastStarStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===130?{label:s.locked?'地点固定 · 着弾まで'+Math.max(0,1.4-s.time).toFixed(1)+'秒':'移動を観測中',value:Math.min(1,s.time/1.4),waiting:true}:forecastStarStatusBase(s);
