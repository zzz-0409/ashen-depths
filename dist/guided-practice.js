// Keep instructions in sync with the slot-first loadout. No practice action
// bypasses the real equip/socket/bind transaction or its save validation.
LESSONS[6][2]='胸防具を選んで{accept} → 練習用の胸甲を選んで{accept} →「装備」で{accept}。光る項目を順番に選びます。';
LESSONS[6][3]='胸防具 → 練習用の胸甲 → 装備。矢印が次の操作を示します。';
LESSONS[8][2]='胸防具の青い穴を選んで{accept} → 手持ちの青いジェム →「この穴に装着する」で{accept}。';
LESSONS[8][3]='先にソケットを選び、次にジェムを選んで装着します。';
LESSONS[9][2]='スキル枠1を選んで{accept} → 装着済みのスキルを選び{accept} →「このスキルを割り当てる」で{accept}。';
let practiceDisabled=[],practiceTimer=0,practiceBusy=false,practiceHintKey='';
function practiceLesson(){return started&&tutorialState().active&&!dead?LESSONS[tutorialState().step]?.[0]:null;}
function practiceRestore(){for(const [el,disabled]of practiceDisabled){el.disabled=disabled;el.classList.remove('practice-blocked');}practiceDisabled=[];document.querySelectorAll('.practice-target').forEach(el=>el.classList.remove('practice-target'));}
function practiceHint(){const id=practiceLesson(),target=loadoutRoute.target,detail=document.activeElement?.closest?.('.icon-pane');
 if(id==='equip')return !paused?['L','装備画面を開く']:!target?['A','① 胸防具を選ぶ']:!detail?['A','② 練習用の胸甲を選ぶ']:['A','③「装備」で決定'];
 if(id==='gems')return paused?['A','光る「スキルジェム」を選ぶ']:['↑','十字キー↑でジェム画面を開く'];
 if(paused&&['sp-recovery','ultimate-charge','ultimate'].includes(id))return ['B','画面を閉じて練習へ戻る'];
 if(id==='socket')return !paused?['I','装備画面を開く']:!target?['A','① 胴防具を選ぶ']:target.type!=='socket'?['A','② 青いソケットを選ぶ']:!detail?['A','② 青いジェムを選ぶ']:['A','③「この穴に装着する」で決定'];
 if(id==='bind')return !paused?['↑','ジェム画面を開く']:!target?['A','① スキル枠1を選ぶ']:!detail?['A','② 使うスキルを選ぶ']:['A','③「このスキルを割り当てる」で決定'];
 const action={move:'左スティック',attack:tutorialButton('attack'),skill1:tutorialButton('skill1'),skill2:tutorialButton('skill2'),dash:tutorialButton('dash'),inventory:tutorialButton('inventory'),'sp-recovery':'ZR → 離す','ultimate-charge':'ZR',ultimate:tutorialButton('ultimate')};return [action[id]||'A',LESSONS[tutorialState().step]?.[1]||''];
}
function practiceRefresh(){if(practiceBusy||!practiceLesson()&&!practiceDisabled.length&&!$('practicePrompt'))return;practiceBusy=true;try{
 practiceRestore();const id=practiceLesson();document.body.classList.toggle('guided-practice',!!id);if(!id){$('practicePrompt')?.remove();practiceHintKey='';return;}
 if(id==='equip'&&p.armor?.name==='練習用の胸甲'&&!p.bag.some(it=>it.name==='練習用の胸甲')){tutorialEvent('equip');return;}
 let prompt=$('practicePrompt');if(!prompt){prompt=document.createElement('aside');prompt.id='practicePrompt';prompt.setAttribute('aria-live','polite');document.body.append(prompt);}
 prompt.hidden=tutorialGuideOpen;const hint=practiceHint(),key=hint.join('|');if(key!==practiceHintKey){prompt.innerHTML='<span class="practice-button-demo" aria-hidden="true">'+gearEscape(hint[0])+'</span><strong>'+gearEscape(hint[1])+'</strong><small>光る項目を操作 · Bで一段戻る</small>';practiceHintKey=key;}
 if(!paused){const action={attack:0,skill1:1,skill2:2,dash:3},wanted=['inventory','equip','socket'].includes(id)?'inventory':['gems','bind'].includes(id)?'gems':null;
  for(const el of document.querySelectorAll('header button,footer button,#classResources button')){const cmd=el.getAttribute('onclick')||'',allow=cmd.includes('toggleAudio')||cmd.includes('tutorialShow')||wanted&&cmd.includes("panel('"+wanted+"')")||id==='ultimate'&&cmd.includes('activateUltimate')||id in action&&cmd.includes('cast('+action[id]+')')||['sp-recovery','ultimate-charge'].includes(id)&&cmd.includes('cast(0)')||id==='sp-recovery'&&cmd.includes('cast(3)');if(allow&&!el.disabled)el.classList.add('practice-target');else{practiceDisabled.push([el,el.disabled]);el.disabled=true;el.classList.add('practice-blocked');}}
  return;
 }if(tutorialGuideOpen)return;
 const card=$('card'),target=loadoutRoute.target,controls=Array.from(card.querySelectorAll('button,input,select,summary')),allowed=new Set();
 const add=selector=>card.querySelectorAll(selector).forEach(el=>allowed.add(el));
 add('.close,.context-help,#tutorialInline button,.loadout-path button');
 if(id==='gems'&&menuSurface==='inventory'){
  add('button[onclick="panel(\'gems\')"]');
 }else if(['sp-recovery','ultimate-charge','ultimate'].includes(id)&&['inventory','gems'].includes(menuSurface)){
  // Close the loadout to return to the field exercise.
 }else if(id==='equip'&&menuSurface==='inventory'){
  if(!target)add('.icon-entry[data-icon-key="slot:armor"]');
  else if(target.slot==='armor'){const i=p.bag.findIndex(it=>it.name==='練習用の胸甲');add('.icon-entry[data-icon-key="bag:'+i+'"]');add('.icon-pane[data-icon-key="bag:'+i+'"] button[onclick^="equip("]');}
 }else if(id==='socket'&&menuSurface==='inventory'){
  if(!target){add('.icon-entry[data-icon-key="slot:armor"]');}else if(target.type!=='socket'){let index=p.armor?.sockets.findIndex(s=>s.color==='B'&&!s.gem);if(index<0)index=p.armor?.sockets.findIndex(s=>s.color==='B');add('button[data-socket-slot="armor"][data-socket-index="'+index+'"]');}
  else if(target.type==='socket'){add('.icon-entry[data-icon-key^="gem:"]');card.querySelectorAll('.icon-pane:not([hidden]) button').forEach(b=>{if(b.textContent==='この穴に装着する')allowed.add(b);});}
 }else if(id==='bind'&&menuSurface==='gems'){
  if(!target)add('.icon-entry[data-icon-key="binding:0"]');
  else if(target.type==='binding'){add('.icon-entry[data-icon-key^="skill:"]');card.querySelectorAll('.icon-pane:not([hidden]) button').forEach(b=>{if(b.textContent==='このスキルを割り当てる')allowed.add(b);});}
 }else return;
 for(const el of controls){if(allowed.has(el)&&!el.disabled){if(!el.closest('[hidden]')&&!el.matches('.close,.context-help,#tutorialInline button,.loadout-path button'))el.classList.add('practice-target');}else {practiceDisabled.push([el,el.disabled]);el.disabled=true;el.classList.add('practice-blocked');}}
 const next=Array.from(allowed).find(el=>el.classList.contains('practice-target')&&menuControlAvailable(el));if(next&&(!card.contains(document.activeElement)||document.activeElement.disabled))menuFocusElement(next);
 }finally{practiceBusy=false;}}
