// Keep health/element information on every enemy; show normal-enemy names only at focus.
let enemyNameFocus=null;
function enemyFocusEligible(e){return !!(e&&e.hp>0&&visibleAt(e.x,e.y)&&lineClear(p,e));}
function resolveEnemyNameFocus(){
 if(!started||paused||dead||!p||!Number.isFinite(mouse.x)||!Number.isFinite(mouse.y))return null;
 if(enemies.includes(attackTarget)&&enemyFocusEligible(attackTarget))return attackTarget;
 let aim=unproject(mouse.x,mouse.y),nearest=null,distance=Infinity,body=null,depth=-Infinity;
 // A farther candidate cannot win the final radius test. Use the largest living
 // enemy radius to preserve nearest-enemy ordering even for mixed-size crowds.
 let focusRange=55;for(let e of enemies)if(e.hp>0)focusRange=Math.max(focusRange,enemyHitRadius(e));
 for(let e of enemies){
  if(e.hp<=0||!visibleAt(e.x,e.y))continue;
  let d=dist(e,aim),bodyCandidate=!padActive&&e.x+e.y>depth&&enemyScreenContains(e,mouse.x,mouse.y);
  if(!bodyCandidate&&d>=focusRange)continue;
  if((d>=distance&&!bodyCandidate)||!lineClear(p,e))continue;
  if(d<distance){nearest=e;distance=d;}
  if(bodyCandidate){body=e;depth=e.x+e.y;}
 }
 if(body)return body;return nearest&&distance<Math.max(55,enemyHitRadius(nearest))?nearest:null;
}
enemyNameVisible=e=>!!(e?.hp>0&&(e.boss||e===enemyNameFocus));
const nameFocusDrawBase=draw;draw=()=>{enemyNameFocus=resolveEnemyNameFocus();return nameFocusDrawBase();};
const nameFocusGroundBase=drawGroundEffects;drawGroundEffects=()=>{nameFocusGroundBase();let e=enemyNameFocus;if(!paused&&!dead&&e&&e!==attackTarget&&e.hp>0)groundRing(e.x,e.y,enemyHitRadius(e)+5,'#ffefb5',2);};
const nameFocusWorldBase=loadWorld;loadWorld=(...args)=>{enemyNameFocus=null;return nameFocusWorldBase(...args);};
