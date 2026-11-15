// Priest trades the remaining healing field for a burst charged only by its actual recovery.
let priestGrace=null;
const PRIEST_GRACE_DESC='祈りの場で実際に回復したHP・マナを恩寵として蓄積。HP最大値の10%またはマナ30の回復で満蓄積（合算可）。円内で専用操作を再入力すると祈りを終了し、設置地点の半径160へ100～300%の光波。過剰回復・生命瓶・自然回復は含まない。';
ADVANCED_JOBS[5][1]+=' '+PRIEST_GRACE_DESC;
function priestGraceActive(s){return !!(s&&s.owner===p&&currentJob()===13&&started&&!dead&&p.hp>0&&s.prayer===jobPrayer&&jobPrayer?.time>0);}
const priestRecoveryBase=onJobPrayerRecovery;onJobPrayerRecovery=(prayer,hp,mp)=>{priestRecoveryBase(prayer,hp,mp);let s=priestGrace;if(priestGraceActive(s)&&s.prayer===prayer)s.charge=Math.min(1,s.charge+hp/s.hpCapacity+mp/30);};
const priestActionBase=useJobAction;useJobAction=()=>{
 if(priestGrace&&!priestGraceActive(priestGrace))priestGrace=null;let s=priestGrace;
 if(s){if(paused||playerAction||s.age<.4||s.charge<=0||dist(p,s.prayer)>100||!lineClear(p,s.prayer))return false;let at=s.prayer;priestGrace=null;jobPrayer=null;jobCooldown=Math.max(jobCooldown,1);let previous=classHitKind;classHitKind='job';try{for(let e of enemies)if(e.hp>0&&dist(e,at)<=160&&lineClear(at,e))jobLinkedHit(e,s.power*(1+2*s.charge),13);}finally{classHitKind=previous;}burst(at.x,at.y,160,'#fff0b0');playSound('frost',at.x,at.y);return true;}
 let result=priestActionBase();if(result&&currentJob()===13&&jobPrayer)priestGrace={owner:p,prayer:jobPrayer,age:0,charge:0,hpCapacity:Math.max(1,maxhp()*.1),power:damage()};return result;
};
function advancePriestGrace(dt){let s=priestGrace;if(!s)return;if(!priestGraceActive(s)){priestGrace=null;return;}if(paused||!Number.isFinite(dt)||dt<=0)return;s.age+=dt;}
const priestUpdateBase=update;update=dt=>{advancePriestGrace(dt);priestUpdateBase(dt);if(priestGrace&&!priestGraceActive(priestGrace))priestGrace=null;};
const priestResetBase=resetClassTransient;resetClassTransient=()=>{priestGrace=null;return priestResetBase();};
const priestGroundBase=drawGroundEffects;drawGroundEffects=()=>{priestGroundBase();let s=priestGrace;if(!priestGraceActive(s)||s.charge<=0)return;groundRing(s.prayer.x,s.prayer.y,30+50*s.charge,'#fff0b0',3);};
const priestHudBase=drawHud;drawHud=()=>{priestHudBase();let s=priestGrace;if(!priestGraceActive(s)||paused)return;jobHudTarget().textContent='恩寵 '+Math.floor(s.charge*100+1e-7)+'% · '+(s.charge<=0?'回復で蓄積':dist(p,s.prayer)>100||!lineClear(p,s.prayer)?'祈りの円に戻る':'光波へ転換')+' · '+(padActive?(padProfile.buttons.jobAction===10?'Lスティック押込':'Btn '+padProfile.buttons.jobAction):'C');jobHudTarget().title=PRIEST_GRACE_DESC;};
