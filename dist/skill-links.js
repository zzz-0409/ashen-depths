const LINK_SIGNATURES=[
 ['双星の契約',24,5,'照準付近の敵2体を結ぶ。3秒間、0.5秒ごとに各50%。2体が300以上離れるか片方が倒れると終了。','M8 14L18 8L28 14L18 20ZM28 38L38 32L48 38L38 44ZM18 20L38 32'],
 ['枝分かれの雷槌',24,3,'照準の敵へ100%。0.6秒後、その敵のいた位置から200以内の別の敵を最大3体、各120%で撃つ。','M26 6V24M26 24L9 42M26 24V46M26 24L43 42M6 36L9 42L16 40M36 40L43 42L46 36'],
 ['継承する呪印',26,5,'敵1体に6秒の印。0.5秒ごとに35%。倒れると半径80へ80%の爆発を起こし、180以内の別の敵へ継承。継承は最大3回。','M14 10H36V32H14ZM20 17H30M20 24H30M27 38Q45 40 44 25M38 29L44 25L48 32'],
 ['三角封陣',30,6,'狙った地点に半径180の三角陣を3秒設置。0.5秒ごとに、三角形の内側の敵だけへ60%。辺の外には当たらない。','M26 6L48 44H4ZM26 21L36 38H16ZM26 6V21'],
 ['昇圧の鎖',25,4,'照準の敵から220以内の次の敵へ、0.15秒ごとに最大6体を連鎖。同じ敵には戻らない。威力は50%から1体ごとに25%増える。','M6 42L14 34L22 37L30 22L38 26L48 7M38 7H48V18'],
 ['孤星の裁き',23,3.5,'敵1体を1秒狙い続けて裁く。着弾時、対象の150以内に他の生きた敵がいなければ400%、いれば100%。壁を挟むと失敗。','M26 6V14M26 38V46M6 26H14M38 26H46M26 17L35 26L26 35L17 26Z'],
 ['残座の連印',29,5,'照準の周囲200にいる敵を最大5体選び、その足元へ印を残す。1.2秒後、各印の半径55へ90%。敵が移動すると印から逃れ、密集すると爆発が重なる。','M8 12H20V24H8ZM32 12H44V24H32ZM20 32H32V44H20ZM20 18H32M14 24L26 32L38 24'],
 ['二柱の境界',18,.8,'1回目で8秒残る柱を置く。2回目で500以内の別地点へ柱を置き、2本を結ぶ境界を5秒維持。0.5秒ごとに線の近くへ60%。壁越しには結べない。','M8 8H16V46H8ZM36 8H44V46H36ZM16 18H36M16 28H36M16 38H36']
];
for(let [i,row]of LINK_SIGNATURES.entries()){
 let [name,cost,cool,desc]=row,id='crafted_16_'+i;SIGNATURE_SKILLS.push(row);
 Object.assign(GEM[id],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS[id]].name+'属性。',ability:null,signature:32+i,tags:['spell','area']});
}
function linkCandidates(center,range,excluded=new Set()){
 return enemies.filter(e=>e.hp>0&&!excluded.has(e)&&dist(center,e)<=range&&lineClear(center,e)).sort((a,b)=>dist(a,center)-dist(b,center));
}
function linkStrike(s,e,mult,from){
 if(e.hp<=0)return;spellHit(e,s.damage*mult,s.build);
 s.flashes.push({a:{x:from.x,y:from.y},b:{x:e.x,y:e.y},until:s.time+.22});burst(e.x,e.y,22,ELEMENTS[s.build.elements[0]].color);
}
function inLinkTriangle(point,vertices){
 let signs=vertices.map((a,i)=>{let b=vertices[(i+1)%3];return (b.x-a.x)*(point.y-a.y)-(b.y-a.y)*(point.x-a.x)});
 return signs.every(n=>n>=-1e-7)||signs.every(n=>n<=1e-7);
}
function inheritLinkMark(s){
 if(s.target.hp>0)return true;
 let old={x:s.target.x,y:s.target.y};signatureArea(s,old,80,.8);
 if(++s.ticks>3)return false;
 s.target=linkCandidates(old,180,s.seen)[0];if(!s.target)return false;
 s.seen.add(s.target);s.flashes.push({a:old,b:{x:s.target.x,y:s.target.y},until:s.time+.3});return true;
}
const linkSignatureCast=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let mode=GEM[build.type]?.signature;if(mode===undefined||mode<32)return linkSignatureCast(build,damage,angle);
 earlySignatureCast(build,damage,angle);let s=signatureSpells.at(-1);if(!s||s.mode!==mode)return;
 s.flashes=[];s.next=.5;s.marks=[];
 if([32,33,34,36,37].includes(mode)&&!s.target){signatureSpells.pop();say('照準の近くに敵がいません');return;}
 if(mode===32){s.partner=linkCandidates(s.target,300,new Set([s.target]))[0];if(!s.partner){signatureSpells.pop();say('結ぶ相手が近くにいません');return;}}
 if(mode===33){s.origin={x:s.target.x,y:s.target.y};s.seen.add(s.target);linkStrike(s,s.target,1,p);s.next=.6;}
 if(mode===34)s.seen.add(s.target);
 if(mode===35)s.vertices=Array.from({length:3},(_,i)=>({x:s.x+Math.cos(angle+i*Math.PI*2/3)*180*build.radius,y:s.y+Math.sin(angle+i*Math.PI*2/3)*180*build.radius}));
 if(mode===36){s.next=.15;}
 if(mode===38){s.marks=linkCandidates(s,200*build.radius).slice(0,5).map(e=>({x:e.x,y:e.y}));if(!s.marks.length){signatureSpells.pop();say('照準の近くに敵がいません');}}
 if(mode===39){let anchor=signatureSpells.find(other=>other!==s&&other.mode===39&&!other.linked&&other.time<8);
  if(anchor){signatureSpells.pop();if(dist(anchor,s)<35||dist(anchor,s)>500||!lineClear(anchor,s)){say('柱は35〜500の距離で、壁を挟まずに置いてください');return;}anchor.end={x:s.x,y:s.y};anchor.linked=true;anchor.time=0;anchor.next=.5;anchor.ticks=0;anchor.accumulator=0;}
 }
};
const linkSignatureStep=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode<32)return linkSignatureStep(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;s.flashes=s.flashes.filter(f=>f.until>s.time);
 if(s.mode===32){if(s.target.hp<=0||s.partner.hp<=0||dist(s.target,s.partner)>=300||!lineClear(s.target,s.partner))return false;s.x=s.target.x;s.y=s.target.y;if(s.time>=s.next){s.next+=.5;s.ticks++;linkStrike(s,s.target,.5,s.partner);linkStrike(s,s.partner,.5,s.target);}return s.ticks<6;}
 if(s.mode===33){if(s.time>=s.next){for(let e of linkCandidates(s.origin,200,s.seen).slice(0,3))linkStrike(s,e,1.2,s.origin);s.next=Infinity;}return s.time<.85;}
 if(s.mode===34){
  if(s.time>6||!inheritLinkMark(s))return false;
  s.x=s.target.x;s.y=s.target.y;if(s.time>=s.next){s.next+=.5;linkStrike(s,s.target,.35,s);if(!inheritLinkMark(s))return false;}return s.time<6;
 }
 if(s.mode===35){if(s.time>=s.next){s.next+=.5;s.ticks++;for(let e of enemies)if(e.hp>0&&inLinkTriangle(e,s.vertices)&&lineClear(s,e))linkStrike(s,e,.6,s);}return s.ticks<6;}
 if(s.mode===36){if(s.time>=s.next){if(!s.target||s.target.hp<=0)return false;s.next+=.15;s.seen.add(s.target);let from=s.previous;linkStrike(s,s.target,.5+s.ticks*.25,from);s.x=s.target.x;s.y=s.target.y;s.previous={x:s.x,y:s.y};s.ticks++;s.target=linkCandidates(s,220,s.seen)[0];if(s.ticks>=6||!s.target)s.next=Infinity;}return s.next!==Infinity||s.flashes.length>0;}
 if(s.mode===37){if(s.target.hp<=0)return false;s.x=s.target.x;s.y=s.target.y;if(s.time>=1){if(lineClear(p,s.target)){let isolated=!enemies.some(e=>e!==s.target&&e.hp>0&&dist(e,s.target)<=150);linkStrike(s,s.target,isolated?4:1,p);}return false;}return true;}
 if(s.mode===38){if(s.time>=1.2){for(let point of s.marks)signatureArea(s,point,55,.9);return false;}return true;}
 if(s.mode===39){if(!s.linked)return s.time<8;if(!lineClear(s,s.end))return false;if(s.time>=s.next){s.next+=.5;s.ticks++;for(let e of enemies)if(e.hp>0&&projectileContact(s,s.end,e,24*s.build.radius)!==null&&lineClear(s,e))linkStrike(s,e,.6,s);}return s.ticks<10;}
 return false;
};
function paintLinkLine(a,b,color,width=2){let start=project(a.x,a.y),end=project(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(start.x,start.y-12);ctx.lineTo(end.x,end.y-12);ctx.stroke();}
const linkSignaturePaint=paintSignatureSpells;paintSignatureSpells=()=>{
 linkSignaturePaint();ctx.save();ctx.globalCompositeOperation='lighter';
 for(let s of signatureSpells){if(s.mode<32||s.mode>=40)continue;let color=ELEMENTS[s.build.elements[0]].color;
  for(let f of s.flashes)paintLinkLine(f.a,f.b,color,4);
  if(s.mode===32&&s.target&&s.partner){paintLinkLine(s.target,s.partner,color,2);groundRing(s.target.x,s.target.y,26,color,2);groundRing(s.partner.x,s.partner.y,26,color,2);}
  if(s.mode===33){groundRing(s.origin.x,s.origin.y,200*Math.min(1,s.time/.6),color,1);}
  if(s.mode===34){groundRing(s.x,s.y,28,color,3);let pos=project(s.x,s.y);glowAt({x:pos.x,y:pos.y-50},12,color,.7);}
  if(s.mode===35)for(let i=0;i<3;i++){paintLinkLine(s.vertices[i],s.vertices[(i+1)%3],color,3);groundRing(s.vertices[i].x,s.vertices[i].y,16,color,2);}
  if(s.mode===37){groundRing(s.x,s.y,150,color,1);groundRing(s.x,s.y,50*(1-s.time),color,3);}
  if(s.mode===38)for(let point of s.marks){groundRing(point.x,point.y,55*s.build.radius,color,2);groundRing(point.x,point.y,55*s.build.radius*Math.min(1,s.time/1.2),'#fff2d0',2);}
  if(s.mode===39){for(let point of s.linked?[s,s.end]:[s]){let pos=project(point.x,point.y);paintLinkLine(point,{x:point.x,y:point.y-55},color,6);glowAt({x:pos.x,y:pos.y-30},16,color,.6);}if(s.linked)paintLinkLine(s,s.end,color,3);else groundRing(s.x,s.y,35,color,2);}
 }
 ctx.restore();
};
