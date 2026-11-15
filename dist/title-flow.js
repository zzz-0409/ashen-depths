const GAME_TIPS=[
 ['✥','移動・回避','左スティックで移動、右スティックで照準。Bで回避。攻撃と回避はSPを使い、少し休むと回復します。'],
 ['⚔','攻撃・スキル','ZRで通常攻撃。Y・Xでスキル、ZLとの組み合わせで残りの枠を使用。命中・被ダメージで必殺ゲージが増え、右スティック押し込みで必殺技。'],
 ['♜','装備','装備枠を選ぶと、その枠に付けられる品が並びます。品を選ぶと右側に性能。Aで決定、Bで一段戻ります。'],
 ['◆','ジェム','赤・緑・青はソケットの色。同じ色のジェムを装着できます。線でつながったサポートは対応スキルを強化。隣に置くだけでは効果はつきません。'],
 ['✦','属性反応','敵のHPバー下に付着属性を表示。最大3属性の組み合わせで反応します。ジェム画面の属性反応表で組み合わせを確認できます。'],
 ['▣','依頼・工房','村で依頼を受け、対象を倒して報告。敵の素材で装備・スキルを作ります。昇格すると新しい依頼と製作が解放されます。'],
 ['☄','星座','中央からつながった星を取得。星座の周囲をすべて取ると加護が発動します。遠い大きなノードには特別な効果があります。'],
 ['♙','アカウント','ゲストの進行は同じブラウザでログイン後も継続。共有ランキングと村の集会所はログインが必要です。別端末へのセーブ同期は未対応です。']
];
let tipsReturn=null;
function syncTitleShell(){document.body.classList.toggle('title-shell',!started);}
function titleHasSave(){try{decodeSave(localStorage.getItem(SAVE_KEY));return true;}catch{return validHistory().length>0;}}
const titleAccountWelcome=welcome;welcome=()=>{
 syncTitleShell();if(accountMode==='pending'||accountMode==='account'&&rankingAccount?.needsName)return titleAccountWelcome();
 worldMenu('ASHEN DEPTHS','<p class="title-subtitle">灰の深淵</p><div class="title-actions"><button onclick="showClassSelection()">はじめから</button><button onclick="resume()" '+(titleHasSave()?'':'disabled')+'>つづきから</button></div><div class="title-tools"><button aria-label="設定" title="設定" onclick="showControllerSettings()">⚙<span>設定</span></button><button aria-label="Tips" title="Tips" onclick="showGameTips()">?<span>Tips</span></button></div>','welcome');$('card').querySelector('.close')?.remove();let hint=$('card').querySelector('.panel-controls');if(hint)hint.textContent='A 決定　 B 戻る';accountEntryButton();
 menuFocusElement($('card').querySelector('.title-actions button:not(:disabled)'));
};
const titleWorldBase=worldMenu;worldMenu=(...args)=>{syncTitleShell();return titleWorldBase(...args);};
const titleCloseBase=closePanel;closePanel=(...args)=>{if(!started){if(['account','accountName'].includes(menuSurface))return titleCloseBase(...args);welcome();return;}let result=titleCloseBase(...args);syncTitleShell();return result;};
function showGameTips(index=0){
 if(menuSurface!=='tips')tipsReturn=started?()=>closePanel():()=>welcome();
 const tip=GAME_TIPS[index]||GAME_TIPS[0];tutorialGuideOpen=false;
 worldMenu('Tips','<div class="tips-layout"><nav aria-label="Tipsの種類">'+GAME_TIPS.map((t,i)=>'<button aria-label="'+t[1]+'" aria-pressed="'+(i===index)+'" onclick="showGameTips('+i+')"><b>'+t[0]+'</b><span>'+t[1]+'</span></button>').join('')+'</nav><section aria-live="polite"><div class="tip-symbol">'+tip[0]+'</div><h3>'+tip[1]+'</h3><p>'+tip[2]+'</p></section></div><button onclick="closeGameTips()">戻る</button>','tips');
 menuFocusElement($('card').querySelector('[aria-pressed="true"]'));
}
function closeGameTips(){let back=tipsReturn;tipsReturn=null;if(back)back();else if(started)closePanel();else welcome();}
function onboardingDone(){let s=p?.tutorial;return !!s&&(s.completed===true||!s.active&&s.step>=LESSONS.length-1);}
const onboardingValidate=validateSave;validateSave=data=>{let out=onboardingValidate(data);if(out.p.tutorial)out.p.tutorial.completed=data.p.tutorial.completed===true;return out;};
const onboardingStart=tutorialStart;tutorialStart=()=>{if(!started||onboardingDone())return showGameTips();return onboardingStart();};
tutorialSkip=()=>{};
tutorialStop=(complete=false)=>{if(!started)return welcome();let s=tutorialState();if(complete&&s.step===LESSONS.length-1){s.active=false;s.completed=true;save();}tutorialGuideOpen=false;tutorialUIKey='';closePanel();tutorialRender();};
tutorialShow=()=>{
 if(!started||onboardingDone())return showGameTips();
 let s=p.tutorial||(p.tutorial={step:0,active:false});if(!s.active)tutorialStart();
 tutorialGuideOpen=true;const lesson=LESSONS[s.step],last=s.step===LESSONS.length-1;
 worldMenu(last?'冒険の準備ができました':lesson[1],'<p class="lesson-count">'+(s.step+1)+' / '+LESSONS.length+'</p><div class="lesson-controls"><span>🎮</span><p>'+tutorialText(lesson[2])+'</p></div><details><summary>キーボード・マウス操作</summary><p>'+lesson[3]+'</p></details><button id="tutorialPrimary" onclick="'+(last?'tutorialStop(true)':'tutorialWelcomeBack()')+'">'+(last?'冒険を始める':'やってみる')+'</button>','onboarding');
 // worldMenu clears the old guide flag; restore it for B = return to practice.
 tutorialGuideOpen=true;$('card').querySelector('.close')?.remove();menuFocusElement($('tutorialPrimary'));tutorialRender();
};
tutorialMarkup=()=>{let s=tutorialState(),l=LESSONS[s.step];return '<b>'+l[1]+'</b><p>'+tutorialText(l[2])+'</p><button onclick="tutorialShow()" aria-label="今の練習の説明">?</button>';};
const onboardingLoad=loadSaveData;loadSaveData=(...args)=>{let r=onboardingLoad(...args);syncTitleShell();if(started&&p.tutorial&&!onboardingDone())tutorialShow();return r;};
const titlePadBase=padMenu;padMenu=(g,l,r,dt)=>{if(menuSurface==='tips'&&(padEdge(g,'back')||padEdge(g,'pause'))){closeGameTips();return;}if(!started&&!['account','accountName','welcome'].includes(menuSurface)&&(padEdge(g,'back')||padEdge(g,'pause'))){welcome();return;}return titlePadBase(g,l,r,dt);};
// Existing help entry points now open reference Tips, never restart onboarding.
const tipsPanelBase=panel;panel=(kind,...args)=>{if(kind==='help')return showGameTips();let result=tipsPanelBase(kind,...args);for(let b of $('card').querySelectorAll('button'))if((b.getAttribute('onclick')||'').includes('tutorialShow')){b.textContent='? Tips';b.setAttribute('onclick','showGameTips()');}return result;};
for(let b of document.querySelectorAll('.menu button'))if((b.getAttribute('onclick')||'').includes('tutorialShow')){b.textContent='?';b.setAttribute('aria-label','Tips');b.setAttribute('onclick','showGameTips()');}
syncTitleShell();if(!started){welcome();restoreAccountEntry();}