const guidedPracticePanelBase=panel;panel=(kind,...args)=>{let id=practiceLesson();if(id&&!tutorialGuideOpen&&!['pause','help'].includes(kind)){const expected=['equip','inventory','socket'].includes(id)?'inventory':['gems','bind'].includes(id)?'gems':null;if(kind!==expected)return;}practiceRestore();const result=guidedPracticePanelBase(kind,...args);practiceRefresh();return result;};
const guidedPracticeIconBase=iconSelectEntry;iconSelectEntry=(...args)=>{const r=guidedPracticeIconBase(...args);if(!practiceBusy)queueMicrotask(practiceRefresh);return r;};
const guidedPracticeRenderBase=tutorialRender;tutorialRender=()=>{guidedPracticeRenderBase();};
const guidedPracticeUpdateBase=update;update=dt=>{guidedPracticeUpdateBase(dt);practiceTimer-=dt;if(practiceTimer<=0){practiceTimer=.15;practiceRefresh();}};
const guidedPracticeEventBase=tutorialEvent;tutorialEvent=event=>{const before=tutorialState().step;guidedPracticeEventBase(event);if(tutorialState().step!==before){practiceRestore();if(['socket','bind'].includes(practiceLesson()))loadoutRoute.target=null;queueMicrotask(()=>{if(paused&&['socket','bind'].includes(practiceLesson()))panel(practiceLesson()==='socket'?'inventory':'gems');practiceRefresh();});}};
const guidedPracticeCastBase=cast;cast=n=>{const id=practiceLesson(),expected={attack:0,skill1:1,skill2:2,dash:3};if(id&&id in expected&&n!==expected[id])return;if(id&&['move','inventory','equip','gems','socket','bind','finish'].includes(id))return;return guidedPracticeCastBase(n);};
// Global shortcut buttons remain visibly unavailable instead of silently opening
// unrelated screens. B/Escape and the pause/settings route remain a way out.
document.addEventListener('click',e=>{if(e.target.closest?.('.practice-blocked')){e.preventDefault();e.stopImmediatePropagation();}},true);
addEventListener('focusin',()=>{if(practiceLesson())queueMicrotask(practiceRefresh);});
