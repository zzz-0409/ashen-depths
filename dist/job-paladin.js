// Paladin leaves a stationary projectile ward after releasing stored guard damage.
let paladinBastion=null;
const PALADIN_BASTION_DESC='堅守で攻撃を防いでから反撃すると、足元に5秒間の結界を設置。半径120へ入る敵弾を1～6発消す。防いだ量が最大HPの5%増えるごとに防げる弾が1発増加。近接・地面攻撃は防げない。再設置で置き換え。';
ADVANCED_JOBS[1][1]+=' '+PALADIN_BASTION_DESC;
function paladinBastionActive(s){return !!(s&&s.owner===p&&currentJob()===9&&started&&!dead&&p.hp>0&&s.left>0&&s.time>0);}
const paladinActionBase=useJobAction;useJobAction=()=>{let release=currentJob()===9&&jobGuard&&jobBlocked>0,blocked=jobBlocked,result=paladinActionBase();if(result&&release&&!jobGuard)paladinBastion={x:p.x,y:p.y,owner:p,time:5,left:Math.min(6,1+Math.floor(blocked/Math.max(1,maxhp()*.05)))};return result;};
const paladinProjectileBase=advanceProjectile;advanceProjectile=(shot,dt)=>{
 let s=paladinBastion;if(paladinBastionActive(s)&&shot.enemy&&shot.life>0&&Number.isFinite(dt)&&dt>0&&!paused){
  let step=Math.min(dt,shot.life),from={x:shot.x,y:shot.y},to={x:shot.x+shot.vx*step,y:shot.y+shot.vy*step},at=projectileContact(from,to,s,120),playerAt=projectileContact(from,to,p,ENEMY_PROJECTILE_HIT_RADIUS);
  if(at!==null&&(playerAt===null||at<=playerAt)){
   let point={x:from.x+(to.x-from.x)*at,y:from.y+(to.y-from.y)*at};
   let earlier=signatureSpells.some(w=>{if(!((w.mode===24&&w.time<3&&w.used<6)||(w.mode===53&&w.time<3&&w.reflected<3)))return false;let t=projectileContact(from,to,w,120*w.build.radius);return t!==null&&t<=at&&(playerAt===null||(w.mode===53?t<playerAt:t<=playerAt))&&lineClear(from,{x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t});});
   if(!earlier&&lineClear(from,point)){s.left--;reportAdvancedJobAction(9);shot.x=point.x;shot.y=point.y;shot.life=0;burst(point.x,point.y,28,'#a8ffe6');if(s.left===0)paladinBastion=null;return;}
  }
 }return paladinProjectileBase(shot,dt);
};
function advancePaladinBastion(dt){let s=paladinBastion;if(!s)return;if(!paladinBastionActive(s)){paladinBastion=null;return;}if(paused||!Number.isFinite(dt)||dt<=0)return;s.time-=dt;if(s.time<=0)paladinBastion=null;}
const paladinUpdateBase=update;update=dt=>{advancePaladinBastion(dt);paladinUpdateBase(dt);};
const paladinResetBase=resetClassTransient;resetClassTransient=()=>{paladinBastion=null;return paladinResetBase();};
const paladinGroundBase=drawGroundEffects;drawGroundEffects=()=>{paladinGroundBase();let s=paladinBastion;if(!paladinBastionActive(s))return;groundRing(s.x,s.y,120,'#8ce4d7',3);groundRing(s.x,s.y,105,'#568f85',1);for(let i=0;i<s.left;i++){let a=i*Math.PI/3;groundRing(s.x+Math.cos(a)*112,s.y+Math.sin(a)*112,8,'#d8fff2',2);}};
const paladinHudBase=drawHud;drawHud=()=>{paladinHudBase();let s=paladinBastion;if(!paladinBastionActive(s)||paused)return;jobHudTarget().textContent+=' · 結界 '+s.left+'発 / '+s.time.toFixed(1)+'秒';jobHudTarget().title+=' '+PALADIN_BASTION_DESC;};
