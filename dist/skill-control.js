// Player-controlled abilities retain their behavior when forged elements change.
const CONTROL_SIGNATURES=[
 ['星渡りの門',26,7,'足元と照準地点に6秒の門。一度足元から70以上離れ、起動0.5秒後に半径35へ戻ると出口へ移動し、半径130へ280%。一度だけ発動。移動を壁に阻まれた場合は爆発しない。','M7 43V17Q15 1 23 17V43M31 43V17Q39 1 47 17V43M17 28H37M31 22L37 28L31 34'],
 ['導き手の彗星',24,5,'足元から3秒、秒速240の貫通弾。飛行中も照準方向へ毎秒180度まで曲がる。触れた敵へ140%、同じ敵は一度だけ、最大3体。壁で消滅。','M6 40Q12 13 34 20L46 10L40 29L34 20M5 30L11 24M10 45L17 39'],
 ['定点の三重奏',30,6,'発動地点から12以内に留まる間、照準地点へ0.75秒ごとに3波。半径90/140/200、威力80%/140%/220%。移動・回避・押し出しで12を超えると残りは中断。','M8 42H44M16 42V30M26 42V20M36 42V8M8 14H18M13 9V19'],
 ['巡礼の聖火',28,7,'照準地点へ秒速90で進む聖火を護送。自分が半径125以内かつ壁越しでない間だけ進む。60進むごとに半径85へ65%、到着時に半径130へ220%。8秒で消滅。途中で壁に当たると不発。','M6 42H46M13 35L20 28M26 33Q12 19 28 6Q25 17 36 20Q43 29 26 33M38 37L44 31'],
 ['走雷の蓄輪',24,6,'発動後4秒まで、実際に移動した距離を600まで蓄積。0.6秒立ち止まるか4秒経過で自分の周囲へ放電。60以上の移動が必要。威力80%＋距離÷4%、半径120＋距離×0.08。瞬間移動・壁越しの移動は加算しない。','M7 38L18 33L26 12L23 28L39 23L31 43M7 22H16M9 15H20M39 8L46 15'],
 ['照準の収束',25,5,'5秒以内に同じ地点を1.25秒狙い続けると半径105へ280%。照準が最初の地点から24を超えて動くと蓄積をリセット。射程400。壁に遮られている間は蓄積しない。','M7 18V8H17M35 8H45V18M45 34V44H35M17 44H7V34M16 26H36M26 16V36'],
 ['帰航の記憶',25,6,'2秒間の移動経路を記録し、残像が秒速400で逆走する。幅56で触れた敵へ各200%、同じ敵は一度だけ。残像は最大5秒。瞬間移動・壁越しの記録や、逆走中の壁との衝突で終了。','M9 42L21 31L12 19L32 9L45 23M35 21L45 23L43 13M20 43L31 34'],
 ['三奏の契約',22,7,'照準地点に6秒の印。印から220以内かつ壁越しでない場所で、これ以外の製作スキルを3種類発動すると半径180へ360%。同じ種類や属性違いは重複加算しない。一度だけ発動。','M26 7L45 39H7ZM26 19V29M13 39L26 29L39 39M26 29L26 7']
];
for(let [i,row]of CONTROL_SIGNATURES.entries()){
 let id='crafted_10_'+i,[name,cost,cool,desc]=row;SIGNATURE_SKILLS.push(row);
 Object.assign(GEM[id],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS[id]].name+'属性。',ability:null,signature:56+i,tags:['spell','area']});
}
const controlCastBase=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let mode=GEM[build.type]?.signature;if(mode===undefined||mode<56)return controlCastBase(build,damage,angle);
 earlySignatureCast(build,damage,angle);let s=signatureSpells.at(-1);if(!s||s.mode!==mode)return;s.flashes=[];
 if(mode===56)s.departed=false;
 if(mode===57){s.x=s.origin.x;s.y=s.origin.y;s.heading=angle;s.trail=[];}
 if(mode===58)s.ticks=0;
 if(mode===59){s.destination={x:s.x,y:s.y};s.x=s.origin.x;s.y=s.origin.y;s.travelled=0;s.nextDistance=60;}
 if(mode===60){s.last={...s.origin};s.travelled=0;s.still=0;}
 if(mode===61){s.lockPoint=null;s.lockTime=0;}
 if(mode===62){s.path=[{...s.origin}];s.replaying=false;}
 if(mode===63){s.verses=new Set();s.activated=false;}
};
const controlStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode<56)return controlStepBase(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;s.flashes=s.flashes.filter(f=>f.until>s.time);
 if(s.mode===56){
  if(dist(p,s.origin)>=70)s.departed=true;
  if(s.departed&&s.time>=.5&&dist(p,s.origin)<=35){moveActor(p,s.x-p.x,s.y-p.y);route=[];moveGoal=null;attackTarget=null;if(dist(p,s)<=8)signatureArea(s,s,130,2.8);return false;}
  return s.time<6;
 }
 if(s.mode===57){
  let dx=mouse.x-W/2,dy=mouse.y-H/2;if(Math.hypot(dx,dy)>5){let aim=unproject(mouse.x,mouse.y),desired=Math.atan2(aim.y-p.y,aim.x-p.x),turn=Math.atan2(Math.sin(desired-s.heading),Math.cos(desired-s.heading));s.heading+=clamp(turn,-Math.PI*dt,Math.PI*dt);}
  let from={x:s.x,y:s.y},to={x:s.x+Math.cos(s.heading)*240*dt,y:s.y+Math.sin(s.heading)*240*dt};if(!lineClear(from,to))return false;
  s.trail.push({...from,until:s.time+.3});s.trail=s.trail.filter(t=>t.until>s.time);s.x=to.x;s.y=to.y;
  let contacts=enemies.filter(e=>e.hp>0&&!s.seen.has(e)).map(e=>({e,t:projectileContact(from,to,e,20*s.build.radius)})).filter(v=>v.t!==null&&lineClear(from,v.e)).sort((a,b)=>a.t-b.t);
  for(let {e}of contacts){s.seen.add(e);linkStrike(s,e,1.4,from);if(s.seen.size>=3)return false;}
  return s.time<3;
 }
 if(s.mode===58){
  if(dist(p,s.origin)>12)return false;
  while(s.ticks<3&&s.time+1e-8>=(s.ticks+1)*.75){let i=s.ticks++;if(lineClear(s.origin,s))signatureArea(s,s,[90,140,200][i],[.8,1.4,2.2][i]);}
  return s.ticks<3;
 }
 if(s.mode===59){
  if(s.time>=8)return false;
  if(dist(p,s)>125||!lineClear(p,s))return true;
  let remaining=dist(s,s.destination),step=Math.min(remaining,90*dt),from={x:s.x,y:s.y};
  let ux=remaining?(s.destination.x-s.x)/remaining:0,uy=remaining?(s.destination.y-s.y)/remaining:0;
  let to={x:s.x+ux*step,y:s.y+uy*step};if(!lineClear(from,to))return false;
  while(s.nextDistance<=s.travelled+step+1e-8){let distance=s.nextDistance-s.travelled;signatureArea(s,{x:from.x+ux*distance,y:from.y+uy*distance},85,.65);s.nextDistance+=60;}
  s.x=to.x;s.y=to.y;s.travelled+=step;
  if(remaining<=step+1e-8){signatureArea(s,s,130,2.2);return false;}
  return true;
 }
 if(s.mode===60){
  let distance=dist(p,s.last),walking=distance>.05;
  if(walking&&distance<=1800*dt&&lineClear(s.last,p))s.travelled=Math.min(600,s.travelled+distance);
  s.still=walking?0:s.still+dt;s.last={x:p.x,y:p.y};s.x=p.x;s.y=p.y;
  if(s.still>=.6-1e-8||s.time>=4){if(s.travelled>=60)signatureArea(s,p,120+s.travelled*.08,.8+s.travelled/400);return false;}
  return true;
 }
 if(s.mode===61){
  if(s.time>=5)return false;
  let aim=unproject(mouse.x,mouse.y),range=dist(p,aim);
  if(range>400){let ratio=400/range;aim={x:p.x+(aim.x-p.x)*ratio,y:p.y+(aim.y-p.y)*ratio};}
  s.x=aim.x;s.y=aim.y;
  if(!lineClear(p,aim)||(s.lockPoint&&!lineClear(p,s.lockPoint))){s.lockPoint=null;s.lockTime=0;return true;}
  if(!s.lockPoint||dist(aim,s.lockPoint)>24){s.lockPoint={...aim};s.lockTime=0;}
  s.lockTime+=dt;
  if(s.lockTime>=1.25-1e-8){signatureArea(s,s.lockPoint,105,2.8);return false;}
  return true;
 }
 if(s.mode===62){
  if(s.time>=7)return false;
  if(!s.replaying){let last=s.path.at(-1),distance=dist(p,last);if(distance>1800*dt||!lineClear(last,p))return false;if(distance>1)s.path.push({x:p.x,y:p.y});if(s.time<2)return true;s.replaying=true;s.x=s.path.at(-1).x;s.y=s.path.at(-1).y;s.pathIndex=s.path.length-2;}
  let budget=400*dt;
  while(budget>0&&s.pathIndex>=0){let target=s.path[s.pathIndex],length=dist(s,target),travel=Math.min(length,budget),from={x:s.x,y:s.y},to=length?{x:s.x+(target.x-s.x)*travel/length,y:s.y+(target.y-s.y)*travel/length}:{...target};if(!lineClear(from,to))return false;
   for(let e of enemies)if(e.hp>0&&!s.seen.has(e)&&projectileContact(from,to,e,28*s.build.radius)!==null&&lineClear(from,e)){s.seen.add(e);linkStrike(s,e,2,from);}
   s.x=to.x;s.y=to.y;budget-=travel;if(length<=travel+1e-8)s.pathIndex--;else break;
  }
  return s.pathIndex>=0;
 }
 if(s.mode===63)return !s.activated&&s.time<6;
 return false;
};
// Only dispatched crafted casts count. Repeating a type with different forged
// elements still counts once, and this mark cannot recursively charge itself.
const contractCastBase=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let result=contractCastBase(build,damage,angle);
 if(GEM[build.type]?.recipe!==undefined&&GEM[build.type]?.signature!==63){for(let s of signatureSpells){if(s.mode!==63||s.activated||s.time>=6||dist(p,s)>220||!lineClear(p,s))continue;s.verses.add(build.type);if(s.verses.size===3){s.activated=true;signatureArea(s,s,180,3.6);}}}
 return result;
};
const controlPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 controlPaintBase();const renderList=signatureRenderList(56,63);if(!renderList.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of renderList){if(s.mode<56)continue;let color=ELEMENTS[s.build.elements[0]].color;
  for(let flash of s.flashes)paintLinkLine(flash.a,flash.b,color,3);
  if(s.mode===56){for(let point of [s.origin,s]){groundRing(point.x,point.y,35,color,3);boundarySigil(point,28,color,s.time*2,6);}if(s.departed)paintLinkLine(s.origin,s,color,2);else groundRing(s.origin.x,s.origin.y,70,color,1);}
  if(s.mode===57){for(let t of s.trail)groundRing(t.x,t.y,4,color,1);boundaryShard(s.x,s.y,s.heading,26,color,12);}
  if(s.mode===58){groundRing(s.origin.x,s.origin.y,12,color,2);let radius=[90,140,200][Math.min(2,s.ticks)]*s.build.radius;groundRing(s.x,s.y,radius,color,2);boundarySigil(s,radius*.5,color,s.time,3+s.ticks*3);}
  if(s.mode===59){let escorted=dist(p,s)<=125&&lineClear(p,s);groundRing(s.x,s.y,125,escorted?color:'#77828c',1);groundRing(s.x,s.y,18+Math.sin(s.time*8)*4,color,3);boundarySigil(s,30,color,s.time*2,4);groundRing(s.destination.x,s.destination.y,130*s.build.radius,color,1);paintLinkLine(s,s.destination,color,1);if(escorted)paintLinkLine(p,s,color,3);}
  if(s.mode===60){groundRing(p.x,p.y,(120+s.travelled*.08)*s.build.radius,color,1);boundarySigil(p,25+s.travelled/15,color,s.time*4,3+Math.floor(s.travelled/100));groundRing(p.x,p.y,18+35*Math.min(1,s.still/.6),color,3);}
  if(s.mode===61){let point=s.lockPoint||s;groundRing(point.x,point.y,105*s.build.radius,color,1);groundRing(point.x,point.y,24,color,2);boundarySigil(point,70*(1-Math.min(1,s.lockTime/1.25))+12,color,0,4);}
  if(s.mode===62){for(let i=1;i<s.path.length;i++)paintLinkLine(s.path[i-1],s.path[i],color,1);if(s.replaying){boundarySigil(s,27,color,s.time*3,4);groundRing(s.x,s.y,28*s.build.radius,color,2);}else groundRing(p.x,p.y,24,color,2);}
  if(s.mode===63){groundRing(s.x,s.y,180*s.build.radius,color,1);boundarySigil(s,40,color,s.time,3);for(let i=0;i<3;i++){let a=i*Math.PI*2/3;groundRing(s.x+Math.cos(a)*55,s.y+Math.sin(a)*55,i<s.verses.size?12:6,color,i<s.verses.size?4:1);}}
 }ctx.restore();
};

