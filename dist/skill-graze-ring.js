// A near miss rewards surviving a completed closest approach; it never blocks a shot.
const GRAZE_RING_SIGNATURE=['擦過の星環',24,8,'5秒間、直撃せずに半径70を通り過ぎた敵弾から星を蓄積（同じ弾は一度、最大3）。3つで周囲220へ450%の反撃。時間切れなら星1つにつき100%で反撃。無敵中・直撃弾・防壁で消した弾・反射済みの弾は対象外。範囲サポートは擦過範囲と反撃範囲に適用。再発動で蓄積を置き換える。','M12 14A18 18 0 1 0 42 35M26 5L29 12L36 14L29 17L26 24L23 17L16 14L23 12ZM6 30L12 34L6 38M39 39L45 43L39 47'];
SIGNATURE_SKILLS.push(GRAZE_RING_SIGNATURE);Object.assign(GEM.crafted_3_5,{name:GRAZE_RING_SIGNATURE[0],cost:24,cool:8,desc:GRAZE_RING_SIGNATURE[3],ability:null,signature:93,tags:['spell','area']});
SIGNATURE_AUDIO.push(['grazehalo',970,.26]);SKILL_AUDIO_FAMILIES.airy.add('grazehalo');
const grazeRingCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{let result=grazeRingCastBase(build,...args);if(GEM[build.type]?.signature!==93)return result;let s=signatureSpells.at(-1);if(s?.mode!==93)return result;signatureSpells=signatureSpells.filter(v=>v.mode!==93||v===s);Object.assign(s,{owner:p,charges:0,finished:false,grazeSeen:new WeakSet(),pulse:0});return result;};
function grazeClosestPass(from,to,player,radius){
 let dx=to.x-from.x,dy=to.y-from.y,len=dx*dx+dy*dy;if(!Number.isFinite(len)||len<=0)return false;
 let t=-((from.x-player.x)*dx+(from.y-player.y)*dy)/len;
 // Count on the outgoing side, not when a dangerous shot first enters the ring.
 if(t<0||t>=1)return false;
 let x=from.x+dx*t-player.x,y=from.y+dy*t-player.y,d2=x*x+y*y;
 return d2>ENEMY_PROJECTILE_HIT_RADIUS**2+1e-8&&d2<=radius*radius+1e-8;
}
function releaseGrazeRing(s){if(s.finished)return;s.finished=true;if(!s.charges)return;signatureArea(s,p,220,s.charges>=3?4.5:s.charges);playSignatureAudio(93,true,p.x,p.y);}
const grazeRingProjectileBase=advanceProjectile;advanceProjectile=(shot,dt)=>{
 let s=shot.enemy&&shot.life>0&&started&&!paused&&!dead&&p?.hp>0&&p.inv<=0&&Number.isFinite(dt)&&dt>0?signatureSpells.find(s=>s.mode===93&&s.owner===p&&!s.finished&&s.time<5):null;
 if(!s||s.grazeSeen.has(shot))return grazeRingProjectileBase(shot,dt);
 let from={x:shot.x,y:shot.y},player={x:p.x,y:p.y},result=grazeRingProjectileBase(shot,dt);
 // Inspect the actual surviving segment after walls, absorption and reflection resolve.
 if(shot.enemy&&shot.life>0&&s.owner===p&&!dead&&p.hp>0&&p.inv<=0&&signatureSpells.includes(s)&&grazeClosestPass(from,shot,player,70*s.build.radius)){
  s.grazeSeen.add(shot);s.charges++;s.pulse=.3;playSignatureAudio(93,false,p.x,p.y);burst(p.x,p.y,24,ELEMENTS[s.build.elements[0]].color);if(s.charges>=3)releaseGrazeRing(s);
 }
 return result;
};
const grazeRingStepBase=stepSignature;stepSignature=(s,dt)=>{if(s.mode!==93)return grazeRingStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p||s.finished)return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;s.time=Math.round((s.time+dt)*1e6)/1e6;s.pulse=Math.max(0,s.pulse-dt);if(s.time>=5){releaseGrazeRing(s);return false;}return true;};
const grazeRingPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 grazeRingPaintBase();for(let s of signatureSpells){if(s.mode!==93||s.owner!==p||s.finished||!visibleAt(p.x,p.y))continue;let color=ELEMENTS[s.build.elements[0]].color;groundRing(p.x,p.y,70*s.build.radius,color,s.pulse?3:1);let q=project(p.x,p.y);ctx.save();for(let i=0;i<3;i++){let x=q.x+(i-1)*18,y=q.y-101;ctx.strokeStyle=i<s.charges?'#ffe6a5':'#74828e';ctx.fillStyle=i<s.charges?'#ffe6a5':'#14212a';ctx.lineWidth=1.5;ctx.beginPath();for(let k=0;k<8;k++){let a=k*Math.PI/4-Math.PI/2,r=k%2?2:6,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(k)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();}
};
const grazeRingStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===93?(s.finished?null:{label:'擦過 '+s.charges+'/3 · '+Math.max(0,5-s.time).toFixed(1)+'秒',value:s.charges/3,waiting:true}):grazeRingStatusBase(s);
