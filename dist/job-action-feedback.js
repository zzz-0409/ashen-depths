// Read-only availability hints. Actual actions remain the authority, including upper-job overrides.
function jobActionBlockReason(){
 if(!started||dead||p.hp<=0)return '戦闘不能';
 if(paused)return 'メニューを閉じる';
 if(playerAction)return '動作の終了を待つ';
 const sp=n=>p.sp<n?'SP '+n+'必要':'',cool=()=>jobCooldown>0?'再使用まで '+jobCooldown.toFixed(1)+'秒':'';
 if(dragonRideActive())return '';
 if(priestGraceActive(priestGrace)){
  if(priestGrace.age<.4)return '祈りの展開を待つ';
  if(priestGrace.charge<=0)return '祈りでHP・MPを回復する';
  if(dist(p,priestGrace.prayer)>100||!lineClear(p,priestGrace.prayer))return '祈りの円に戻る';
  return '';
 }
 if(archmageSealActive(archmageSeals)&&archmageSeals.points.length)return archmageSeals.age<.4?'星印の展開を待つ':sp(20);
 if(saintTrailValid(saintAfterimage)){
  if(cool())return cool();if(sp(12))return sp(12);
  let distance=dist(p,saintAfterimage);
  if(distance<60)return '残像から離れる';
  if(distance>450)return '残像に近づく';
  return lineClear(p,saintAfterimage)?'':'残像との間に障害物';
 }
 if(cool())return cool();
 let id=combatProfessionType();
 if(id===7&&villageOpen)return '';
 let cost=[15,0,0,10,20,20,0,25][id];if(sp(cost))return sp(cost);
 if((id===0||id===2)&&jobMeter===0)return '通常攻撃を当てて蓄積';
 if(id===3){let aim=unproject(mouse.x,mouse.y);if(!enemies.some(e=>e.hp>0&&dist(e,aim)<=140&&dist(e,p)<=650&&lineClear(p,e)))return '射線の通る敵を狙う';}
 if(id===7&&!p.activeDragon)return '村の転職所で竜と契約';
 if(id===1&&!jobGuard&&sp(10))return sp(10);
 return '';
}
let jobFeedbackAt=-Infinity,jobFeedbackReason='';
const feedbackActionBase=useJobAction;useJobAction=()=>{
 let result=feedbackActionBase();
 if(result){jobFeedbackReason='';return result;}
 if(!started||paused||dead||p.hp<=0)return result;
 let reason=jobActionBlockReason(),now=performance.now();
 if(reason&&(reason!==jobFeedbackReason||now-jobFeedbackAt>=1000)){say(reason);jobFeedbackAt=now;jobFeedbackReason=reason;}
 return result;
};
function paintJobActionFeedback(){
 if(jobHudTarget().hidden)return;
 let reason=jobActionBlockReason(),id=combatProfessionType(),status='';
 // Upper-job displays already describe their additional systems.
 if(!advancedJob()){
  if(id===1&&jobGuard)status='反撃 '+Math.round((1+Math.min(3,jobBlocked/Math.max(1,maxhp()*.1)))*100)+'%';
  if(id===2&&jobMagicTime>0)status='魔力 +'+Math.round(jobMagic*100)+'% · '+jobMagicTime.toFixed(1)+'秒';
  if(id===3&&jobMarkTime>0&&jobMark?.hp>0)status='標識 '+jobMarkTime.toFixed(1)+'秒';
  if(id===4&&jobParry>0)status='受け流し '+jobParry.toFixed(1)+'秒';
  if(id===5&&jobPrayer?.time>0)status='祈り '+jobPrayer.time.toFixed(1)+'秒';
 }
 if(status)jobHudTarget().textContent+=' · '+status;
 jobHudTarget().setAttribute('data-job-ready',reason?'false':'true');
 jobHudTarget().setAttribute('aria-label',jobHudTarget().textContent+(reason?'。'+reason:'。使用可能'));
 if(reason)jobHudTarget().title+='\n'+reason;
}
const feedbackHudBase=drawHud;drawHud=()=>{feedbackHudBase();paintJobActionFeedback();};
