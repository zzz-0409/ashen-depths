// Secondary instructions step aside during combat; action labels and status stay visible.
let combatHudOwner=null,combatHudUntil=0;
function combatHudThreat(){
 if(!started||!p||dead||villageOpen||p.tutorial?.active)return false;
 return enemies.some(e=>e.hp>0&&!e.dummy&&dist(e,p)<=480&&visibleAt(e.x,e.y)&&(e.boss||e.aware||e.state==='attack')&&lineClear(e,p));
}
function updateCombatHud(){
 if(combatHudOwner!==p){combatHudOwner=p;combatHudUntil=0;}
 if(!started||!p||dead||villageOpen||p.tutorial?.active)combatHudUntil=0;
 else if(!paused&&combatHudThreat())combatHudUntil=clock+3;
 document.body.classList.toggle('combat-hud-compact',!!(started&&p&&!paused&&!dead&&!villageOpen&&!p.tutorial?.active&&clock<combatHudUntil));
}
const combatHudBase=drawHud;drawHud=()=>{combatHudBase();updateCombatHud();};
