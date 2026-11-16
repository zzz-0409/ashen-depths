const TACTIC_SIGNATURES=[
 ['双刃の挟撃',25,4,'狙った地点の両側180から2枚の刃が1.2秒で収束。各刃は幅180、触れた敵へ一度ずつ130%。中央へ誘導すると両方が命中する。','M5 9L17 26L5 43M47 9L35 26L47 43M17 26H35'],
 ['解ける螺旋',27,5,'狙った地点の周囲を刃が3秒で2周。半径40から220へ広がり、触れた敵へ一度だけ280%。壁の向こうには当たらない。','M26 26Q15 15 14 28Q17 44 33 39Q49 32 39 14Q28 0 11 13M8 7L11 13L18 10'],
 ['足跡の葬列',28,5,'敵1体の位置を0.4秒ごとに3回記録。1.8秒後から0.3秒間隔で、記録した各地点の半径70へ120%。記録後に敵が倒れても残った印は爆発する。','M8 12H18V22H8ZM21 25H31V35H21ZM34 38H44V48H34ZM13 22L26 25M26 35L39 38'],
 ['構え崩しの刻印',22,4,'敵1体を6秒監視。次に新しい攻撃の構えを始めた瞬間に250%、0.4秒足止め（ボス0.15秒）。既に始めている攻撃には反応しない。壁に隠れると解除。','M26 6L42 14V29L26 46L10 29V14ZM17 17L35 35M35 17L17 35'],
 ['余剰魔力の奔流',22,4.5,'通常消費後の残りマナを最大30追加消費。0.6秒後、狙った地点の半径120へ80%＋追加消費1につき8%（最大320%）。追加マナが0でも発動する。消費後に回復しても威力は変わらない。血の契り中も追加分はマナで払う。','M11 9H41L36 34L26 46L16 34ZM16 20H36M26 12V34M21 29L26 34L31 29'],
 ['逆風の鏡',27,6,'狙った地点に半径120の鏡を3秒設置。敵弾を最大3発、元の進行方向の逆へ返す。返した弾はスキル威力160%、このジェムの属性で攻撃。近接攻撃は防げない。','M26 6V46M18 10L10 26L18 42M34 10L42 26L34 42M6 26H18M34 26H46'],
 ['回廊の跳弾',24,4,'足元から秒速320の弾を4秒放つ。壁で最大3回反射し、各区間で同じ敵へ一度ずつ110%。4回目の壁で消滅。狭い通路で往復させる。','M6 9H46M6 47H46M10 31L22 10L34 46L46 25M39 28L46 25L45 33'],
 ['葬火の炉',29,6,'狙った地点に6秒の炉。最初に半径150へ60%。発動後に炉の150以内で敵が倒れると、その場所の半径90へ120%の爆発（最大5回）。既にある死体には反応しない。','M11 40H41L36 21L29 31L25 9L15 23ZM18 40V47M34 40V47']
];
for(let [i,row]of TACTIC_SIGNATURES.entries()){
 let id='crafted_9_'+i,[name,cost,cool,desc]=row;SIGNATURE_SKILLS.push(row);
 Object.assign(GEM[id],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS[id]].name+'属性。',ability:null,signature:48+i,tags:['spell','area']});
}
const tacticCastBase=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let mode=GEM[build.type]?.signature;if(mode===undefined||mode<48)return tacticCastBase(build,damage,angle);
 earlySignatureCast(build,damage,angle);let s=signatureSpells.at(-1);if(!s||s.mode!==mode)return;
 s.flashes=[];
 if((mode===50||mode===51)&&!s.target){signatureSpells.pop();say('照準の近くに敵がいません');return;}
 if(mode===48)s.jaws=[-1,1].map(side=>({side,offset:side*180,hits:new Set(),blocked:false}));
 if(mode===49)s.tip={x:s.x+Math.cos(angle)*40*build.radius,y:s.y+Math.sin(angle)*40*build.radius};
 if(mode===50){s.records=[];s.recordCount=0;}
 if(mode===51)s.lastAttack=s.target.attack;
 if(mode===52){s.manaSpent=Math.min(30,Math.max(0,bloodCastPayment?bloodCastPayment.mana:p.mp));if(bloodCastPayment)bloodCastPayment.extraMana+=s.manaSpent;else p.mp-=s.manaSpent;}
 if(mode===53)s.reflected=0;
 if(mode===54){s.x=s.origin.x;s.y=s.origin.y;s.vx=Math.cos(angle)*320;s.vy=Math.sin(angle)*320;s.bounces=0;s.traces=[];}
 if(mode===55){s.watched=new Set(enemies.filter(e=>e.hp>0));s.detonated=new Set();s.deathBursts=0;signatureArea(s,s,150,.6);}
};
const tacticStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode<48)return tacticStepBase(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;s.flashes=s.flashes.filter(f=>f.until>s.time);
 if(s.mode===48){
  for(let jaw of s.jaws){let old=jaw.offset;jaw.offset=jaw.side*180*Math.max(0,1-s.time/1.2);let from={x:s.x+Math.cos(s.angle)*old,y:s.y+Math.sin(s.angle)*old},to={x:s.x+Math.cos(s.angle)*jaw.offset,y:s.y+Math.sin(s.angle)*jaw.offset};
   if(!lineClear(from,to)){jaw.blocked=true;}if(jaw.blocked)continue;
   for(let e of enemies)if(e.hp>0&&!jaw.hits.has(e)){let dx=e.x-s.x,dy=e.y-s.y,along=dx*Math.cos(s.angle)+dy*Math.sin(s.angle),across=-dx*Math.sin(s.angle)+dy*Math.cos(s.angle);
    if(along>=Math.min(old,jaw.offset)-8*s.build.radius&&along<=Math.max(old,jaw.offset)+8*s.build.radius&&Math.abs(across)<=90*s.build.radius&&lineClear(s,e)&&lineClear(to,e)){jaw.hits.add(e);linkStrike(s,e,1.3,to);}
   }
  }return s.time<1.2;
 }
 if(s.mode===49){
  let radius=(40+60*Math.min(3,s.time))*s.build.radius,angle=s.angle+s.time*Math.PI*4/3,next={x:s.x+Math.cos(angle)*radius,y:s.y+Math.sin(angle)*radius};
  if(lineClear(s,next)&&lineClear(s.tip,next))for(let e of enemies)if(e.hp>0&&!s.seen.has(e)&&projectileContact(s.tip,next,e,22*s.build.radius)!==null&&lineClear(next,e)){s.seen.add(e);linkStrike(s,e,2.8,next);}
  s.tip=next;return s.time<3;
 }
 if(s.mode===50){
  while(s.recordCount<3&&s.time+1e-8>=(s.recordCount+1)*.4){let index=s.recordCount++;if(s.target.hp>0&&lineClear(s.origin,s.target))s.records.push({x:s.target.x,y:s.target.y,at:1.8+index*.3,fired:false});}
  for(let mark of s.records)if(!mark.fired&&s.time+1e-8>=mark.at){mark.fired=true;signatureArea(s,mark,70,1.2);}
  return s.time<2.65;
 }
 if(s.mode===51){
  if(s.target.hp<=0||!lineClear(p,s.target))return false;s.x=s.target.x;s.y=s.target.y;
  if(s.target.state==='attack'&&s.target.attack&&s.target.attack!==s.lastAttack){linkStrike(s,s.target,2.5,s.origin);if(s.target.hp>0)s.target.reactionStun=Math.max(s.target.reactionStun||0,s.target.boss?.15:.4);return false;}
  return s.time<6;
 }
 if(s.mode===52){if(s.time>=.6){signatureArea(s,s,120,.8+s.manaSpent*.08);return false;}return true;}
 if(s.mode===53)return s.time<3&&s.reflected<3;
 if(s.mode===54){
  let steps=Math.max(1,Math.ceil(320*dt/4));for(let i=0;i<steps;i++){
   let from={x:s.x,y:s.y},dx=s.vx*dt/steps,dy=s.vy*dt/steps,to={x:s.x+dx,y:s.y+dy};
   if(!lineClear(from,to)){
    if(s.bounces>=3)return false;let blockX=!lineClear(from,{x:s.x+dx,y:s.y}),blockY=!lineClear(from,{x:s.x,y:s.y+dy});
    if(blockX||!blockY)s.vx=-s.vx;if(blockY||!blockX)s.vy=-s.vy;s.bounces++;s.seen.clear();s.traces.push({...from,until:s.time+.35});continue;
   }
   s.x=to.x;s.y=to.y;for(let e of enemies)if(e.hp>0&&!s.seen.has(e)&&projectileContact(from,to,e,18*s.build.radius)!==null&&lineClear(from,e)){s.seen.add(e);linkStrike(s,e,1.1,from);}
  }s.traces=s.traces.filter(t=>t.until>s.time);return s.time<4;
 }
 if(s.mode===55){
  for(let e of enemies)if(e.hp>0)s.watched.add(e);
  for(let e of s.watched)if(e.hp<=0&&!s.detonated.has(e)){s.detonated.add(e);if(dist(s,e)<=150*s.build.radius&&lineClear(s,e)&&s.deathBursts<5){s.deathBursts++;signatureArea(s,e,90,1.2);}}
  return s.time<6&&s.deathBursts<5;
 }
 return false;
};
const tacticPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 tacticPaintBase();const renderList=signatureRenderList(48,55);if(!renderList.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of renderList){if(s.mode<48||s.mode>=56)continue;let color=ELEMENTS[s.build.elements[0]].color;
  for(let flash of s.flashes)paintLinkLine(flash.a,flash.b,color,3);
  if(s.mode===48){for(let jaw of s.jaws){let point={x:s.x+Math.cos(s.angle)*jaw.offset,y:s.y+Math.sin(s.angle)*jaw.offset};if(jaw.blocked||!lineClear(s,point))continue;
   let points=[-1,1].map(side=>{let distance=90*s.build.radius;while(distance>0&&!lineClear(point,{x:point.x-Math.sin(s.angle)*distance*side,y:point.y+Math.cos(s.angle)*distance*side}))distance-=4;return{x:point.x-Math.sin(s.angle)*distance*side,y:point.y+Math.cos(s.angle)*distance*side};});
   paintLinkLine(points[0],points[1],color,6);boundaryShard(point.x,point.y,s.angle+(jaw.side>0?Math.PI:0),24,color,12);
  }groundRing(s.x,s.y,12,color,1);}
  if(s.mode===49){let radius=(40+60*Math.min(3,s.time))*s.build.radius;groundRing(s.x,s.y,radius,color,1);if(lineClear(s,s.tip)){boundaryShard(s.tip.x,s.tip.y,s.angle+s.time*Math.PI*4/3+Math.PI/2,27,color,12);paintLinkLine(s,s.tip,color,1);}}
  if(s.mode===50)for(let mark of s.records)if(!mark.fired){groundRing(mark.x,mark.y,70*s.build.radius,color,2);boundarySigil(mark,35*s.build.radius,color,s.time,4);}
  if(s.mode===51){boundarySigil(s,32,color,-s.time*2,4);let pos=project(s.x,s.y);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pos.x-12,pos.y-65);ctx.lineTo(pos.x+12,pos.y-41);ctx.moveTo(pos.x+12,pos.y-65);ctx.lineTo(pos.x-12,pos.y-41);ctx.stroke();}
  if(s.mode===52){let charge=s.manaSpent/30,progress=Math.min(1,s.time/.6);groundRing(s.x,s.y,120*s.build.radius,color,2);boundarySigil(s,(90-65*progress)*s.build.radius,color,s.time*4,4+Math.floor(charge*6));let pos=project(s.x,s.y);glowAt({x:pos.x,y:pos.y-20-progress*35},12+charge*24,color,.5);ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#f1f7ff';ctx.fillText('＋'+Math.round(s.manaSpent*10)/10+' MANA',pos.x,pos.y-65);}
  if(s.mode===53){groundRing(s.x,s.y,120*s.build.radius,color,2);boundarySigil(s,120*s.build.radius,color,s.time,6);for(let i=0;i<3-s.reflected;i++)boundaryShard(s.x,s.y,s.angle,12,color,30+i*17);}
  if(s.mode===54){boundaryShard(s.x,s.y,Math.atan2(s.vy,s.vx),24,color,10);for(let t of s.traces)groundRing(t.x,t.y,25,color,2);}
  if(s.mode===55){groundRing(s.x,s.y,150*s.build.radius,color,2);boundarySigil(s,45,color,-s.time,5-s.deathBursts);let pos=project(s.x,s.y);glowAt({x:pos.x,y:pos.y-25},25,color,.5);}
 }ctx.restore();
};
// Intercept before player contact, preserving earlier absorption barriers.
const mirrorProjectileBase=advanceProjectile;advanceProjectile=(shot,dt)=>{
 if(shot.enemy&&shot.life>0&&Number.isFinite(dt)&&dt>0&&!paused&&!dead){
  let step=Math.min(dt,shot.life),from={x:shot.x,y:shot.y},to={x:shot.x+shot.vx*step,y:shot.y+shot.vy*step},playerAt=projectileContact(from,to,p,ENEMY_PROJECTILE_HIT_RADIUS);
  let mirrors=signatureSpells.filter(s=>s.mode===53&&s.time<3&&s.reflected<3).map(s=>({s,t:projectileContact(from,to,s,120*s.build.radius)})).filter(v=>v.t!==null&&(playerAt===null||v.t<playerAt)).sort((a,b)=>a.t-b.t);
  for(let {s,t}of mirrors){let point={x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};if(!lineClear(from,point))break;
   let earlierWard=signatureSpells.some(w=>{if(w.mode!==24||w.time>=3||w.used>=6)return false;let at=projectileContact(from,to,w,120*w.build.radius);return at!==null&&at<=t&&lineClear(from,{x:from.x+(to.x-from.x)*at,y:from.y+(to.y-from.y)*at});});if(earlierWard)break;
   s.reflected++;Object.assign(shot,{x:point.x,y:point.y,vx:-shot.vx,vy:-shot.vy,enemy:false,life:1.5,damage:s.damage*1.6,craftedBuild:s.build,skill:s.build.type,elements:[...s.build.elements],tint:ELEMENTS[s.build.elements[0]].color});burst(point.x,point.y,24,shot.tint);return mirrorProjectileBase(shot,Math.max(0,dt-step*t));
  }
 }return mirrorProjectileBase(shot,dt);
};

