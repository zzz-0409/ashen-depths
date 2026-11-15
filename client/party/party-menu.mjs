const formatId=hex=>hex.length===32?[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-'):hex;
export class PartyMenu {
 constructor({client,join=id=>client.join(id),leave=()=>client.leave(),onBack=()=>{},readClipboard=()=>navigator.clipboard.readText(),writeClipboard=text=>navigator.clipboard.writeText(text)}){this.client=client;this.join=join;this.leave=leave;this.onBack=onBack;this.readClipboard=readClipboard;this.writeClipboard=writeClipboard;this.screen='home';this.hex='';this.message='';this.selected='create';this.version=0;}
 controls(){
  if(this.client.state==='connecting')return [{id:'cancel',label:'接続をキャンセル'}];
  if(this.client.state==='connected')return [{id:'copy',label:'招待IDをコピー'},{id:'leave',label:'パーティーを退出'},{id:'back',label:'戻る'}];
  if(this.screen==='invite')return [...'0123456789abcdef'].map(x=>({id:'key-'+x,label:x})).concat([{id:'paste',label:'貼り付け'},{id:'delete',label:'一文字消す'},{id:'join',label:'参加',disabled:!/^.{8}-.{4}-4.{3}-[89ab].{3}-.{12}$/.test(formatId(this.hex))},{id:'back',label:'戻る'}]);
  return [{id:'create',label:'部屋を作成'},{id:'invite',label:'招待IDで参加'},{id:'back',label:'戻る'}];
 }
 setCode(value){this.hex=String(value).replace(/-/g,'').trim().toLowerCase().replace(/[^0-9a-f]/g,'').slice(0,32);}
 move(direction){const controls=this.controls().filter(x=>!x.disabled),current=Math.max(0,controls.findIndex(x=>x.id===this.selected));const step=this.screen==='invite'&&this.client.state!=='connected'?(direction==='up'?-4:direction==='down'?4:direction==='left'?-1:1):(direction==='up'||direction==='left'?-1:1);this.selected=controls[(current+step+controls.length)%controls.length].id;}
 back(){++this.version;if(this.client.state==='connected'){this.onBack();return;}if(this.client.state==='connecting'){this.leave();this.screen='home';this.selected='create';return;}if(this.screen==='invite'){this.screen='home';this.selected='invite';return;}this.onBack();}
 async activate(id=this.selected){
  if(!this.controls().some(x=>x.id===id&&!x.disabled))return false;
  this.message='';this.selected=id;const version=++this.version;
  if(id==='back'){this.back();return true;}
  if(id==='invite'){this.screen='invite';this.selected='key-0';return true;}
  if(id.startsWith('key-')){if(this.hex.length<32)this.hex+=id.slice(4);return true;}
  if(id==='delete'){this.hex=this.hex.slice(0,-1);return true;}
  if(id==='cancel'||id==='leave'){this.leave();this.screen='home';this.selected='create';return true;}
  if(id==='ready'){const p=this.client.snapshot?.players.find(p=>p.id===this.client.playerId);return this.client.ready(!p?.ready);}
  try{
   if(id==='paste'){const text=await this.readClipboard();if(version===this.version)this.setCode(text);}
   if(id==='copy')await this.writeClipboard(this.client.roomId);
   if(id==='create'||id==='join'){await this.join(id==='create'?null:formatId(this.hex));if(version===this.version)this.selected=this.client.state==='connected'?'copy':this.client.state==='connecting'?'cancel':'create';}
  }catch{if(version===this.version)this.message='操作できませんでした。もう一度お試しください。';}
  return true;
 }
 view(){return {screen:this.screen,state:this.client.state,code:formatId(this.hex),message:this.message,roomId:this.client.roomId,players:(this.client.snapshot?.players||[]).map(p=>({id:p.id,name:p.name,ready:p.ready})),controls:this.controls()};}
}
export function mountPartyMenu(root,menu,{document=root.ownerDocument,reveal=el=>el.scrollIntoView({block:'nearest'})}={}){
 let signature='',disposed=false;
 function render(){
  if(disposed)return;const view=menu.view(),next=JSON.stringify(view);if(next===signature)return;signature=next;
  const focus=root.contains(document.activeElement)?document.activeElement?.dataset?.action:null;
  root.replaceChildren();root.classList.add('party-menu');
  const title=document.createElement('h2');title.textContent='村の集会所';root.append(title);
  const status=document.createElement('p');status.textContent=view.state==='connecting'?'接続中…':view.state==='connected'?'村の仲間 '+view.players.length+' / 4':'最大4人で同じ村に集まる';root.append(status);
  if(view.state==='connected'){const invite=document.createElement('output');invite.className='party-code';invite.textContent=view.roomId;root.append(invite);}
  if(view.screen==='invite'&&view.state!=='connected'){const code=document.createElement('output');code.className='party-code';code.textContent=view.code||'招待IDを入力';root.append(code);}
  for(const player of view.players){const row=document.createElement('p');row.textContent=player.name;root.append(row);}
  const controls=document.createElement('div');controls.className=view.screen==='invite'&&view.state!=='connected'?'party-controls party-keypad':'party-controls';root.append(controls);
  for(const item of view.controls){const button=document.createElement('button');button.type='button';button.textContent=item.label;button.dataset.action=item.id;button.disabled=!!item.disabled;button.onclick=async()=>{const work=menu.activate(item.id);render();await work;render();};controls.append(button);}
  if(view.message){const message=document.createElement('p');message.setAttribute('role','status');message.textContent=view.message;root.append(message);}
  const hint=document.createElement('small');hint.textContent='十字キー：選択　A：決定　B：戻る';root.append(hint);
  const buttons=[...root.querySelectorAll('button:not(:disabled)')];const target=buttons.find(b=>b.dataset.action===focus)||buttons.find(b=>b.dataset.action===menu.selected)||buttons[0];if(target){menu.selected=target.dataset.action;target.focus({preventScroll:true});reveal(target);}
 }
 const focusIn=event=>{if(event.target?.dataset?.action)menu.selected=event.target.dataset.action;};root.addEventListener('focusin',focusIn);
 const oldState=menu.client.onState,oldSnapshot=menu.client.onSnapshot;
 const state=(...args)=>{oldState(...args);if(args[0]?.state==='disconnected')menu.message=({'login-required':'ログインしてから参加してください。','version-mismatch':'ゲームを更新してから参加してください。','party-full':'この部屋は満員です。','connection-timeout':'接続がタイムアウトしました。再度参加してください。','room-expired-or-missing':'招待IDが見つからないか、有効期限が切れています。'}[args[0].reason]||'接続が切れました。再度参加してください。');render();},snapshot=(...args)=>{oldSnapshot(...args);render();};menu.client.onState=state;menu.client.onSnapshot=snapshot;
 render();
 return {render,async pad(action){if(disposed)return;if(action==='back')menu.back();else if(action==='accept'){const work=menu.activate();render();await work;}else{menu.move(action);const b=[...root.querySelectorAll('button')].find(b=>b.dataset.action===menu.selected);if(b){b.focus({preventScroll:true});reveal(b);}}render();},dispose(){disposed=true;++menu.version;root.removeEventListener('focusin',focusIn);if(menu.client.onState===state)menu.client.onState=oldState;if(menu.client.onSnapshot===snapshot)menu.client.onSnapshot=oldSnapshot;}};
}
