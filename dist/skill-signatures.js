// Replace the former remote-blast variants with independently timed abilities.
// IDs stay stable so crafted and socketed gems keep their saves and random elements.
const SIGNATURE_SKILLS=[
 ['星落とし',24,3.2,'狙った地点に予告円を置き、1.2秒後に隕石。半径160へ350%の一撃。敵の移動を先読みする。','M10 8L30 28M24 6L38 20M12 24L23 35M31 28L43 31L47 43L35 48L26 39Z'],
 ['待ち伏せの印',18,4,'狙った地点に8秒残る地雷。0.5秒で起動し、敵が半径60に入ると半径120へ250%の爆発。','M10 40L26 12L42 40ZM26 22V31M24 36H28'],
 ['奔流の壁',23,3,'幅180の衝撃波が前方480を進む。敵を一度ずつ160%で攻撃。動く壁を敵の列に通す。','M10 12Q27 26 10 40M21 12Q38 26 21 40M34 26H48M42 20L48 26L42 32'],
 ['追葬の刻印',25,4,'照準付近の敵1体を追う刻印。0.6秒ごとに4回、周囲70へ70%の爆発。対象を倒すと終了。','M14 18L26 9L38 18V34L26 43L14 34ZM20 26H32M26 20V32'],
 ['命吸いの庭',28,5,'狙った地点に3秒の庭。0.75秒ごとに半径150へ40%。敵に当たった回だけライフ3回復（最大12）。','M26 45V18M26 32Q8 34 10 17Q25 17 26 32M26 24Q42 25 44 8Q27 8 26 24'],
 ['転星連爆',26,4,'照準付近から敵を渡り歩く連続爆発。0.3秒ごとに半径80へ85%、最大5体を追跡。同じ敵を起点にしない。','M7 36L17 15L30 37L44 13M12 15H22M17 10V20M39 13H49M44 8V18'],
 ['衛星の輪舞',30,6,'3個の衛星が4秒間、自分の周囲110を旋回。接触で55%。同じ敵には0.5秒の命中間隔。移動しながら当てる。','M9 26A17 17 0 1 0 43 26A17 17 0 1 0 9 26M26 20L32 26L26 32L20 26ZM9 21V31M38 13H46'],
 ['帰還する刃',20,2.8,'前方360まで飛び、発動地点へ戻る刃。往路と復路それぞれ一度ずつ120%。折り返しに敵を誘導する。','M10 39Q7 10 33 12L43 18L32 24M43 18H20M20 24L12 32L25 33']
];
for(let [index,[name,cost,cool,desc]]of SIGNATURE_SKILLS.entries())Object.assign(GEM['crafted_4_'+index],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS['crafted_4_'+index]].name+'属性。',ability:null,signature:index,tags:['spell','area']});
const signatureIconBase=gemIcon;gemIcon=type=>{
 let def=GEM[type];if(def?.signature===undefined)return signatureIconBase(type);
 return '<svg class="skill-ability-icon" viewBox="0 0 56 56" aria-hidden="true" style="color:'+ELEMENTS[SKILL_ELEMENTS[type]].color+'"><path d="'+SIGNATURE_SKILLS[def.signature][4]+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
};
let signatureSpells=[];
const signatureCastBase=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let mode=GEM[build.type].signature;if(mode===undefined)return signatureCastBase(build,damage,angle);
 let origin={x:p.x,y:p.y},range=Math.min(400,Math.hypot(mouse.x-W/2,mouse.y-H/2)),aim={x:p.x+Math.cos(angle)*range,y:p.y+Math.sin(angle)*range};
 // Targeted placement stops at the last visible point before a wall.
 if(!lineClear(origin,aim)){for(let d=range;d>=0;d-=10){aim={x:p.x+Math.cos(angle)*d,y:p.y+Math.sin(angle)*d};if(lineClear(origin,aim))break;}}
 let near=enemies.filter(e=>e.hp>0&&dist(e,aim)<=140&&lineClear(origin,e)).sort((a,b)=>dist(a,aim)-dist(b,aim))[0];
 let state={mode,build:{...build,elements:[...build.elements],supports:[...build.supports]},damage,angle,origin,x:aim.x,y:aim.y,time:0,accumulator:0,next:mode===3?.6:mode===4?.75:.3,ticks:0,target:near,seen:new Set(),hits:new Map(),phaseHits:[new Set(),new Set()],previous:origin};
 if((mode===3||mode===5)&&!near){say('照準の近くに敵がいません');return;}
 if(mode===2||mode===6||mode===7){state.x=p.x;state.y=p.y;}
 signatureSpells.push(state);if(signatureSpells.length>24)signatureSpells.shift();playSound('fire',p.x,p.y);
};
function signatureArea(s,center,radius,mult){
 let hits=[];for(let e of enemies)if(e.hp>0&&dist(center,e)<=radius*s.build.radius&&lineClear(center,e)){spellHit(e,s.damage*mult,s.build);hits.push(e);}
 burst(center.x,center.y,radius*s.build.radius,ELEMENTS[s.build.elements[0]].color);return hits;
}
function stepSignature(s,dt){
 s.time=Math.round((s.time+dt)*1000000)/1000000;let radius=s.build.radius;
 if(s.mode===0){if(s.time>=1.2){signatureArea(s,s,160,3.5);return false;}return true;}
 if(s.mode===1){if(s.time>=8)return false;if(s.time>=.5&&enemies.some(e=>e.hp>0&&dist(e,s)<=60*radius&&lineClear(s,e))){signatureArea(s,s,120,2.5);return false;}return true;}
 if(s.mode===2){
  s.x=s.origin.x+Math.cos(s.angle)*Math.min(480,s.time*400);s.y=s.origin.y+Math.sin(s.angle)*Math.min(480,s.time*400);
  if(!lineClear(s.previous,s))return false;
  for(let e of enemies){let dx=e.x-s.origin.x,dy=e.y-s.origin.y,x=dx*Math.cos(s.angle)+dy*Math.sin(s.angle),y=-dx*Math.sin(s.angle)+dy*Math.cos(s.angle);if(e.hp>0&&!s.seen.has(e)&&x>=0&&x<=Math.min(480,s.time*400)&&Math.abs(y)<=90*radius&&lineClear(s.origin,e)){s.seen.add(e);spellHit(e,s.damage*1.6,s.build);}}
  s.previous={x:s.x,y:s.y};return s.time<1.2;
 }
 if(s.mode===3||s.mode===4||s.mode===5){
  if(s.mode!==4){if(!s.target||s.target.hp<=0)return false;s.x=s.target.x;s.y=s.target.y;}
  if(s.time+1e-8<s.next)return true;
  if(s.mode===3){signatureArea(s,s,70,.7);s.next+=.6;return ++s.ticks<4;}
  if(s.mode===4){if(signatureArea(s,s,150,.4).length)p.hp=Math.min(maxhp(),p.hp+3);s.next+=.75;return ++s.ticks<4;}
  s.seen.add(s.target);signatureArea(s,s,80,.85);s.next+=.3;if(++s.ticks>=5)return false;
  s.target=enemies.filter(e=>e.hp>0&&!s.seen.has(e)&&dist(s,e)<=200&&lineClear(s,e)).sort((a,b)=>dist(a,s)-dist(b,s))[0];return !!s.target;
 }
 if(s.mode===6){
  s.x=p.x;s.y=p.y;for(let n=0;n<3;n++){let a=s.time*3+n*Math.PI*2/3,orb={x:p.x+Math.cos(a)*110,y:p.y+Math.sin(a)*110};for(let e of enemies)if(e.hp>0&&dist(orb,e)<=35*radius&&s.time>=(s.hits.get(e)||0)&&lineClear(p,e)){s.hits.set(e,s.time+.5);spellHit(e,s.damage*.55,s.build);}}
  return s.time<4;
 }
 if(s.mode===7){
  let phase=s.time<=.8?0:1,d=s.time<=.8?s.time*450:Math.max(0,(1.6-s.time)*450);s.x=s.origin.x+Math.cos(s.angle)*d;s.y=s.origin.y+Math.sin(s.angle)*d;
  if(!lineClear(s.previous,s))return false;
  for(let e of enemies)if(e.hp>0&&!s.phaseHits[phase].has(e)&&projectileContact(s.previous,s,e,30*radius)!==null&&lineClear(s,e)){s.phaseHits[phase].add(e);spellHit(e,s.damage*1.2,s.build);}
  s.previous={x:s.x,y:s.y};return s.time<1.6;
 }
 return false;
}
function advanceSignatureSpells(dt){
 if(!Number.isFinite(dt)||dt<=0)return;
 signatureSpells=signatureSpells.filter(s=>{s.accumulator+=dt;while(s.accumulator>=.025-1e-9){s.accumulator-=.025;if(!stepSignature(s,.025))return false;}return true;});
}
const signatureUpdateBase=update;update=dt=>{let running=started&&!paused&&!dead;signatureUpdateBase(dt);if(running&&!paused&&!dead)advanceSignatureSpells(dt);};
const signatureWorldBase=loadWorld;loadWorld=(...args)=>{signatureSpells=[];return signatureWorldBase(...args);};
// A DPS attempt cannot inherit planted traps, turrets or queued waves from before it.
const signatureClearDummyBase=clearDummy;clearDummy=()=>{signatureSpells=[];craftedSkillWaves=[];craftedDetonations=[];return signatureClearDummyBase();};
// Group only for one paint call. Combat always sees the original spell array.
let signatureRenderGroups=null,signatureRenderSource=null;
const emptySignatureRenderList=Object.freeze([]),emptySignatureRenderGroups=new Map();
function signatureRenderKey(mode){return mode<64?Math.floor(mode/8)*8:mode<68?64:mode;}
function signatureRenderList(first,last=first){
 if(signatureRenderGroups&&signatureRenderSource===signatureSpells)return signatureRenderGroups.get(first)||emptySignatureRenderList;
 return signatureSpells.filter(s=>(s.mode>=first&&s.mode<=last)||(first===56&&s.mode>=64&&s.flashes?.length));
}
function withSignatureRenderGroups(paint){
 if(signatureRenderGroups&&signatureRenderSource===signatureSpells)return paint();
 const previous=signatureRenderGroups,source=signatureRenderSource;let groups=emptySignatureRenderGroups;
 if(signatureSpells.length){groups=new Map();for(const s of signatureSpells){const key=signatureRenderKey(s.mode),list=groups.get(key);if(list)list.push(s);else groups.set(key,[s]);if(key>=64&&s.flashes?.length){const flashes=groups.get(56);if(flashes)flashes.push(s);else groups.set(56,[s]);}}}
 signatureRenderGroups=groups;signatureRenderSource=signatureSpells;
 try{return paint();}finally{signatureRenderGroups=previous;signatureRenderSource=source;}
}

