// Optional, transient practice. Existing saved equipment-tutorial indices are untouched.
let jobPractice=null;
const jobPracticeHud=document.createElement('aside');jobPracticeHud.id='jobPracticeHud';jobPracticeHud.className='tutorial-instruction';jobPracticeHud.hidden=true;document.body.append(jobPracticeHud);
function stopJobPractice(){jobPractice=null;jobPracticeHud.hidden=true;}
function practiceActive(){return !!(jobPractice&&started&&!dead&&villageOpen&&jobPractice.owner===p&&jobPractice.job===currentJob());}
function finishJobPractice(){stopJobPractice();say('職業の練習完了 · 装備画面からいつでも再練習できます');}
function startJobPractice(){
 if(!started||dead||!villageOpen)return false;
 if(combatProfessionType()===7&&!p.activeDragon){showDragonBonds();say('先に竜と契約すると、呼び出しを練習できます');return false;}
 tutorialStop();jobPractice={owner:p,job:currentJob(),phase:0,time:0,nextStrike:3,blocked:false,inside:0};
 menuSurface='';closePanel();say('職業の練習 · 村の東側のサンドバッグを使います');return true;
}
function practiceInstruction(){
 let id=combatProfessionType(),s=jobPractice,button=padActive?(padProfile.buttons.jobAction===10?'左スティック押し込み':'Button '+padProfile.buttons.jobAction):'C',attack=padActive?tutorialButton('attack'):'サンドバッグをクリック';
 if(id===0)return attack+'で通常攻撃を3回命中（'+jobMeter+'/3）。'+button+'で連撃を解放。';
 if(id===1)return s.blocked?'防御成功。'+button+'でもう一度操作し、反撃を放つ。':button+'で堅守。'+Math.max(0,s.nextStrike-s.time).toFixed(1)+'秒後に練習攻撃。SPを消費して防ぎます。';
 if(id===2)return s.phase?'4秒以内にジェムスキルをサンドバッグへ命中させる。':attack+'で魔力を3つ蓄積（'+jobMeter+'/3）。'+button+'で強化詠唱を開始。';
 if(id===3)return s.phase?'標識を付けたサンドバッグへ通常攻撃を命中させる。':'サンドバッグへ照準を合わせ、'+button+'で標識を付ける。';
 if(id===4)return '合図まで'+Math.max(0,s.nextStrike-s.time).toFixed(1)+'秒。攻撃の直前1秒以内に'+button+'で受け流し。練習攻撃は最大1ダメージです。';
 if(id===5)return s.phase?'祈りの円の中で2秒待つ（'+s.inside.toFixed(1)+'/2秒）。':button+'で祈りの場を設置。SP20が必要です。';
 if(id===6)return companions.length>=3?button+'で3体に集合を指示。':'通常攻撃で編成した味方を3体呼ぶ（'+companions.length+'/3）。空振りでも呼べます。';
 return companions.some(c=>c.dragon)?button+'で契約画面を確認。野外では同じ操作がブレス指示になります。':'通常攻撃で契約竜を呼び出す。空振りでも呼べます。';
}
const practiceActionBase=useJobAction;useJobAction=()=>{let watching=practiceActive(),id=combatProfessionType(),meter=jobMeter,guard=jobGuard,result=practiceActionBase();if(!result||!watching||!practiceActive())return result;
 if(id===0&&meter>=3)finishJobPractice();
 if(id===1&&guard&&!jobGuard&&jobPractice.blocked)finishJobPractice();
 if(id===2&&meter>=3)jobPractice.phase=1;
 if(id===3)jobPractice.phase=1;
 if(id===5){jobPractice.phase=1;jobPractice.inside=0;}
 if(id===6&&companions.length>=3&&companionRecall)finishJobPractice();
 if(id===7&&companions.some(c=>c.dragon)&&menuSurface==='dragonBonds')finishJobPractice();
 return result;
};
const practiceHurtBase=hurt;hurt=d=>{let watching=practiceActive(),id=combatProfessionType(),parry=jobParry>0&&p.inv<=0,before=jobBlocked,result=practiceHurtBase(d);if(watching&&practiceActive()&&d>0){if(id===1&&jobBlocked>before)jobPractice.blocked=true;if(id===4&&parry&&jobParry===0)finishJobPractice();}return result};
const practiceHitBase=hit;hit=(e,d)=>{let watch=practiceActive()&&combatProfessionType()===3&&jobPractice.phase&&e===jobMark&&jobMarkTime>0&&classHitKind==='normal',hp=e?.hp,training=e?.trainingHits||0,result=practiceHitBase(e,d);if(watch&&e&&(e.hp<hp||(e.trainingHits||0)>training))finishJobPractice();return result};
const practiceSpellBase=spellHit;spellHit=(e,d,b)=>{let watch=practiceActive()&&combatProfessionType()===2&&jobPractice.phase&&jobMagicTime>0,hp=e?.hp,training=e?.trainingHits||0,result=practiceSpellBase(e,d,b);if(watch&&e&&(e.hp<hp||(e.trainingHits||0)>training))finishJobPractice();return result};
function advanceJobPractice(dt){
 if(!jobPractice)return;if(!practiceActive()){stopJobPractice();return;}if(paused||!Number.isFinite(dt)||dt<=0)return;
 let s=jobPractice,id=combatProfessionType();s.time+=dt;
 if((id===1&&!s.blocked||id===4)&&s.time>=s.nextStrike){s.nextStrike=s.time+10;if(p.hp>1)hurt(1);else say('HPが少ないため練習攻撃を待ちます。生命瓶で回復してください');}
 if(id===2&&s.phase&&jobMagicTime<=0)s.phase=0;
 if(id===3&&s.phase&&(jobMarkTime<=0||!jobMark||jobMark.hp<=0))s.phase=0;
 if(id===5&&s.phase){if(!jobPrayer){s.phase=0;s.inside=0;}else if(dist(p,jobPrayer)<=100&&lineClear(p,jobPrayer)){s.inside+=dt;if(s.inside>=2)finishJobPractice();}}
}
const practiceUpdateBase=update;update=dt=>{practiceUpdateBase(dt);advanceJobPractice(dt)};
const practiceHudBase=drawHud;drawHud=()=>{practiceHudBase();jobPracticeHud.hidden=!practiceActive()||paused;if(jobPracticeHud.hidden)return;let html='<b>'+profession().name+' · 専用操作の練習</b><p>'+practiceInstruction()+'</p><small>説明を開くと練習は一時停止します。</small><button onclick="stopJobPractice()">練習を終える</button>';if(jobPracticeHud.innerHTML!==html)jobPracticeHud.innerHTML=html;};
const practiceGuideBase=professionGuideHtml;professionGuideHtml=compare=>practiceGuideBase(compare)+(compare?'':'<button onclick="startJobPractice()" '+(!villageOpen?'disabled':'')+'>村で職業の練習</button>'+(jobPractice?'<button onclick="stopJobPractice();showProfessionGuide()">練習を終える</button>':''));
const practiceWorldBase=loadWorld;loadWorld=(...args)=>{stopJobPractice();return practiceWorldBase(...args)};
const practiceTutorialBase=tutorialStart;tutorialStart=(...args)=>{stopJobPractice();return practiceTutorialBase(...args)};
