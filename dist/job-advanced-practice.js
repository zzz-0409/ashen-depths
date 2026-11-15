// Optional lessons observe real combat outcomes; they grant no items, XP, or saved progress.
let advancedPractice=null;
function advancedPracticeActive(){return !!(advancedPractice&&started&&!dead&&p.hp>0&&advancedPractice.owner===p&&advancedPractice.job===currentJob()&&advancedPractice.village===villageOpen);}
const advancedStopBase=stopJobPractice;stopJobPractice=()=>{advancedPractice=null;shots=shots.filter(s=>!s.jobPracticeShot);advancedStopBase();};
const advancedStartBase=startJobPractice;startJobPractice=()=>{stopJobPractice();return advancedStartBase();};
function startAdvancedJobPractice(){
 if(!started||dead||!advancedJob())return false;
 if(currentJob()===15){if(villageOpen){say('契約竜の騎乗は野外で練習できます');return false;}if(!p.activeDragon){say('村の転職所で竜と契約してください');return false;}}
 else if(!villageOpen){say('上位連携の練習は村で開始できます');return false;}
 stopJobPractice();tutorialStop();resetClassTransient();advancedPractice={owner:p,job:currentJob(),village:villageOpen,time:0,nextStrike:3,shotSent:false,ward:null,allies:new Set()};
 menuSurface='';closePanel();say(currentJob()===15?'野外練習 · 敵の攻撃に注意して騎乗ブレスを命中':'上位連携の練習 · 村のサンドバッグを使います');return true;
}
const advancedReportBase=reportAdvancedJobAction;reportAdvancedJobAction=(kind,source)=>{
 advancedReportBase(kind,source);if(!advancedPracticeActive()||paused||advancedPractice.job!==kind)return;
 if(kind===14){advancedPractice.allies.add(source);if(advancedPractice.allies.size<3)return;}
 stopJobPractice();say('上位連携の練習完了 · 実際の連携成功を確認しました');
};
function advancedPracticeInstruction(){
 let s=advancedPractice,key=padActive?(padProfile.buttons.jobAction===10?'左スティック押し込み':'Button '+padProfile.buttons.jobAction):'C';
 if(s.job===8)return saintAfterimage?'残像から60～450移動し、残像と自分の間にサンドバッグを挟んで'+key+'。3秒以内に命中させる。':'通常攻撃を3回当てて'+key+'で解放。残像を使う連携を練習します。';
 if(s.job===9)return paladinBastion?'結界の後ろで練習弾を待つ。結界で弾を防ぐと完了。':jobGuard&&jobBlocked>0?key+'で反撃し、結界を残す。':key+'で堅守。練習攻撃まで'+Math.max(0,s.nextStrike-s.time).toFixed(1)+'秒（最大1ダメージ）。';
 if(s.job===10)return archmageSeals?(archmageSeals.points.length?key+'で星印を起爆。印の範囲内のサンドバッグに命中させる。':'強化中にジェムスキルをサンドバッグへ当て、星印を置く。'):'通常攻撃で魔力を3つため、'+key+'で解放。';
 if(s.job===11)return sniperFocus?(sniperFocus.still>=1.25?'照準完了。標識を付けたサンドバッグへ通常攻撃。':'1.25秒静止して照準を完成させる。移動やスキル使用でやり直し。'):'サンドバッグを狙い、'+key+'で標識を付ける。';
 if(s.job===12)return dancerSequence?(dancerSequence.target?'サンドバッグの周囲を90度以上回り込み、5秒以内に通常攻撃。':'5秒以内に通常攻撃を当てて舞印を付ける。'):'練習攻撃まで'+Math.max(0,s.nextStrike-s.time).toFixed(1)+'秒。直前1秒以内に'+key+'で受け流す（最大1ダメージ）。';
 if(s.job===13)return priestGrace?(priestGrace.charge>0?'祈りの円内で'+key+'。近くのサンドバッグへ光波を当てる。':'円内でHP・MPを実際に回復。満タンならジェムスキルでMPを使う。'):'サンドバッグの近くで'+key+'。祈りの回復を光波へ変える練習です。';
 if(s.job===14)return companions.some(c=>c.rallyTime>0)?'サンドバッグへ通常攻撃で集中指示。強化攻撃を3体とも命中（'+s.allies.size+'/3）。':companions.length<3?'通常攻撃で召喚獣を3体呼ぶ。':companionRecall?(beastAssembly>=1?key+'で進撃。3体に連携攻撃を付与。':'3体が近くに1秒そろうのを待つ。'):key+'で集合。3体を呼び戻す。';
 return dragonRideActive()?'騎乗中に敵を狙って通常攻撃。契約竜のブレスを命中させる。':key+'で騎乗（SP25）。契約竜のブレスの射程で戦います。';
}
function advanceAdvancedPractice(dt){
 if(!advancedPractice)return;if(!advancedPracticeActive()){stopJobPractice();return;}if(paused||!Number.isFinite(dt)||dt<=0)return;
 let s=advancedPractice;s.time+=dt;
 if((s.job===9&&!paladinBastion&&!(jobGuard&&jobBlocked>0)||s.job===12&&!dancerSequence)&&s.time>=s.nextStrike){s.nextStrike=s.time+10;if(p.hp>1)hurt(1);else say('生命瓶で回復してから練習を続けてください');}
 if(s.job===9&&paladinBastion&&s.ward!==paladinBastion){s.ward=paladinBastion;s.shotSent=false;}
 if(s.job===9&&paladinBastion&&!s.shotSent&&p.hp>1){
  let at=paladinBastion,from=[0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=>({x:at.x+Math.cos(a)*180,y:at.y+Math.sin(a)*180})).find(pos=>lineClear(pos,at));
  if(from){shots.push({...from,vx:(at.x-from.x)/2,vy:(at.y-from.y)/2,life:2.5,enemy:true,damage:1,tint:'#8ce4d7',jobPracticeShot:true});s.shotSent=true;}
 }
}
const advancedUpdateBase=update;update=dt=>{advancedUpdateBase(dt);advanceAdvancedPractice(dt);};
const advancedPracticeActionBase=useJobAction;useJobAction=()=>{let assembling=advancedPracticeActive()&&currentJob()===14&&companionRecall&&beastAssembly>=1,s=advancedPractice,result=advancedPracticeActionBase();if(result&&assembling&&advancedPractice===s&&!companionRecall)s.allies.clear();return result;};
const practiceShotBase=advanceProjectile;advanceProjectile=(shot,dt)=>{if(shot.jobPracticeShot&&(!advancedPracticeActive()||p.hp<=1)){shot.life=0;return;}return practiceShotBase(shot,dt);};
const advancedHudBase=drawHud;drawHud=()=>{advancedHudBase();if(!advancedPractice)return;jobPracticeHud.hidden=!advancedPracticeActive()||paused;if(jobPracticeHud.hidden)return;let html='<b>'+profession().name+' · 上位連携の練習</b><p>'+advancedPracticeInstruction()+'</p><small>説明を開くと一時停止。練習はいつでも終了できます。</small><button onclick="stopJobPractice()">練習を終える</button>';if(jobPracticeHud.innerHTML!==html)jobPracticeHud.innerHTML=html;};
const advancedGuideBase=jobGuideContent;jobGuideContent=(topic,selected)=>{let html=advancedGuideBase(topic,selected);if(topic==='advanced'&&selected===currentJob()&&advancedJob()){let available=selected===15?!villageOpen:villageOpen;html+=available?'<button onclick="startAdvancedJobPractice()">上位連携を実際に練習</button>':'<p class="muted">'+(selected===15?'竜騎乗は野外で練習できます。':'上位連携の練習は村で開始できます。')+'</p>';}return html;};
const advancedGuideHtmlBase=professionGuideHtml;professionGuideHtml=(...args)=>advancedGuideHtmlBase(...args)+(advancedPractice?'<button onclick="stopJobPractice();showProfessionGuide(false,\'advanced\')">上位連携の練習を終える</button>':'');
