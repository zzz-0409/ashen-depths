// Authentication never creates, resets, imports or replaces a local character.
let accountMode='pending',accountEpoch=0,accountBusy=false,accountReturn=null,accountNameDraft='',accountKana=false,accountGoogleLoad=null;
function accountReady(){return accountMode==='account'&&rankingAccount&&!rankingAccount.needsName;}
function accountMessage(text){let el=$('accountMessage');if(el)el.textContent=text;}
function accountScreen(title,html,surface='account'){
 worldMenu(title,html,surface);$('card').querySelector('.close')?.remove();menuFocusElement($('card').querySelector('.panel-body button:not(:disabled),input'));
}
function accountGameReturn(){if(villageOpen)showVillage();else panel('pause');}
function accountBack(){++accountEpoch;if(accountReturn){let done=accountReturn;accountReturn=null;done();}else if(started)accountGameReturn();else welcome();}
function showAccount(){
 ++accountEpoch;
 if(accountMode==='account'&&rankingAccount?.needsName){showAccountName();return;}
 accountScreen('冒険者アカウント',accountReady()?'<h3>'+gearEscape(rankingAccount.name)+'</h3><button onclick="showAccountName()">名前を変更</button><button onclick="accountGuest()">ログアウトしてゲストへ</button><button onclick="accountBack()">戻る</button><p id="accountMessage" role="status"></p>':'<p>ゲストの冒険は、ログイン後もこのブラウザで続けられます。</p><button onclick="accountLogin()">Googleでログイン</button><div id="accountGoogle"></div><button onclick="accountGuest()">ゲストで'+(started?'続ける':'始める')+'</button><p class="muted">ゲストは共有ランキング・マルチを利用できません。セーブはこのブラウザに保存されます。</p><p id="accountMessage" role="status"></p>');
}
async function accountGuest(){
 if(accountBusy)return;accountBusy=true;++accountEpoch;villagePartyConnection?.leave();
 try{await rankingRequest('logout',{});}catch{/* Offline guest play remains available. */}
 finally{accountBusy=false;accountMode='guest';rankingAccount=null;accountReturn=null;if(started)accountGameReturn();else welcome();}
}
async function accountLogin(){
 if(accountBusy)return;accountBusy=true;const epoch=++accountEpoch;accountMessage('Googleログインを準備しています…');
 try{
  rankingConfig=await rankingRequest('config');if(epoch!==accountEpoch)return;if(!rankingConfig.ready)throw Error('ログインサーバーは準備中です。ゲストで遊べます。');
  const {nonce}=await rankingRequest('login-challenge',{});if(epoch!==accountEpoch)return;
  if(!window.google?.accounts?.id){if(!accountGoogleLoad)accountGoogleLoad=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.onload=resolve;script.onerror=()=>{accountGoogleLoad=null;script.remove();reject(Error('Googleに接続できません'));};document.head.append(script);});await accountGoogleLoad;}
  if(epoch!==accountEpoch||!$('accountGoogle')?.isConnected)return;
  window.google.accounts.id.initialize({client_id:rankingConfig.clientId,nonce,callback:async response=>{
   if(epoch!==accountEpoch)return;accountBusy=true;
   try{await rankingRequest('login',{credential:response.credential});if(epoch!==accountEpoch)return;rankingAccount=await rankingRequest('me');if(epoch!==accountEpoch)return;if(!rankingAccount)throw Error('ログインを確認できません');accountMode='account';if(rankingAccount.needsName)showAccountName();else accountBack();}
   catch(e){if(epoch===accountEpoch)accountMessage(e.message);}finally{accountBusy=false;}
  }});
  const box=$('accountGoogle');box.textContent='';window.google.accounts.id.renderButton(box,{theme:'outline',size:'large',text:'signin_with'});accountMessage('Googleのボタンからアカウントを選んでください。');
 }catch(e){if(epoch===accountEpoch)accountMessage(e.message);}finally{accountBusy=false;}
}
function showAccountName(){
 ++accountEpoch;accountNameDraft=rankingAccount?.needsName?'':rankingAccount?.name||'';renderAccountName();
}
function renderAccountName(){
 const keys=accountKana?'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんー':'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 accountScreen(rankingAccount?.needsName?'冒険者の名前を決める':'名前を変更','<p>ゲーム内で公開する名前 · 2〜16文字 · 後から変更できます</p><input id="accountName" aria-label="冒険者の名前" maxlength="32" value="'+gearEscape(accountNameDraft)+'" oninput="accountNameDraft=this.value"><details><summary>コントローラーで文字入力</summary><button onclick="accountNameDraft=$(\'accountName\').value;accountKana=!accountKana;renderAccountName()">英数字／ひらがな</button><div class="account-keys">'+[...keys].map(c=>'<button onclick="accountNameKey(\''+c+'\')">'+c+'</button>').join('')+'</div><button onclick="accountNameKey(null)">1文字消す</button></details><button onclick="accountSaveName()">この名前で決定</button><button onclick="'+(rankingAccount?.needsName?'accountGuest()':'accountBack()')+'">'+(rankingAccount?.needsName?'ゲストで続ける':'戻る')+'</button><p id="accountMessage" role="status"></p>','accountName');
}
function accountNameKey(key){const el=$('accountName');if(!el)return;let chars=[...el.value];if(key===null)chars.pop();else if(chars.length<16)chars.push(key);el.value=chars.join('');accountNameDraft=el.value;}
async function accountSaveName(){
 if(accountBusy)return;const epoch=accountEpoch,name=$('accountName')?.value;accountBusy=true;accountMessage('保存しています…');
 try{const profile=await rankingRequest('profile',{name});if(epoch!==accountEpoch)return;villagePartyConnection?.leave();rankingAccount=profile;accountMode='account';accountBack();}
 catch(e){if(epoch===accountEpoch)accountMessage(e.message);}finally{accountBusy=false;}
}
const accountWelcomeBase=welcome;welcome=()=>{
 if(accountMode==='pending')return showAccount();
 if(accountMode==='account'&&rankingAccount?.needsName)return showAccountName();
 accountWelcomeBase();accountEntryButton();
};
function accountEntryButton(){if($('accountEntry'))return;let b=document.createElement('button');b.id='accountEntry';b.textContent=accountReady()?rankingAccount.name+' · アカウント':'ゲスト · ログイン';b.onclick=()=>showAccount();($('card').querySelector('.panel-body')||$('card')).append(b);}
const accountVillageBase=showVillage;showVillage=(...args)=>{const r=accountVillageBase(...args);accountEntryButton();return r;};
const accountPanelBase=panel;panel=(...args)=>{const r=accountPanelBase(...args);if(args[0]==='pause')accountEntryButton();return r;};
renderRanking=async()=>{
 if(!accountReady()){let box=$('accountRanking');if(box)box.innerHTML='<p>共有ランキングはログイン後に利用できます。</p><button onclick="accountReturn=showDps;showAccount()">アカウントでログイン</button>';return;}
 const epoch=accountEpoch,box=$('accountRanking');if(!box)return;
 try{const profile=await rankingRequest('me');if(epoch!==accountEpoch||!box.isConnected||menuSurface!=='dps')return;rankingAccount=profile;if(!accountReady()){accountMode='guest';return renderRanking();}const data=await rankingRequest('ranking');if(epoch!==accountEpoch||!accountReady()||!box.isConnected||menuSurface!=='dps')return;box.innerHTML='<h3>'+gearEscape(profile.name)+'</h3><button onclick="accountReturn=showDps;showAccount()">アカウント・名前変更</button>'+(data.mine?'<p>今回 '+data.mine.last.toLocaleString()+' DPS · 自己ベスト '+data.mine.best.toLocaleString()+' DPS · '+data.mine.rank+'位</p>':'<p>チャレンジで記録を残そう</p>')+'<ol>'+data.leaders.map(row=>'<li>'+gearEscape(row.name)+' · '+row.dps.toLocaleString()+' DPS</li>').join('')+'</ol>';}
 catch(e){if(epoch===accountEpoch&&box.isConnected)box.textContent=e.message;}
};
rankingLogin=()=>{accountReturn=showDps;showAccount();};rankingLogout=accountGuest;
const accountPartyBase=showVillageParty;showVillageParty=(...args)=>{if(!accountReady()){accountReturn=()=>showVillageParty(...args);showAccount();return;}return accountPartyBase(...args);};
const accountPadBase=padMenu;padMenu=(g,l,r,dt)=>{if(['account','accountName'].includes(menuSurface)&&(padEdge(g,'back')||padEdge(g,'pause'))){if(accountBusy)return;if(menuSurface==='accountName'&&rankingAccount?.needsName)accountGuest();else if(accountMode!=='pending')accountBack();return;}return accountPadBase(g,l,r,dt);};
const accountCloseBase=closePanel;closePanel=(...args)=>{if(['account','accountName'].includes(menuSurface)){if(accountMode==='pending')return;return accountBack();}return accountCloseBase(...args);};
async function restoreAccountEntry(){const epoch=accountEpoch;try{rankingConfig=await rankingRequest('config');if(!rankingConfig.ready)return;const profile=await rankingRequest('me');if(epoch!==accountEpoch||accountMode!=='pending')return;if(profile){rankingAccount=profile;accountMode='account';welcome();}}catch{/* Keep login and guest choices visible. */}}
if(!started){welcome();restoreAccountEntry();}
