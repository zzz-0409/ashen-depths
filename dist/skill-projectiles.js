// Eight early recipes with distinct projectile/placement rules, retaining save IDs.
const EARLY_SIGNATURES=[
 ['貫く星針',14,1.2,'直線を貫く高速弾。射程630、命中した敵それぞれに140%。敵を一直線に並べて撃つ。','M8 44L44 8M32 8H44V20M14 18H21M31 34H38'],
 ['追い風の灯',17,2,'照準付近の敵を追う誘導弾。150%の一撃。旋回には限度があり、壁に当たると消える。','M9 40Q45 46 40 15M32 20L40 9L47 20M10 31H18'],
 ['渡り鳥の刃',20,2.8,'敵に当たると220以内の別の敵へ向かう跳弾。最大4体、各90%。同じ敵には戻らない。','M7 38L20 13L32 37L46 12M15 13H25M41 12H51'],
 ['砕ける星核',22,3,'最初の命中は100%。そこで5方向へ破片が散り、別の敵へ各45%。破片は最初の敵に当たらない。','M8 44L25 27M25 27L20 8M25 27L40 10M25 27L48 28M25 27L40 44'],
 ['結界の綱',24,4.5,'狙った地点と自分を3秒つなぐ光線。0.5秒ごとに線上の敵へ35%。動いて線を敵に重ねる。壁で遮られる。','M9 40L42 13M5 36L13 44M38 9L46 17M15 21L21 27M29 29L35 35'],
 ['見張りの石柱',26,6,'狙った地点に砲台を設置。1秒ごとに360以内の敵へ80%の弾を撃つ（4回）。照準後の弾は直進する。','M17 44V23L26 12L35 23V44ZM12 44H40M26 24L45 16'],
 ['旅する灯台',25,5,'自分に追従する灯台を3秒召喚。0.5秒ごとに300以内の敵へ40%の弾を撃つ（6回）。','M12 35L20 19L28 35ZM34 13V32M29 18L34 12L39 18M9 43H37'],
 ['引き寄せる鉤',18,3,'直進する鉤が最初の敵に120%。自分へ最大180引き寄せ、0.5秒拘束。ボスへの移動量は20%、拘束は半分。','M10 42L35 17M30 8L43 9L44 22L35 29L28 25']
];
for(let [i,row]of EARLY_SIGNATURES.entries()){
 let [name,cost,cool,desc]=row,id='crafted_0_'+i;SIGNATURE_SKILLS.push(row);
 Object.assign(GEM[id],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS[id]].name+'属性。',ability:null,signature:8+i,tags:['spell',i===4?'area':'projectile']});
}
function signatureBolt(s,origin,angle,power=1,kind='plain',exclude){
 let bolt={x:origin.x,y:origin.y,angle,age:0,life:kind==='pierce'?.9:kind==='fragment'?.7:2.5,speed:kind==='pierce'?700:kind==='seeker'?290:kind==='fragment'?360:480,power,kind,seen:new Set(exclude?[exclude]:[]),target:s.target,trail:[]};s.bolts.push(bolt);return bolt;
}
function signatureVolley(s,origin,angle,power,kind){let count=s.build.supports.includes('multi')?3:1;for(let i=0;i<count;i++)signatureBolt(s,origin,angle+(i-(count-1)/2)*.24,power,kind);}
const earlySignatureCast=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let mode=GEM[build.type]?.signature;if(mode===undefined||mode<8)return earlySignatureCast(build,damage,angle);
 earlySignatureCast(build,damage,angle);let s=signatureSpells.at(-1);if(!s||s.mode!==mode)return;
 s.bolts=[];s.next=mode===13?1:.5;s.spawn={x:s.x,y:s.y};
 if(mode===12||mode===13)return;
 s.x=p.x;s.y=p.y;
 if(mode===14)return;
 let [kind,power]=mode===8?['pierce',1.4]:mode===9?['seeker',1.5]:mode===10?['ricochet',.9]:mode===11?['split',1]:['hook',1.2];
 signatureVolley(s,s.origin,angle,power,kind);
};
function nextSignatureTarget(from,range,excluded=new Set()){
 return enemies.filter(e=>e.hp>0&&!excluded.has(e)&&dist(from,e)<=range&&lineClear(from,e)).sort((a,b)=>dist(a,from)-dist(b,from))[0];
}
function stepSignatureBolt(s,bolt,dt){
 bolt.age+=dt;if(bolt.age>bolt.life)return false;
 if(bolt.kind==='seeker'||bolt.kind==='ricochet'&&bolt.seen.size){
  if(!bolt.target||bolt.target.hp<=0||bolt.seen.has(bolt.target)||!lineClear(bolt,bolt.target))bolt.target=nextSignatureTarget(bolt,bolt.kind==='ricochet'?220:500,bolt.seen);
  if(bolt.target){let aim=Math.atan2(bolt.target.y-bolt.y,bolt.target.x-bolt.x),delta=Math.atan2(Math.sin(aim-bolt.angle),Math.cos(aim-bolt.angle));bolt.angle+=clamp(delta,-5*dt,5*dt);}
 }
 let from={x:bolt.x,y:bolt.y},end={x:bolt.x+Math.cos(bolt.angle)*bolt.speed*dt,y:bolt.y+Math.sin(bolt.angle)*bolt.speed*dt};
 let contacts=enemies.filter(e=>e.hp>0&&!bolt.seen.has(e)).map(e=>({e,t:projectileContact(from,end,e,enemyHitRadius(e))})).filter(v=>v.t!==null).sort((a,b)=>a.t-b.t);
 for(let {e,t}of contacts){let point={x:from.x+(end.x-from.x)*t,y:from.y+(end.y-from.y)*t};if(!lineClear(from,point))return false;bolt.seen.add(e);spellHit(e,s.damage*bolt.power,s.build);burst(point.x,point.y,22,ELEMENTS[s.build.elements[0]].color);
  if(bolt.kind==='pierce')continue;
  if(bolt.kind==='split'){for(let n=0;n<5;n++)signatureBolt(s,point,bolt.angle+n*Math.PI*2/5,.45,'fragment',e);return false;}
  if(bolt.kind==='hook'&&e.hp>0){let dx=p.x-e.x,dy=p.y-e.y,len=Math.hypot(dx,dy),amount=Math.min(180,Math.max(0,len-35))*(e.boss?.2:1);if(len>0)moveActor(e,dx/len*amount,dy/len*amount,12);e.reactionStun=Math.max(e.reactionStun||0,e.boss?.25:.5);}
  if(bolt.kind==='ricochet'&&bolt.seen.size<4){bolt.x=point.x;bolt.y=point.y;bolt.target=nextSignatureTarget(e,220,bolt.seen);if(!bolt.target)return false;bolt.angle=Math.atan2(bolt.target.y-bolt.y,bolt.target.x-bolt.x);return true;}
  return false;
 }
 if(!lineClear(from,end))return false;
 bolt.trail.push(from);if(bolt.trail.length>10)bolt.trail.shift();bolt.x=end.x;bolt.y=end.y;return true;
}
const earlySignatureStep=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode<8)return earlySignatureStep(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;
 if(s.mode===12){
  if(s.time+1e-8>=s.next){s.next+=.5;s.ticks++;let dx=s.x-p.x,dy=s.y-p.y,len2=dx*dx+dy*dy;if(len2&&lineClear(p,s))for(let e of enemies){let t=clamp(((e.x-p.x)*dx+(e.y-p.y)*dy)/len2,0,1),point={x:p.x+dx*t,y:p.y+dy*t};if(e.hp>0&&dist(point,e)<=22*s.build.radius&&lineClear(point,e))spellHit(e,s.damage*.35,s.build);}}
  return s.time<3;
 }
 if(s.mode===13||s.mode===14){
  if(s.mode===14&&s.time<=3){s.x=p.x;s.y=p.y;}
  let limit=s.mode===13?4:6;if(s.ticks<limit&&s.time+1e-8>=s.next){s.ticks++;s.next+=s.mode===13?1:.5;let e=nextSignatureTarget(s,s.mode===13?360:300);if(e)signatureVolley(s,s,Math.atan2(e.y-s.y,e.x-s.x),s.mode===13?.8:.4,'plain');}
 }
 let active=[];for(let bolt of [...s.bolts])if(stepSignatureBolt(s,bolt,dt))active.push(bolt);
 // Splinters created during impact start moving on the next simulation step.
 let spawned=s.bolts.filter(b=>b.age===0);s.bolts=[...active,...spawned];
 if(s.mode===13||s.mode===14)return s.ticks<(s.mode===13?4:6)||s.bolts.length>0;
 return s.bolts.length>0;
};
const earlySignaturePaint=paintSignatureSpells;paintSignatureSpells=()=>{
 earlySignaturePaint();const renderList=signatureRenderList(8,15);if(!renderList.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of renderList){if(s.mode<8||s.mode>=16)continue;let color=ELEMENTS[s.build.elements[0]].color;
  if(s.mode===12&&lineClear(p,s)){let a=project(p.x,p.y),b=project(s.x,s.y);ctx.beginPath();ctx.moveTo(a.x,a.y-15);ctx.lineTo(b.x,b.y-15);ctx.strokeStyle=color;ctx.lineWidth=4;ctx.stroke();groundRing(s.x,s.y,24,color,2);}
  if((s.mode===13&&s.time<=4||s.mode===14&&s.time<=3)&&visibleAt(s.x,s.y)){let pos=project(s.x,s.y);groundRing(s.x,s.y,30,color,2);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pos.x-13,pos.y);ctx.lineTo(pos.x,pos.y-(s.mode===13?60:90));ctx.lineTo(pos.x+13,pos.y);ctx.stroke();glowAt({x:pos.x,y:pos.y-(s.mode===13?55:85)},20,color,.7);}
  for(let b of s.bolts){if(!visibleAt(b.x,b.y))continue;let pos=project(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=b.kind==='pierce'?4:2;ctx.beginPath();b.trail.forEach((v,i)=>{let q=project(v.x,v.y);i?ctx.lineTo(q.x,q.y-12):ctx.moveTo(q.x,q.y-12)});ctx.lineTo(pos.x,pos.y-12);ctx.stroke();glowAt({x:pos.x,y:pos.y-12},b.kind==='fragment'?12:23,color,.7);circle(pos.x,pos.y-12,3,'#fff9e8');}
 }
 ctx.restore();
};
