// Four-sided normal attacks trade stamina for one equipped skill's recovery.
NAMED_STAR_BOONS.Pyx=['四方の帰航','同じ討伐敵が生きている間に、8秒以内に4方向から通常攻撃を命中させると、SP20を消費し、装備・割当済みで待ち時間が最長のスキル1種類を即座に再使用可能にする（再準備10秒）。1攻撃につき1方向。SP不足・待機中スキルなしなら、残り時間内の次の通常攻撃で再判定。別の敵への通常攻撃で方向を記録し直す。訓練標的・召喚指示・仲間の攻撃・継続ダメージ・追撃・必殺技は対象外。地域移動・訓練リセット・加護解除で記録は消える。'];
{let star=TREE_STARS.find(s=>s.code==='Pyx');if(!star)throw Error('Missing Pyxis');namedBoonIndices.Pyx=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Pyx);treeOwnershipRef=null;treeOwnershipLength=-1;}
let pyxisTarget=null,pyxisMask=0,pyxisTime=0,pyxisCooldown=0,pyxisPulse=0,pyxisResolving=false;
function resetPyxis(){pyxisTarget=null;pyxisMask=0;pyxisTime=pyxisCooldown=pyxisPulse=0;}
const pyxisResetBase=resetNamedBoons;resetNamedBoons=()=>{pyxisResetBase();resetPyxis();};
const pyxisSyncBase=syncNamedBoons;syncNamedBoons=()=>{pyxisSyncBase();if(!hasStarBoon(namedBoonIndices.Pyx))resetPyxis();};
function pyxisEnemyValid(e){return !!(e&&e.hp>0&&!e.dummy&&SPECIES[e.species]&&enemies.includes(e));}
function pyxisDirection(player,target){let dx=player.x-target.x,dy=player.y-target.y;if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<1)return -1;return ((Math.floor((Math.atan2(dy,dx)+Math.PI/4)/(Math.PI/2))%4)+4)%4;}
function advancePyxis(dt){syncNamedBoons();if(dead||!p||p.hp<=0){resetPyxis();return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;pyxisCooldown=Math.max(0,pyxisCooldown-dt);pyxisPulse=Math.max(0,pyxisPulse-dt);pyxisTime=Math.max(0,pyxisTime-dt);if(!pyxisTime||!pyxisEnemyValid(pyxisTarget)){pyxisTarget=null;pyxisMask=0;pyxisTime=0;}}
const pyxisUpdateBase=update;update=dt=>{let active=started&&!paused&&!dead; if(active)advancePyxis(dt);return pyxisUpdateBase(dt);};
const pyxisHitBase=hit;hit=(e,d)=>{
 syncNamedBoons();let owner=p,before=e?.hp,direction=pyxisDirection(p||{},e||{}),eligible=started&&!paused&&!dead&&p.hp>0&&pyxisCooldown<=0&&hasStarBoon(namedBoonIndices.Pyx)&&!pyxisResolving&&!namedBoonResolving&&cadenceNormalAction&&classHitKind==='normal'&&!classNormalHit&&!treeExplosion&&!e?.dotTick&&pyxisEnemyValid(e)&&direction>=0&&dist(p,e)<=220&&lineClear(p,e)&&Number.isFinite(d)&&d>0;
 let result,previous=pyxisResolving;pyxisResolving=true;try{result=pyxisHitBase(e,d);}finally{pyxisResolving=previous;}
 if(eligible&&p===owner&&!dead&&p.hp>0&&e.hp<before){
  if(!pyxisEnemyValid(e)){pyxisTarget=null;pyxisMask=0;pyxisTime=0;return result;}
  if(pyxisTarget!==e||pyxisTime<=0){pyxisTarget=e;pyxisMask=0;pyxisTime=8;}
  pyxisMask|=1<<direction;
  if(pyxisMask===15&&p.sp>=20){let skill=longestHorSkill();if(skill){for(let action of skill.actions)cd[action]=0;p.sp-=20;pyxisTarget=null;pyxisMask=0;pyxisTime=0;pyxisCooldown=10;pyxisPulse=.65;burst(p.x,p.y,70,'#9ce5d5');playSound('arc',p.x,p.y);}}
 }
 return result;
};
const pyxisDrawBase=drawGroundEffects;drawGroundEffects=()=>{
 pyxisDrawBase();if(!started||paused||dead||!p||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.Pyx))return;
 if(pyxisTime>0&&pyxisEnemyValid(pyxisTarget)&&visibleAt(pyxisTarget.x,pyxisTarget.y)){
  let e=pyxisTarget;ctx.save();for(let i=0;i<4;i++){let a=i*Math.PI/2,x=e.x+Math.cos(a)*64,y=e.y+Math.sin(a)*64,q=project(x,y),filled=!!(pyxisMask&(1<<i));ctx.strokeStyle=filled?'#c6fff1':'#688b95';ctx.fillStyle=filled?'#84e5ca':'#101c24';ctx.lineWidth=filled?3:1;ctx.beginPath();ctx.moveTo(q.x,q.y-7);ctx.lineTo(q.x+5,q.y);ctx.lineTo(q.x,q.y+7);ctx.lineTo(q.x-5,q.y);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();
 }
 if(pyxisPulse>0&&visibleAt(p.x,p.y)){let q=project(p.x,p.y);ctx.save();ctx.globalAlpha=pyxisPulse/.65;ctx.strokeStyle='#c6fff1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y-60,24+(1-pyxisPulse/.65)*20,0,Math.PI*2);ctx.stroke();ctx.restore();}
};
