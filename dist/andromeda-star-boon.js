// Hold ground to bind one real opponent; movement and obstruction release the chain.
NAMED_STAR_BOONS.And=['縛星の身代わり','半径12以内に1秒留まると、180以内の最も近い討伐敵と鎖でつながる。次の被弾でMP15を消費し、その攻撃の威力を30%減らして、同じ威力で鎖の敵に無属性の反撃（再準備5秒）。HPが減らなければ消費しない。MP不足では保留。移動・敵との距離240超・壁で鎖が切れる。致命傷では反撃しない。地域移動・訓練リセット・加護解除で準備を消す。'];
{let star=TREE_STARS.find(s=>s.code==='And');if(!star)throw Error('Missing Andromeda');namedBoonIndices.And=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.And);treeOwnershipRef=null;treeOwnershipLength=-1;}
let andromedaAnchor=null,andromedaHold=0,andromedaTarget=null,andromedaCooldown=0,andromedaScan=0,andromedaPulse=0,andromedaResolving=false;
function resetAndromeda(){andromedaAnchor=null;andromedaHold=andromedaCooldown=andromedaScan=andromedaPulse=0;andromedaTarget=null;}
const andromedaResetBase=resetNamedBoons;resetNamedBoons=()=>{andromedaResetBase();resetAndromeda();};
const andromedaSyncBase=syncNamedBoons;syncNamedBoons=()=>{andromedaSyncBase();if(!hasStarBoon(namedBoonIndices.And))resetAndromeda();};
function andromedaEnemyValid(e,range=240){return !!(e&&e.hp>0&&!e.dummy&&SPECIES[e.species]&&enemies.includes(e)&&dist(p,e)<=range+1e-8&&lineClear(p,e));}
function andromedaLinkValid(){return !!(andromedaAnchor&&dist(p,andromedaAnchor)<=12+1e-8&&andromedaEnemyValid(andromedaTarget));}
function advanceAndromeda(dt){
 syncNamedBoons();if(dead||!p||p.hp<=0){resetAndromeda();return;}
 if(!started||paused||!Number.isFinite(dt)||dt<=0||!hasStarBoon(namedBoonIndices.And))return;
 andromedaPulse=Math.max(0,andromedaPulse-dt);
 if(andromedaCooldown>0){let before=andromedaCooldown;andromedaCooldown=Math.max(0,before-dt);dt=Math.max(0,dt-before);if(dt<=0)return;}
 if(andromedaTarget&&!andromedaLinkValid()){andromedaTarget=null;andromedaAnchor=null;andromedaHold=0;}
 if(!andromedaAnchor||dist(p,andromedaAnchor)>12+1e-8){andromedaAnchor={x:p.x,y:p.y};andromedaHold=0;andromedaScan=0;andromedaTarget=null;}
 if(andromedaTarget)return;
 andromedaHold=Math.min(1,Math.round((andromedaHold+dt)*1e6)/1e6);if(andromedaHold<1)return;
 andromedaScan-=dt;if(andromedaScan>0)return;andromedaScan=.2;
 let nearest=null,best=Infinity;for(let e of enemies)if(andromedaEnemyValid(e,180)){let d=dist(p,e);if(d<best){nearest=e;best=d;}}
 andromedaTarget=nearest;
}
const andromedaUpdateBase=update;update=dt=>{let active=started&&!paused&&!dead,result=andromedaUpdateBase(dt);if(active)advanceAndromeda(dt);return result;};
const andromedaHurtBase=hurt;hurt=d=>{
 syncNamedBoons();let owner=p,target=andromedaTarget,before=p?.hp,enabled=started&&!paused&&!dead&&p?.hp>0&&p.inv<=0&&Number.isFinite(d)&&d>0&&!andromedaResolving&&hasStarBoon(namedBoonIndices.And)&&andromedaCooldown<=0&&p.mp>=15&&andromedaLinkValid();
 // Reserve MP before downstream mana shields can spend it; refund unused protection.
 if(enabled)owner.mp-=15;let result;
 try{result=andromedaHurtBase(enabled?d*.7:d);}catch(error){if(enabled)owner.mp=Math.min(100,owner.mp+15);throw error;}
 if(enabled&&(p!==owner||!(p.hp<before)))owner.mp=Math.min(100,owner.mp+15);
 if(enabled&&p===owner&&p.hp<before){
  andromedaTarget=null;andromedaAnchor=null;andromedaHold=0;andromedaCooldown=5;andromedaPulse=.5;
  if(!dead&&p.hp>0&&andromedaEnemyValid(target)){
   let kind=classHitKind,resolving=namedBoonResolving;classHitKind='boon';namedBoonResolving=true;andromedaResolving=true;
   try{hit(target,d*.3);burst(target.x,target.y,45,'#b8cfff');playSound('arc',target.x,target.y);}finally{classHitKind=kind;namedBoonResolving=resolving;andromedaResolving=false;}
  }
 }
 return result;
};
const andromedaGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 andromedaGroundBase();if(!started||paused||dead||!p||namedBoonOwner!==p||!hasStarBoon(namedBoonIndices.And)||!visibleAt(p.x,p.y))return;
 let linked=andromedaLinkValid();if(!linked&&!andromedaPulse)return;
 let q=project(p.x,p.y);ctx.save();ctx.strokeStyle=p.mp>=15?'#adcfff':'#75818f';ctx.lineWidth=2;
 if(linked){let t=project(andromedaTarget.x,andromedaTarget.y),dx=t.x-q.x,dy=t.y-q.y;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(q.x,q.y-28);ctx.lineTo(t.x,t.y-25);ctx.stroke();for(let i=1;i<=5;i++){let x=q.x+dx*i/6,y=q.y-28+(dy+3)*i/6;ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.beginPath();ctx.ellipse(0,0,6,3,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}
 if(andromedaPulse){ctx.globalAlpha=andromedaPulse/.5;ctx.strokeStyle='#e4edff';ctx.beginPath();ctx.arc(q.x,q.y-45,25+(1-andromedaPulse/.5)*25,0,Math.PI*2);ctx.stroke();}ctx.restore();
};
