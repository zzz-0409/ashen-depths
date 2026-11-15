NAMED_STAR_BOONS.UMi=['北極の帰還','必殺技の発動成功地点に12秒間の道標を残す。致命傷を受け、MP50以上・道標から500以内・射線が通り、帰還先が通行可能で敵と重ならない場合、MP50を消費して道標へ帰還しHPを最大値の20%に戻す。帰還後は1秒無敵、移動指示と構えを解除。道標は消費し再準備60秒。ほかの致死防止が先に救済した場合は消費しない。再準備中の必殺技では道標は作れない。新たな必殺技で道標を置換。地域移動・死亡・訓練リセット・加護解除で道標と再準備を解除。'];
{let star=TREE_STARS.find(s=>s.code==='UMi');if(!star)throw Error('Missing Ursa Minor');namedBoonIndices.UMi=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.UMi);treeOwnershipRef=null;treeOwnershipLength=-1;}
let ursaMinorMark=null,ursaMinorCooldown=0;
function resetUrsaMinor(){ursaMinorMark=null;ursaMinorCooldown=0;}
const ursaMinorResetBase=resetNamedBoons;resetNamedBoons=()=>{ursaMinorResetBase();resetUrsaMinor();};
const ursaMinorSyncBase=syncNamedBoons;syncNamedBoons=()=>{ursaMinorSyncBase();if(!hasStarBoon(namedBoonIndices.UMi))resetUrsaMinor();};
function ursaMinorMarkValid(s){return !!(s&&s.owner===p&&s.world===dungeon&&s.time>0&&hasStarBoon(namedBoonIndices.UMi));}
function ursaMinorLanding(s){return dist(p,s)<=500&&lineClear(p,s,13)&&passable(s.x,s.y,13)&&enemies.every(e=>e.hp<=0||dist(e,s)>13+enemyHitRadius(e));}
const ursaMinorUltimateBase=activateUltimate;activateUltimate=(...args)=>{
 syncNamedBoons();let owner=p,world=dungeon,origin=p&&{x:p.x,y:p.y},eligible=started&&!paused&&!dead&&p?.hp>0&&ursaMinorCooldown<=0&&hasStarBoon(namedBoonIndices.UMi),result=ursaMinorUltimateBase(...args);
 if(result&&eligible&&owner===p&&world===dungeon&&!dead&&p.hp>0)ursaMinorMark={...origin,owner,world,time:12};return result;
};
const ursaMinorHurtBase=hurt;hurt=d=>{
 syncNamedBoons();let owner=p,s=ursaMinorMark,eligible=started&&!paused&&!dead&&p?.hp>0&&Number.isFinite(d)&&d>0&&ursaMinorMarkValid(s),result=ursaMinorHurtBase(d);
 if(eligible&&p===owner&&!dead&&p.hp<=0&&ursaMinorMark===s&&ursaMinorMarkValid(s)&&p.mp>=50&&ursaMinorLanding(s)){
  ursaMinorMark=null;ursaMinorCooldown=60;p.mp-=50;p.x=s.x;p.y=s.y;p.hp=Math.max(1,maxhp()*.2);p.inv=Math.max(p.inv||0,1);route=[];moveGoal=null;attackTarget=null;lootTarget=null;playerAction=null;playerMoving=false;burst(p.x,p.y,85,'#b5ddff');playSound('heal',p.x,p.y);say('北極の帰還');
 }return result;
};
function advanceUrsaMinor(dt){
 syncNamedBoons();if(dead||!p||p.hp<=0){resetUrsaMinor();return;}if(ursaMinorMark&&!ursaMinorMarkValid(ursaMinorMark))ursaMinorMark=null;if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 ursaMinorCooldown=Math.max(0,ursaMinorCooldown-dt);if(ursaMinorMark){ursaMinorMark.time-=dt;if(ursaMinorMark.time<=1e-8)ursaMinorMark=null;}
}
const ursaMinorUpdateBase=update;update=dt=>{advanceUrsaMinor(dt);return ursaMinorUpdateBase(dt);};
const ursaMinorGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 ursaMinorGroundBase();let s=ursaMinorMark;if(!started||paused||dead||!ursaMinorMarkValid(s)||!visibleAt(s.x,s.y))return;let q=project(s.x,s.y),ready=p.mp>=50&&dist(p,s)<=500;groundRing(s.x,s.y,26,ready?'#a9d8ff':'#667482',2);ctx.save();ctx.strokeStyle=ready?'#e0efff':'#667482';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x,q.y-52);ctx.lineTo(q.x+7,q.y-35);ctx.lineTo(q.x+22,q.y-30);ctx.lineTo(q.x+7,q.y-25);ctx.lineTo(q.x,q.y-8);ctx.lineTo(q.x-7,q.y-25);ctx.lineTo(q.x-22,q.y-30);ctx.lineTo(q.x-7,q.y-35);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(q.x,q.y-30,29,-Math.PI/2,-Math.PI/2+Math.PI*2*s.time/12);ctx.stroke();ctx.restore();
};

const ursaMinorDescriptionBase=starCompletionDescription;starCompletionDescription=index=>{let text=ursaMinorDescriptionBase(index);if(TREE_STARS[index]?.code!=='UMi'||!hasStarBoon(namedBoonIndices.UMi))return text;return text+' 現在：'+(ursaMinorCooldown>0?'再準備 '+Math.ceil(ursaMinorCooldown)+'秒':ursaMinorMarkValid(ursaMinorMark)?'道標 '+Math.ceil(ursaMinorMark.time)+'秒'+(p.mp<50?'（MP不足）':''):'道標なし · 必殺技で設置');};
