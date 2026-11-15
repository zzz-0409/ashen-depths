const WARD_SIGNATURES=[
 ['星守りの防壁',28,5,'狙った地点に半径120の防壁を3秒設置。触れた敵弾を最大6発消す。近接攻撃は防げない。','M10 13H42V34L26 46L10 34ZM17 21H35M17 29H35'],
 ['蓄光の盾',26,6,'3秒間、スキル基礎威力の150%まで被ダメージを吸収。使い切るか時間切れで、吸収した量の50%を周囲150へ返す。','M14 10H38V32L26 44L14 32ZM26 16V35M20 24H32'],
 ['癒やしの泉',30,8,'狙った地点に4秒の泉。毎秒、半径140の中にいる自分の最大ライフを2.5%回復。範囲外では回復しない。','M26 8Q8 28 13 38Q26 51 39 38Q44 28 26 8ZM20 32H32M26 26V38'],
 ['共鳴の烙印',22,4,'照準付近の敵に6秒の印。次の直撃4回へ各30%の追加ダメージ。継続ダメージや追加ダメージから再発動しない。','M26 8L42 18V36L26 46L10 36V18ZM18 20L34 34M34 20L18 34'],
 ['停滞の檻',27,5,'狙った地点の半径150へ、1秒ごとに3回、30%のダメージと0.8秒拘束。ボスの拘束は0.2秒。','M10 42V16L26 7L42 16V42M18 12V42M34 12V42M8 42H44'],
 ['帰路の標',16,.8,'発動地点に6秒の標を置く。同じスキルをもう一度使うと標へ帰還して消える。帰還にもマナを使い、壁は越えられない。','M26 7L42 26L26 45L10 26ZM18 26H34M25 19L18 26L25 33'],
 ['時溜めの印',24,5,'照準付近の敵へ2秒の印。その間に与えたダメージの30%を最後に追加する（スキル基礎威力400%まで）。倒した敵には発動しない。','M14 8H38M14 44H38M17 8Q17 20 26 26Q35 32 35 44M35 8Q35 20 26 26Q17 32 17 44'],
 ['命火の交換',0,6,'現在ライフの20%を払い、マナ25回復。周囲170へ基礎威力80%＋支払ったライフの150%の一撃。ライフは1以上残る。','M26 8L32 23L42 18Q44 42 26 46Q8 42 11 24L20 30Z']
];
for(let [i,row]of WARD_SIGNATURES.entries()){
 let [name,cost,cool,desc]=row,id='crafted_13_'+i;SIGNATURE_SKILLS.push(row);
 Object.assign(GEM[id],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS[id]].name+'属性。',ability:null,signature:24+i,tags:['spell','area']});
}
const wardSignatureCast=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let mode=GEM[build.type]?.signature;if(mode===undefined||mode<24)return wardSignatureCast(build,damage,angle);
 if(mode===29){let anchor=signatureSpells.find(s=>s.mode===29&&s.time<6);if(anchor){moveActor(p,anchor.x-p.x,anchor.y-p.y);route=[];moveGoal=null;attackTarget=null;signatureSpells=signatureSpells.filter(s=>s!==anchor);burst(p.x,p.y,70,ELEMENTS[build.elements[0]].color);return;}}
 earlySignatureCast(build,damage,angle);let s=signatureSpells.at(-1);if(!s||s.mode!==mode)return;
 s.next=1;s.used=0;s.absorbed=0;s.recorded=0;s.pool=damage*1.5;s.finished=false;
 if(mode===25||mode===29||mode===31){s.x=p.x;s.y=p.y;}
 if(mode===27||mode===30){if(!s.target){signatureSpells.pop();say('照準の近くに敵がいません');return;}signatureSpells=signatureSpells.filter(other=>other===s||other.mode!==mode||other.target!==s.target);}
 if(mode===31){let spent=Math.min(Math.floor(p.hp*.2),Math.max(0,p.hp-1));p.hp-=spent;p.mp=Math.min(100,p.mp+25);let amount=damage*.8+spent*1.5;for(let e of meleeTargets(p,0,170,build.radius,false))spellHit(e,amount,s.build);burst(p.x,p.y,170*build.radius,ELEMENTS[build.elements[0]].color);s.finished=true;}
};
function releaseStoredShield(s){if(s.finished)return;s.finished=true;if(s.absorbed>0)signatureArea({...s,damage:s.absorbed},p,150,.5);}
let wardEchoActive=false;
const wardHitBase=hit;hit=(e,damage)=>{
 if(wardEchoActive||e.hp<=0)return wardHitBase(e,damage);
 let before=e.hp,score=dpsRun?.active?dpsRun.damage:0,recorders=signatureSpells.filter(s=>s.mode===30&&s.target===e&&!s.finished&&s.time<2);
 wardHitBase(e,damage);
 let mark=e.hp>0&&!e.dotTick&&signatureSpells.find(s=>s.mode===27&&s.target===e&&s.used<4&&s.time<6);
 if(mark){mark.used++;wardEchoActive=true;try{wardHitBase(e,damage*.3);}finally{wardEchoActive=false;}}
 let dealt=e.dummy?(dpsRun?.active?dpsRun.damage-score:Math.max(0,damage)*(mark?1.3:1)):Math.max(0,before-Math.max(0,e.hp));for(let s of recorders)s.recorded+=dealt;
};
const wardHurtBase=hurt;hurt=damage=>{
 let shield=started&&!paused&&!dead&&p.inv<=0&&Number.isFinite(damage)&&damage>0?signatureSpells.find(s=>s.mode===25&&!s.finished&&s.pool>0&&s.time<3):null;
 if(!shield)return wardHurtBase(damage);
 let taken=Math.min(damage,shield.pool);shield.pool-=taken;shield.absorbed+=taken;
 if(damage>taken)wardHurtBase(damage-taken);
 if(shield.pool<=0&&!dead)releaseStoredShield(shield);
};
const wardProjectileBase=advanceProjectile;advanceProjectile=(shot,dt)=>{
 if(shot.enemy&&shot.life>0&&dt>0){let step=Math.min(dt,shot.life),from={x:shot.x,y:shot.y},end={x:shot.x+shot.vx*step,y:shot.y+shot.vy*step},playerAt=projectileContact(from,end,p,ENEMY_PROJECTILE_HIT_RADIUS);
  let blocks=signatureSpells.filter(s=>s.mode===24&&s.time<3&&s.used<6).map(s=>({s,t:projectileContact(from,end,s,120*s.build.radius)})).filter(v=>v.t!==null&&(playerAt===null||v.t<=playerAt)).sort((a,b)=>a.t-b.t);
  for(let {s,t}of blocks){let point={x:from.x+(end.x-from.x)*t,y:from.y+(end.y-from.y)*t};if(!lineClear(from,point))break;s.used++;shot.x=point.x;shot.y=point.y;shot.life=0;burst(point.x,point.y,24,ELEMENTS[s.build.elements[0]].color);return;}
 }
 return wardProjectileBase(shot,dt);
};
const wardSignatureStep=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode<24)return wardSignatureStep(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;if(s.finished)return false;
 if(s.mode===24)return s.used<6&&s.time<3;
 if(s.mode===25){s.x=p.x;s.y=p.y;if(s.time>=3){releaseStoredShield(s);return false;}return true;}
 if(s.mode===26||s.mode===28){if(s.time>=s.next){s.next++;s.ticks++;if(s.mode===26){if(dist(p,s)<=140*s.build.radius&&lineClear(p,s))p.hp=Math.min(maxhp(),p.hp+maxhp()*.025);}else{for(let e of meleeTargets(s,0,150,s.build.radius,false)){spellHit(e,s.damage*.3,s.build);if(e.hp>0)e.reactionStun=Math.max(e.reactionStun||0,e.boss?.2:.8);}burst(s.x,s.y,150*s.build.radius,ELEMENTS[s.build.elements[0]].color);}}return s.ticks<(s.mode===26?4:3);}
 if(s.mode===27||s.mode===30){if(!s.target||s.target.hp<=0)return false;s.x=s.target.x;s.y=s.target.y;if(s.mode===27)return s.used<4&&s.time<6;
  if(s.time<2)return true;s.finished=true;if(s.recorded>0){wardEchoActive=true;try{wardHitBase(s.target,Math.min(s.recorded*.3,s.damage*4));}finally{wardEchoActive=false;}burst(s.x,s.y,55,ELEMENTS[s.build.elements[0]].color);}return false;
 }
 return s.mode===29&&s.time<6;
};
const wardSignaturePaint=paintSignatureSpells;paintSignatureSpells=()=>{
 wardSignaturePaint();ctx.save();ctx.globalCompositeOperation='lighter';
 for(let s of signatureSpells){if(s.mode<24||s.mode>=32||s.finished||!visibleAt(s.x,s.y))continue;let color=ELEMENTS[s.build.elements[0]].color,r=s.mode===24?120:s.mode===25?65:s.mode===26?140:s.mode===28?150:35;groundRing(s.x,s.y,r*s.build.radius,color,s.mode===24?4:2);
  let pos=project(s.x,s.y);if(s.mode===27||s.mode===30){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pos.x-12,pos.y-65);ctx.lineTo(pos.x+12,pos.y-40);ctx.moveTo(pos.x+12,pos.y-65);ctx.lineTo(pos.x-12,pos.y-40);ctx.stroke();}
  if(s.mode===24||s.mode===28){for(let n=0;n<6;n++){let a=n*Math.PI/3+s.time*.4,base=project(s.x+Math.cos(a)*r*s.build.radius,s.y+Math.sin(a)*r*s.build.radius);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(base.x,base.y-35);ctx.stroke();}}
  if(s.mode===26)glowAt(pos,55,color,.2+.15*Math.sin(s.time*6));
  if(s.mode===29){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pos.x,pos.y-45);ctx.lineTo(pos.x+15,pos.y-20);ctx.lineTo(pos.x,pos.y);ctx.lineTo(pos.x-15,pos.y-20);ctx.closePath();ctx.stroke();}
 }
 ctx.restore();
};
