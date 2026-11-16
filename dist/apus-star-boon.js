NAMED_STAR_BOONS.Aps=['風鳥のすり抜け','無敵でない間、敵の直進弾が自分に当たらず距離20超～60以内を通り過ぎるとSP12・MP6回復（各上限まで、再準備3秒）。接近中ではなく最接近点を越えた時に判定。同じ弾からは一度だけ。壁越し・途中で消えた弾・反射した味方弾・近接・地面攻撃は対象外。満タンでは回復せず、通過済みの弾を後から利用できない。死亡・地域移動・訓練リセット・加護解除・再読み込みで準備をリセット。'];
{const star=TREE_STARS.find(s=>s.code==='Aps');if(!star)throw Error('Missing Apus');namedBoonIndices.Aps=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Aps);treeOwnershipRef=null;treeOwnershipLength=-1;}
let apusCooldown=0,apusPulse=0,apusWorld=null,apusPassed=new WeakSet();
function resetApus(){apusCooldown=apusPulse=0;apusWorld=typeof dungeon==='undefined'?null:dungeon;apusPassed=new WeakSet();}
const apusResetBase=resetNamedBoons;resetNamedBoons=()=>{apusResetBase();resetApus();};
const apusSyncBase=syncNamedBoons;syncNamedBoons=()=>{apusSyncBase();if(apusWorld!==dungeon||!hasStarBoon(namedBoonIndices.Aps)||dead||p?.hp<=0)resetApus();};
function apusPassPoint(shot,dt){if(!shot.enemy||shot.life<=0||!Number.isFinite(dt)||dt<=0||!Number.isFinite(shot.vx)||!Number.isFinite(shot.vy))return null;const duration=Math.min(dt,shot.life),dx=shot.x-p.x,dy=shot.y-p.y,speed2=shot.vx**2+shot.vy**2;if(speed2<1e-8)return null;const dot=dx*shot.vx+dy*shot.vy,t=-dot/speed2;if(dot>=0||t>duration+1e-9)return null;const q={x:shot.x+shot.vx*t,y:shot.y+shot.vy*t},r=dist(p,q);return r>ENEMY_PROJECTILE_HIT_RADIUS&&r<=60&&lineClear(p,q)?q:null;}
const apusProjectileBase=advanceProjectile;
advanceProjectile=(shot,dt)=>{if(!shot.enemy||!started||paused||dead||!p||p.hp<=0||!hasStarBoon(namedBoonIndices.Aps))return apusProjectileBase(shot,dt);syncNamedBoons();const owner=p,world=dungeon,eligible=started&&!paused&&!dead&&p?.hp>0&&p.inv<=0&&hasStarBoon(namedBoonIndices.Aps)&&!apusPassed.has(shot),point=eligible?apusPassPoint(shot,dt):null,vx=shot.vx,vy=shot.vy;
 const result=apusProjectileBase(shot,dt);
 if(point&&p===owner&&dungeon===world&&!dead&&p.hp>0&&p.inv<=0&&shot.enemy&&shot.life>0&&(shot.x-point.x)*vx+(shot.y-point.y)*vy>=-1e-8&&lineClear(p,point)){
  apusPassed.add(shot);if(apusCooldown<=0){ensureClassResources();const sp=Math.max(0,Math.min(12,maxsp()-p.sp)),mp=Math.max(0,Math.min(6,100-p.mp));if(sp>0||mp>0){p.sp+=sp;p.mp+=mp;apusCooldown=3;apusPulse=.6;playSound('heal',p.x,p.y);}}
 }return result;};
function advanceApus(dt){syncNamedBoons();if(!started||paused||!Number.isFinite(dt)||dt<=0)return;apusCooldown=Math.max(0,apusCooldown-dt);apusPulse=Math.max(0,apusPulse-dt);}
const apusUpdateBase=update;update=dt=>{advanceApus(dt);return apusUpdateBase(dt);};
const apusGroundBase=drawGroundEffects;drawGroundEffects=()=>{apusGroundBase();if(!started||paused||dead||!p||apusPulse<=0||!hasStarBoon(namedBoonIndices.Aps)||!visibleAt(p.x,p.y))return;const q=project(p.x,p.y);ctx.save();ctx.strokeStyle='#a6e6ee';ctx.lineWidth=2;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(q.x+side*12,q.y-65);ctx.quadraticCurveTo(q.x+side*(22+apusPulse*25),q.y-95,q.x+side*33,q.y-70);ctx.stroke();}ctx.restore();};
