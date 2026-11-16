const MELEE_SIGNATURES=[
 ['流星踏破',22,3,'0.3秒で前方240へ踏み込み、通過した敵を一度ずつ180%で斬る。壁は越えられず、無敵時間はない。','M8 42L42 8M8 30L30 8M28 8H43V23M8 49H25'],
 ['燕返し',20,3.5,'前方160を130%で斬り、0.2秒で後方160へ退く。発動時に0.18秒の無敵。','M8 20Q30 5 44 26M42 35H14M23 27L14 35L23 43'],
 ['鏡の構え',25,5,'0.8秒以内の最初の一撃を75%軽減し、周囲140へ250%の反撃。攻撃されなければ反撃しない。','M14 10H38V31L26 45L14 31ZM26 16V34M20 23H32'],
 ['断罪の一閃',24,4,'0.35秒後に前方190を150%で斬る。残りHP30%以下には300%。この一撃の討伐1体につきマナ5回復（最大15）。','M9 43L42 10M32 10H42V20M14 13L23 22M9 18L18 27'],
 ['双震の鉄槌',28,4.5,'0.45秒後に周囲120へ180%、0.9秒後に周囲240へ80%の衝撃。各衝撃はその時の自分を中心に発生。','M14 9H38V22H14ZM26 22V44M8 38Q26 49 44 38'],
 ['決闘の連牙',26,3.5,'照準付近の敵1体へ0.12秒ごとに5連撃、各55%。その敵が自分から220以上離れるか壁に隠れると終了。','M8 43L35 16M15 46L42 19M22 48L49 21M12 12L20 20'],
 ['残影の返刃',23,3.8,'前方180を120%で斬り、0.8秒後に発動地点の残像が同じ向きへ180%で斬る。移動しても残像の位置は変わらない。','M10 37Q12 8 36 12M20 45Q22 16 46 20M8 44L43 9'],
 ['引潮の大剣',30,5,'前方160の地点へ周囲240の敵を4回吸引（各30、ボス20%）。0.6秒後、発動地点から長さ300・幅90へ260%の一撃。','M8 42L43 7M9 15L19 25L9 35M44 21L34 31L44 41']
];
for(let [i,row]of MELEE_SIGNATURES.entries()){
 let [name,cost,cool,desc]=row,id='crafted_20_'+i;SIGNATURE_SKILLS.push(row);
 Object.assign(GEM[id],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS[id]].name+'属性。',ability:null,signature:16+i,tags:['attack','area']});
}
function meleeTargets(center,angle,range,radius=1,cone=true){return enemies.filter(e=>e.hp>0&&dist(center,e)<=range*radius&&(!cone||Math.cos(Math.atan2(e.y-center.y,e.x-center.x)-angle)>.2)&&lineClear(center,e));}
function signatureSlash(s,center,range,power){let targets=meleeTargets(center,s.angle,range,s.build.radius);for(let e of targets)spellHit(e,s.damage*power,s.build);deluxeFX.push({type:'slash',x:center.x,y:center.y,r:range*s.build.radius,angle:s.angle,time:0,duration:.35,color:ELEMENTS[s.build.elements[0]].color});return targets;}
const meleeSignatureCast=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let mode=GEM[build.type]?.signature;if(mode===undefined||mode<16)return meleeSignatureCast(build,damage,angle);
 // Create the common state without running projectile-specific initialization.
 earlySignatureCast(build,damage,angle);let s=signatureSpells.at(-1);if(!s||s.mode!==mode)return;
 s.aim={x:s.x,y:s.y};s.x=p.x;s.y=p.y;s.previous={x:p.x,y:p.y};s.next=mode===21?.12:mode===23?.1:.45;s.triggered=false;
 if(mode===16||mode===17){route=[];moveGoal=null;attackTarget=null;}
 if(mode===17){signatureSlash(s,s.origin,160,1.3);p.inv=Math.max(p.inv||0,.18);}
 if(mode===21){s.target=meleeTargets(p,angle,220,1,false).sort((a,b)=>dist(a,s.aim)-dist(b,s.aim))[0];if(!s.target){signatureSpells.pop();say('近くに決闘の対象がいません');}}
 if(mode===22)signatureSlash(s,s.origin,180,1.2);
 if(mode===23){s.x=s.origin.x+Math.cos(angle)*160;s.y=s.origin.y+Math.sin(angle)*160;}
 playSound('slash',p.x,p.y);
};
const meleeSignatureStep=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode<16)return meleeSignatureStep(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;
 if(s.mode===16||s.mode===17){
  let sign=s.mode===17?-1:1,from={x:p.x,y:p.y};moveActor(p,Math.cos(s.angle)*800*dt*sign,Math.sin(s.angle)*800*dt*sign);s.x=p.x;s.y=p.y;
  if(s.mode===16)for(let e of enemies)if(e.hp>0&&!s.seen.has(e)&&projectileContact(from,p,e,45*s.build.radius)!==null&&lineClear(from,e)){s.seen.add(e);spellHit(e,s.damage*1.8,s.build);}
  return s.time<(s.mode===16?.3:.2)&&dist(from,p)>.1;
 }
 if(s.mode===18){s.x=p.x;s.y=p.y;return !s.triggered&&s.time<.8;}
 if(s.mode===19){if(s.time<.35)return true;let restored=0;for(let e of meleeTargets(p,s.angle,190,s.build.radius)){spellHit(e,s.damage*(e.hp/e.max<=.3?3:1.5),s.build);if(e.hp<=0)restored+=5;}p.mp=Math.min(100,p.mp+Math.min(15,restored));burst(p.x,p.y,190*s.build.radius,ELEMENTS[s.build.elements[0]].color);return false;}
 if(s.mode===20){s.x=p.x;s.y=p.y;if(s.time>=s.next){signatureArea(s,p,s.ticks?240:120,s.ticks?.8:1.8);s.ticks++;s.next=.9;}return s.ticks<2;}
 if(s.mode===21){if(!s.target||s.target.hp<=0||dist(p,s.target)>220||!lineClear(p,s.target))return false;s.x=s.target.x;s.y=s.target.y;if(s.time+1e-8>=s.next){spellHit(s.target,s.damage*.55,s.build);burst(s.x,s.y,30,ELEMENTS[s.build.elements[0]].color);s.next+=.12;s.ticks++;}return s.ticks<5;}
 if(s.mode===22){if(s.time<.8)return true;signatureSlash(s,s.origin,180,1.8);return false;}
 if(s.mode===23){
  if(s.ticks<4&&s.time+1e-8>=s.next){for(let e of meleeTargets(s,0,240,s.build.radius,false)){let dx=s.x-e.x,dy=s.y-e.y,len=Math.hypot(dx,dy),amount=Math.min(30,Math.max(0,len-25))*(e.boss?.2:1);if(len>0)moveActor(e,dx/len*amount,dy/len*amount,12);}s.ticks++;s.next+=.1;}
  if(s.time<.6)return true;
  for(let e of enemies){let dx=e.x-s.origin.x,dy=e.y-s.origin.y,x=dx*Math.cos(s.angle)+dy*Math.sin(s.angle),y=-dx*Math.sin(s.angle)+dy*Math.cos(s.angle);if(e.hp>0&&x>=0&&x<=300*s.build.radius&&Math.abs(y)<=45*s.build.radius&&lineClear(s.origin,e))spellHit(e,s.damage*2.6,s.build);}
  burst(s.x,s.y,90,ELEMENTS[s.build.elements[0]].color);return false;
 }
 return false;
};
const meleeHurtBase=hurt;hurt=damage=>{
 let parry=started&&!paused&&!dead&&p.inv<=0&&Number.isFinite(damage)&&damage>0?signatureSpells.find(s=>s.mode===18&&!s.triggered&&s.time<.8):null;
 if(!parry)return meleeHurtBase(damage);
 parry.triggered=true;meleeHurtBase(damage*.25);if(!dead)signatureArea(parry,p,140,2.5);
};
const meleeSignaturePaint=paintSignatureSpells;paintSignatureSpells=()=>{
 meleeSignaturePaint();const renderList=signatureRenderList(16,23);if(!renderList.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of renderList){if(s.mode<16||s.mode>=24||!visibleAt(s.x,s.y))continue;let color=ELEMENTS[s.build.elements[0]].color;
  if(s.mode===18){groundRing(p.x,p.y,70,color,4);groundRing(p.x,p.y,80,'#fff0d6',1);}
  else if(s.mode===20)groundRing(p.x,p.y,(s.ticks?240:120)*s.build.radius,color,2);
  else if(s.mode===23){groundRing(s.x,s.y,240*s.build.radius,color,1);for(let n=0;n<6;n++){let a=n*Math.PI/3,rr=200*(1-(s.time%.1)/.1);glowAt(project(s.x+Math.cos(a)*rr,s.y+Math.sin(a)*rr),12,color,.5);}}
  else if(s.mode===16||s.mode===17){groundRing(p.x,p.y,45,color,2);let a=project(s.origin.x,s.origin.y),b=project(p.x,p.y);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  else{let range=s.mode===19?190:s.mode===22?180:35;ringPoints(s.x,s.y,range*s.build.radius,s.angle-1.2,s.angle+1.2);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();}
 }
 ctx.restore();
};
