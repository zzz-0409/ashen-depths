// These abilities react to space and movement; forged elements retain the same rules.
const BOUNDARY_SIGNATURES=[
 ['収束する刃環',26,4,'狙った地点の半径220から40まで、2秒で縮む刃の輪。輪が触れた敵へ一度だけ220%。中心40以内は安全地帯。','M7 26A19 19 0 1 0 45 26A19 19 0 1 0 7 26M17 26A9 9 0 1 0 35 26A9 9 0 1 0 17 26M7 26H17M35 26H45'],
 ['巡回する灯槍',28,5,'狙った地点に灯台を3秒設置。長さ240の光の槍が1周し、触れた敵へ75%。同じ敵には0.5秒間隔。壁で遮られる。','M26 26L45 10M26 26L46 18M14 10A19 19 0 1 0 44 37M40 44L44 37L36 36M22 22H30V30H22Z'],
 ['越境の罠',22,5,'狙った地点へ幅320の線を6秒設置。設置後に線を横切った敵だけへ300%、各敵一度。線上に立つだけでは発動しない。','M8 10V44M44 10V44M8 27H44M19 8L33 42M27 36L33 42L36 33'],
 ['歩みの残火',24,5,'3秒間、発動地点と移動60ごとに印を残す（最大8個）。各印は0.8秒後に半径65へ80%の爆発。歩いた道へ敵を誘う。','M8 42L16 30L29 35L38 20L46 10M8 36V48M2 42H14M23 29V41M17 35H29'],
 ['静寂の審判',25,4,'敵1体を1.5秒監視。発動時の位置から45を超えて動かなければ400%。途中で45を超えるか、壁に隠れると印が消える。','M14 8H38M14 44H38M18 8V18L34 34V44M34 8V18L18 34V44M8 26H44'],
 ['追跡する裂け目',26,4,'足元から狙った敵を追う裂け目。秒速160で最大3秒進み、敵の25以内へ届くと半径100へ爆発。威力80%＋移動100につき100%、最大400%。壁で停止して爆発。','M6 42L17 31L12 24L30 20L26 10L47 6M35 6H47V18'],
 ['遠雷の標',21,4,'敵1体へ6秒の印。発動位置から120以上離れた瞬間に300%。動かない敵には発動せず、壁越しの移動では消える。','M8 26A10 10 0 1 0 28 26A10 10 0 1 0 8 26M28 26H46M38 18L46 26L38 34'],
 ['満潮の杯',29,5,'狙った地点の半径130へ50%。命中数（最大8体）を蓄え、1秒後に再爆発。半径60＋命中数×20、威力70%＋命中数×15%。密集した敵ほど強くなる。','M12 9H40L36 29L26 36L16 29ZM26 36V46M17 46H35M14 20Q26 13 38 20']
];
for(let [i,row] of BOUNDARY_SIGNATURES.entries()){
 let id='crafted_14_'+i,[name,cost,cool,desc]=row;SIGNATURE_SKILLS.push(row);
 Object.assign(GEM[id],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS[id]].name+'属性。',ability:null,signature:40+i,tags:['spell','area']});
}
function boundarySide(s,e){return (e.x-s.x)*Math.cos(s.angle)+(e.y-s.y)*Math.sin(s.angle);}
function boundaryCrosses(s,from,to){
 let a=boundarySide(s,from),b=boundarySide(s,to);if(a*b>=0)return false;
 let fraction=a/(a-b),point={x:from.x+(to.x-from.x)*fraction,y:from.y+(to.y-from.y)*fraction};
 return dist(point,s)<=160*s.build.radius&&lineClear(s,point)&&lineClear(from,to);
}
const boundaryCastBase=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let mode=GEM[build.type]?.signature;if(mode<40||mode===undefined)return boundaryCastBase(build,damage,angle);
 earlySignatureCast(build,damage,angle);let s=signatureSpells.at(-1);if(!s||s.mode!==mode)return;
 s.flashes=[];s.positions=new Map(enemies.filter(e=>e.hp>0).map(e=>[e,{x:e.x,y:e.y}]));s.ringRadius=220*build.radius;
 if([44,45,46].includes(mode)&&!s.target){signatureSpells.pop();say('照準の近くに敵がいません');return;}
 if(mode===43){s.trail=[{...s.origin,at:.8,fired:false}];s.trailCount=1;s.lastStep={...s.origin};s.walked=0;}
 if(mode===44||mode===46)s.watchOrigin={x:s.target.x,y:s.target.y};
 if(mode===45){s.x=s.origin.x;s.y=s.origin.y;s.travel=0;}
 if(mode===47){s.charge=Math.min(8,signatureArea(s,s,130,.5).length);}
};
const boundaryStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode<40)return boundaryStepBase(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;s.flashes=s.flashes.filter(f=>f.until>s.time);
 if(s.mode===40){
  let previous=s.ringRadius;s.ringRadius=Math.max(40,220-s.time*90)*s.build.radius;
  for(let e of enemies)if(e.hp>0&&!s.seen.has(e)){
   let before=s.positions.get(e),now=dist(s,e)-s.ringRadius,old=before?dist(s,before)-previous:now;
   if((Math.abs(now)<=8*s.build.radius||old*now<0)&&dist(s,e)>=40*s.build.radius&&lineClear(s,e)){
    s.seen.add(e);linkStrike(s,e,2.2,s);
   }
   s.positions.set(e,{x:e.x,y:e.y});
  }return s.time<2;
 }
 if(s.mode===41){
  let angle=s.angle+s.time*Math.PI*2/3,end={x:s.x+Math.cos(angle)*240*s.build.radius,y:s.y+Math.sin(angle)*240*s.build.radius};
  for(let e of enemies)if(e.hp>0&&s.time>=(s.hits.get(e)||0)&&projectileContact(s,end,e,16*s.build.radius)!==null&&lineClear(s,e)){s.hits.set(e,s.time+.5);linkStrike(s,e,.75,s);}
  return s.time<3;
 }
 if(s.mode===42){
  for(let e of enemies)if(e.hp>0&&!s.seen.has(e)){
   let previous=s.positions.get(e);if(previous&&boundaryCrosses(s,previous,e)){s.seen.add(e);linkStrike(s,e,3,s);}
   // Keep the last non-zero side so stepping exactly onto the line cannot avoid crossing.
   if(Math.abs(boundarySide(s,e))>1e-6)s.positions.set(e,{x:e.x,y:e.y});
  }return s.time<6;
 }
 if(s.mode===43){
  if(s.time<=3&&s.trailCount<8){let from=s.lastStep,length=dist(from,p);
   if(lineClear(from,p)&&length>0){let offset=60-s.walked;
    while(offset<=length&&s.trailCount<8){s.trail.push({x:from.x+(p.x-from.x)*offset/length,y:from.y+(p.y-from.y)*offset/length,at:s.time+.8,fired:false});s.trailCount++;offset+=60;}
    s.walked=(s.walked+length)%60;
   }else if(length>0)s.walked=0;
   s.lastStep={x:p.x,y:p.y};
  }
  for(let mark of s.trail)if(!mark.fired&&s.time+1e-8>=mark.at){mark.fired=true;signatureArea(s,mark,65,.8);}
  return s.time<3.8;
 }
 if(s.mode===44||s.mode===46){
  if(s.target.hp<=0||!lineClear(p,s.target))return false;
  let displacement=dist(s.watchOrigin,s.target);s.x=s.target.x;s.y=s.target.y;
  if(s.mode===44){if(displacement>45)return false;if(s.time>=1.5){linkStrike(s,s.target,4,s.watchOrigin);return false;}return true;}
  if(displacement>=120){linkStrike(s,s.target,3,s.watchOrigin);return false;}return s.time<6;
 }
 if(s.mode===45){
  if(s.target.hp<=0)return false;let length=dist(s,s.target),step=Math.min(length,160*dt),next={x:s.x+(s.target.x-s.x)*step/(length||1),y:s.y+(s.target.y-s.y)*step/(length||1)};
  let blocked=!lineClear(s,next);if(!blocked){s.x=next.x;s.y=next.y;s.travel+=step;}
  if(blocked||dist(s,s.target)<=25||s.time>=3){signatureArea(s,s,100,Math.min(4,.8+s.travel/100));return false;}return true;
 }
 if(s.mode===47){if(s.time>=1){signatureArea(s,s,60+s.charge*20,.7+s.charge*.15);return false;}return true;}
 return false;
};
const boundaryPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 boundaryPaintBase();ctx.save();ctx.globalCompositeOperation='lighter';
 for(let s of signatureSpells){if(s.mode<40||s.mode>=48)continue;let color=ELEMENTS[s.build.elements[0]].color;
  for(let f of s.flashes)paintLinkLine(f.a,f.b,color,4);
  if(s.mode===40){groundRing(s.x,s.y,s.ringRadius,color,4);groundRing(s.x,s.y,40*s.build.radius,color,1);}
  if(s.mode===41){let angle=s.angle+s.time*Math.PI*2/3,length=240*s.build.radius;
   while(length>0&&!lineClear(s,{x:s.x+Math.cos(angle)*length,y:s.y+Math.sin(angle)*length}))length-=4;
   paintLinkLine(s,{x:s.x+Math.cos(angle)*length,y:s.y+Math.sin(angle)*length},color,5);groundRing(s.x,s.y,18,color,2);
  }
  if(s.mode===42){let a=s.angle+Math.PI/2,points=[-1,1].map(side=>({x:s.x+Math.cos(a)*160*s.build.radius*side,y:s.y+Math.sin(a)*160*s.build.radius*side}));
   paintLinkLine(points[0],points[1],color,2);for(let q of points)groundRing(q.x,q.y,12,color,2);
  }
  if(s.mode===43)for(let mark of s.trail)if(!mark.fired){groundRing(mark.x,mark.y,65*s.build.radius,color,1);groundRing(mark.x,mark.y,65*s.build.radius*Math.max(0,1-(mark.at-s.time)/.8),color,3);}
  if(s.mode===44||s.mode===46){groundRing(s.watchOrigin.x,s.watchOrigin.y,s.mode===44?45:120,color,1);groundRing(s.x,s.y,22,color,3);paintLinkLine(s.watchOrigin,s,color,2);}
  if(s.mode===45){paintLinkLine(s.origin,s,color,2);groundRing(s.x,s.y,20+s.travel*.05,color,3);}
  if(s.mode===47){groundRing(s.x,s.y,(60+s.charge*20)*s.build.radius,color,2);groundRing(s.x,s.y,(60+s.charge*20)*s.build.radius*s.time,color,4);}
  paintBoundaryOrnaments(s,color);
 }ctx.restore();
};
// Fixed, time-derived ornament geometry: drawing never advances combat or RNG.
function boundaryShard(x,y,angle,length,color,lift=0){
 let points=[[length,0],[-length*.45,length*.28],[-length*.2,0],[-length*.45,-length*.28]].map(([a,b])=>project(x+Math.cos(angle)*a-Math.sin(angle)*b,y+Math.sin(angle)*a+Math.cos(angle)*b));
 ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y-lift):ctx.moveTo(q.x,q.y-lift));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff2da';ctx.lineWidth=.8;ctx.stroke();
}
function boundarySigil(point,radius,color,phase,count=6){
 ctx.save();ctx.globalAlpha=.65;for(let i=0;i<count;i++){let angle=i*Math.PI*2/count+phase;
  boundaryShard(point.x+Math.cos(angle)*radius,point.y+Math.sin(angle)*radius,angle+Math.PI/2,7,color);
 }ctx.restore();
}
function paintBoundaryOrnaments(s,color){
 let light=typeof effectQuality!=='undefined'&&effectQuality==='low',count=light?6:16,pos=project(s.x,s.y);
 ctx.save();
 if(s.mode===40){
  for(let i=0;i<count;i++){let angle=i*Math.PI*2/count+s.time*2;boundaryShard(s.x+Math.cos(angle)*s.ringRadius,s.y+Math.sin(angle)*s.ringRadius,angle+Math.PI/2,16,color,4+Math.sin(angle*3+s.time*7)*3);}
  ctx.globalAlpha=.3;groundRing(s.x,s.y,s.ringRadius+9,color,2);ctx.globalAlpha=1;
 }
 if(s.mode===41){
  let angle=s.angle+s.time*Math.PI*2/3,length=240*s.build.radius;
  while(length>0&&!lineClear(s,{x:s.x+Math.cos(angle)*length,y:s.y+Math.sin(angle)*length}))length-=4;
  let tip={x:s.x+Math.cos(angle)*length,y:s.y+Math.sin(angle)*length};
  ctx.globalAlpha=.22;paintLinkLine(s,tip,color,14);ctx.globalAlpha=.95;paintLinkLine(s,tip,'#fff7df',2);
  boundarySigil(s,32,color,-s.time*2,light?4:8);if(!light)glowAt({x:pos.x,y:pos.y-12},27,color,.45);
 }
 if(s.mode===42){
  let angle=s.angle+Math.PI/2;for(let i=0;i<(light?3:7);i++){let offset=(((s.time*.3+i/(light?3:7))%1)*2-1)*160*s.build.radius;
   let q={x:s.x+Math.cos(angle)*offset,y:s.y+Math.sin(angle)*offset};if(lineClear(s,q))boundaryShard(q.x,q.y,angle,8,color,8);
  }
 }
 if(s.mode===43)for(let mark of s.trail)if(!mark.fired){let progress=clamp(1-(mark.at-s.time)/.8,0,1);
  boundarySigil(mark,40*s.build.radius,color,progress*2,light?3:6);
  if(!light){let q=project(mark.x,mark.y);glowAt({x:q.x,y:q.y-progress*30},10+progress*14,color,.3);}
 }
 if(s.mode===44){
  let progress=clamp(s.time/1.5,0,1),x=pos.x,y=pos.y-56;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-9,y-14);ctx.lineTo(x+9,y-14);ctx.lineTo(x-9,y+14);ctx.lineTo(x+9,y+14);ctx.closePath();ctx.stroke();
  ctx.fillStyle='#fff1cd';ctx.fillRect(x-5,y+11-progress*10,10,Math.max(1,progress*10));boundarySigil(s,28,color,s.time*3,4);
 }
 if(s.mode===45){
  let angle=Math.atan2(s.target.y-s.y,s.target.x-s.x);for(let i=0;i<(light?3:6);i++)boundaryShard(s.x-Math.cos(angle)*i*9,s.y-Math.sin(angle)*i*9,angle,Math.max(6,17-i*2),color,4+i%2*5);
  if(!light)glowAt({x:pos.x,y:pos.y-12},22,color,.4);
 }
 if(s.mode===46){
  let angle=Math.atan2(s.y-s.watchOrigin.y,s.x-s.watchOrigin.x),progress=clamp(dist(s,s.watchOrigin)/120,0,1);
  for(let i=0;i<3;i++)boundaryShard(s.x,s.y,angle,9+i*3,color,30+i*11+Math.sin(s.time*7)*3);
  ctx.globalAlpha=.4+progress*.5;groundRing(s.watchOrigin.x,s.watchOrigin.y,120,color,1+progress*3);
 }
 if(s.mode===47){
  for(let i=0;i<Math.max(1,s.charge);i++){let angle=i*Math.PI*2/Math.max(1,s.charge)+s.time*4,r=(1-s.time)*55*s.build.radius;
   boundaryShard(s.x+Math.cos(angle)*r,s.y+Math.sin(angle)*r,angle+Math.PI,10,color,12+s.time*35);
  }
  boundarySigil(s,(60+s.charge*20)*s.build.radius,color,-s.time,light?4:10);
  if(!light)glowAt({x:pos.x,y:pos.y-s.time*35},20+s.time*25,color,.3);
 }
 ctx.restore();
}