function paintSignatureSpells(){const renderList=signatureRenderList(0,7);if(!renderList.length)return;
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of renderList){if(s.mode>=8)continue;let color=ELEMENTS[s.build.elements[0]].color,r=s.build.radius;if(!visibleAt(s.x,s.y))continue;
  if(s.mode===0){groundRing(s.x,s.y,160*r,color,2);groundRing(s.x,s.y,160*r*Math.min(1,s.time/1.2),'#fff4d6',3);let pos=project(s.x,s.y);glowAt({x:pos.x,y:pos.y-220*(1-s.time/1.2)},28,color,.8);}
  else if(s.mode===1){groundRing(s.x,s.y,60*r,color,s.time<.5?1:3);let pos=project(s.x,s.y);glowAt(pos,15,color,.5+.3*Math.sin(s.time*5));}
  else if(s.mode===2){let a=project(s.x+Math.cos(s.angle+Math.PI/2)*90*r,s.y+Math.sin(s.angle+Math.PI/2)*90*r),b=project(s.x-Math.cos(s.angle+Math.PI/2)*90*r,s.y-Math.sin(s.angle+Math.PI/2)*90*r);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=9;ctx.stroke();}
  else if(s.mode===3||s.mode===5){groundRing(s.x,s.y,(s.mode===3?70:80)*r,color,2);glowAt(project(s.x,s.y),18,color,.7);}
  else if(s.mode===4){groundRing(s.x,s.y,150*r,color,2);for(let n=0;n<8;n++){let a=n*Math.PI/4+s.time;glowAt(project(s.x+Math.cos(a)*100*r,s.y+Math.sin(a)*100*r),14,color,.3);}}
  else if(s.mode===6){for(let n=0;n<3;n++){let a=s.time*3+n*Math.PI*2/3;glowAt(project(s.x+Math.cos(a)*110,s.y+Math.sin(a)*110),22,color,.8);}}
  else{let pos=project(s.x,s.y);glowAt(pos,30,color,.7);groundRing(s.x,s.y,30*r,'#fff3d7',3);}
 }
 ctx.restore();
}
const signatureDrawBase=drawEffects;drawEffects=()=>{signatureDrawBase();paintSignatureSpells();};
