// Four position/target-priority abilities, keeping original recipe/save IDs.
const POSITION_SIGNATURES=[
 ['双影の転位',27,6,'照準付近の敵と、その180以内の別の敵を選ぶ。0.8秒後、2体の位置を交換して各180%。交換した敵の攻撃を中断し、次の攻撃まで最低0.65秒。壁・狭い足場・ボス・訓練標的は交換不可だが、射線が通れば攻撃は当たる。','M8 14H42L34 6M44 38H10L18 46M13 20V32M39 20V32'],
 ['対岸の誓約',24,5,'敵1体を5秒間標的にする。発動時の自分と反対側へ回り込み、対象から150以内・方向差120度以上・射線が通ると360%。起動まで0.3秒。敵自身が移動しても発動時の方向が基準。','M26 7V16M26 36V45M14 13Q-2 26 14 39M38 13Q54 26 38 39M18 26H34M29 21L34 26L29 31'],
 ['狭間の天秤',30,6,'照準地点の半径180から最大6体を記録。0.9秒後、円内に残り射線が通る対象へ総威力600%を均等分配。1体なら600%、6体なら各100%。途中で入った敵には当たらない。','M26 7V45M10 45H42M8 17H44M13 17L5 32H21ZM39 17L31 32H47Z'],
 ['王手の烙印',26,7,'敵1体と、その周囲180の護衛を近い順に最大3体記録。6秒以内に護衛全員を生かしたまま本命を討伐すると、各護衛へ220%の追撃。護衛が先に倒れる・消える・本命から350を超える・壁で遮られると不発。護衛がいない時、訓練標的には発動しない。本命が自分から500を超える・壁・死亡・地域移動で解除。範囲補正で護衛の選定範囲は変わらない。再発動で置き換える。','M26 6L36 16L26 26L16 16ZM7 34L13 28L19 34L13 40ZM33 34L39 28L45 34L39 40ZM20 46H32M13 28L20 21M39 28L32 21']
];
for(let [i,row]of POSITION_SIGNATURES.entries()){
 let id='crafted_7_'+i,[name,cost,cool,desc]=row;SIGNATURE_SKILLS.push(row);
 Object.assign(GEM[id],{name,cost,cool,desc:desc+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS[id]].name+'属性。',ability:null,signature:64+i,tags:['spell','area']});
}
const positionCastBase=castCraftedSkill;castCraftedSkill=(build,damage,angle)=>{
 let result=positionCastBase(build,damage,angle),mode=GEM[build.type]?.signature;
 if(mode===undefined||mode<64||mode>67)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==mode)return result;
 const near=(center,radius)=>enemies.filter(e=>e.hp>0&&dist(e,center)<=radius&&lineClear(s.origin,e)).sort((a,b)=>dist(a,center)-dist(b,center));
 if(mode===64){s.pair=s.target?[s.target,...near(s.target,180).filter(e=>e!==s.target).slice(0,1)]:[];if(s.pair.length<2)signatureSpells.pop();}
 if(mode===65){if(!s.target){signatureSpells.pop();return result;}let dx=p.x-s.target.x,dy=p.y-s.target.y,len=Math.hypot(dx,dy);s.side=len?{x:dx/len,y:dy/len}:{x:-Math.cos(angle),y:-Math.sin(angle)};}
 if(mode===66)s.targets=near(s,180*build.radius).slice(0,6);
 if(mode===67){
  signatureSpells=signatureSpells.filter(v=>v.mode!==67||v===s);
  Object.assign(s,{owner:p,world:dungeon,finished:false,pending:false,guards:[]});
  if(s.target&&!s.target.dummy&&Object.hasOwn(SPECIES,s.target.species))s.guards=near(s.target,180).filter(e=>e!==s.target&&!e.dummy&&Object.hasOwn(SPECIES,e.species)&&lineClear(s.target,e)).slice(0,3);
  if(!s.guards.length||!kingMarkValid(s)){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('護衛がいる本命を狙ってください');}
 }
 return result;
};
const positionStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode<64||s.mode>67)return positionStepBase(s,dt);
 if(s.mode===67){
  if(!kingMarkValid(s)){s.finished=true;return false;}
  if(paused||!Number.isFinite(dt)||dt<=0)return true;
  if(s.pending){s.finished=true;for(const guard of s.guards)if(guard.hp>0&&enemies.includes(guard))linkStrike(s,guard,2.2,s.target);return false;}
  s.time+=dt;if(s.time+1e-8>=6){s.finished=true;return false;}return true;
 }
 s.time=Math.round((s.time+dt)*1000000)/1000000;s.flashes=s.flashes.filter(f=>f.until>s.time);
 if(s.mode===64){
  if(s.pair.some(e=>e.hp<=0||!enemies.includes(e)))return false;if(s.time<.8)return true;
  let [a,b]=s.pair,clear=lineClear(s.origin,a)&&lineClear(s.origin,b)&&lineClear(a,b);
  if(clear&&!a.boss&&!b.boss&&!a.dummy&&!b.dummy&&passable(b.x,b.y,enemyHitRadius(a))&&passable(a.x,a.y,enemyHitRadius(b))){let old={x:a.x,y:a.y};a.x=b.x;a.y=b.y;b.x=old.x;b.y=old.y;for(let e of [a,b]){e.path=[];e.nav=0;e.attack=null;e.state='idle';e.elapsed=0;e.struck=true;e.t=Math.max(e.t||0,.65);}}
  for(let e of s.pair)if(lineClear(s.origin,e))linkStrike(s,e,1.8,s.origin);return false;
 }
 if(s.mode===65){
  let e=s.target;if(e.hp<=0||!enemies.includes(e)||s.time>=5)return false;
  let dx=p.x-e.x,dy=p.y-e.y,len=Math.hypot(dx,dy);
  if(s.time>=.3&&len>1&&len<=150&&(dx*s.side.x+dy*s.side.y)/len<=-.5+1e-8&&lineClear(p,e)){linkStrike(s,e,3.6,p);return false;}return true;
 }
 if(s.mode===66){
  if(s.time<.9)return true;let targets=s.targets.filter(e=>e.hp>0&&enemies.includes(e)&&dist(e,s)<=180*s.build.radius&&lineClear(s,e));
  for(let e of targets)linkStrike(s,e,6/targets.length,s);return false;
 }
 return false;
};
const positionPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 positionPaintBase();ctx.save();ctx.globalCompositeOperation='lighter';
 for(let s of signatureSpells){if(s.mode<64||s.mode>67)continue;let color=ELEMENTS[s.build.elements[0]].color;
  if(s.mode===64){for(let e of s.pair){groundRing(e.x,e.y,30,color,2);boundarySigil(e,38,color,s.time*3,4);}paintLinkLine(s.pair[0],s.pair[1],color,3);}
  if(s.mode===65){let e=s.target;groundRing(e.x,e.y,150,color,1);let goal={x:e.x-s.side.x*100,y:e.y-s.side.y*100};boundarySigil(goal,25,color,s.time*2,3);paintLinkLine(goal,e,color,2);}
  if(s.mode===66){groundRing(s.x,s.y,180*s.build.radius,color,2);boundarySigil(s,60*(1-s.time/.9)+15,color,s.time,6);for(let e of s.targets)if(e.hp>0)paintLinkLine(s,e,color,1);}
  if(s.mode===67&&kingMarkValid(s)){boundarySigil(s.target,42,color,-s.time,4);for(let e of s.guards)if(e.hp>0){groundRing(e.x,e.y,24,color,2);paintLinkLine(e,s.target,color,2);}}
 }ctx.restore();
};

function kingMarkValid(s,dying=false){
 return s.owner===p&&s.world===dungeon&&!s.finished&&s.time<6&&!dead&&p?.hp>0&&s.target&&(s.pending||enemies.includes(s.target)&&(s.target.hp>0||dying))&&dist(p,s.target)<=500&&lineClear(p,s.target)&&s.guards.length>0&&s.guards.every(e=>e.hp>0&&enemies.includes(e)&&dist(s.target,e)<=350&&lineClear(s.target,e));
}
const kingMarkKillBase=worldKill;
worldKill=e=>{
 const watches=started&&!paused&&e&&!e.rewarded&&!e.dummy&&Number.isFinite(e.hp)&&e.hp<=0?signatureSpells.filter(s=>s.mode===67&&s.target===e&&!s.pending&&kingMarkValid(s,true)):[];
 const result=kingMarkKillBase(e);
 if(e?.rewarded)for(const s of watches)if(signatureSpells.includes(s)&&kingMarkValid(s,true))s.pending=true;
 return result;
};
