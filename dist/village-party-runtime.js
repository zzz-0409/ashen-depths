// Village-only shared presence. Combat, progression and rewards remain local.
let villagePartyClient=null,villagePartyConnection=null,villagePartyReplicas=null,villagePartyView=null,villagePartyRoot=null,villagePartyMenuEpoch=0;
let villagePartyFrame=null,villagePartyDodge=null,villagePartyDirection=null,villagePartyRepeat=0;
function villagePartyHere(){return !!(started&&!dead&&p?.campaign&&villageOpen&&campaign().inVillage);}
function villagePartyActive(){return villagePartyClient?.state==='connected'&&villagePartyConnection?.validWorld();}
function villagePartyDisposeView(){++villagePartyMenuEpoch;villagePartyView?.dispose();villagePartyView=null;villagePartyRoot=null;}
function villagePartyEnsure(){
 if(villagePartyClient)return;
 villagePartyReplicas=new VillageParty.PartyReplicas();
 villagePartyClient=new VillageParty.PartyClient({origin:location.origin,revision:CLIENT_RELEASE_ID});
 villagePartyConnection=new VillageParty.VillageConnection({client:villagePartyClient,replicas:villagePartyReplicas,inVillage:villagePartyHere,worldToken:()=>dungeon,applyPosition:(x,y)=>{p.x=x;p.y=y;},onArrival:()=>{route=[];moveGoal=null;attackTarget=null;}});
}
async function showVillageParty(){
 if(!villagePartyHere()){say('集会所は村で利用できます');return;}
 worldMenu('村の集会所','<div id="villagePartyRoot" role="region" aria-label="村の集会所"><p>接続先を確認しています…</p></div>','villageParty');
 const epoch=++villagePartyMenuEpoch,root=$('villagePartyRoot');villagePartyRoot=root;
 const current=()=>epoch===villagePartyMenuEpoch&&root.isConnected&&menuSurface==='villageParty'&&villagePartyHere();
 try{
  const config=await rankingRequest('party/config');if(!current())return;
  if(!config.ready){root.textContent='集会所はサーバーの準備中です。村での冒険準備はそのまま利用できます。';return;}
  if(config.revision!==CLIENT_RELEASE_ID||config.protocol!==1){root.textContent='ゲームの版が異なります。ページを更新してから参加してください。';return;}
  const account=await rankingRequest('me');if(!current())return;
  if(!account){root.textContent='参加にはログインが必要です。';const b=document.createElement('button');b.textContent='アカウント・DPSランキングへ';b.onclick=()=>showDps();root.append(b);b.focus();return;}
  villagePartyEnsure();
  const menu=new VillageParty.PartyMenu({client:villagePartyClient,join:id=>villagePartyConnection.join(id),leave:()=>villagePartyConnection.leave(),onBack:()=>closePanel()});
  villagePartyView=VillageParty.mountPartyMenu(root,menu,{reveal:menuReveal});
 }catch{if(current())root.textContent='集会所に接続できません。時間をおいて開き直してください。';}
}
function villagePartyEntry(){if(!villagePartyHere()||$('villagePartyEntry'))return;const b=document.createElement('button');b.id='villagePartyEntry';b.textContent=villagePartyActive()?'村の仲間・退出':'集会所 · 最大4人';b.onclick=()=>showVillageParty();($('card').querySelector('.panel-body')||$('card')).append(b);}
const partyWorldMenuBase=worldMenu;worldMenu=(...args)=>{villagePartyDisposeView();villagePartyConnection?.input(0,0,{menuOpen:true});return partyWorldMenuBase(...args);};
const partyPanelBase=panel;panel=(...args)=>{villagePartyDisposeView();villagePartyConnection?.input(0,0,{menuOpen:true});const result=partyPanelBase(...args);if(args[0]==='pause')villagePartyEntry();return result;};
const partyVillageMenuBase=showVillage;showVillage=(...args)=>{const result=partyVillageMenuBase(...args);villagePartyEntry();return result;};
const partyClosePanelBase=closePanel;closePanel=(...args)=>{villagePartyDisposeView();return partyClosePanelBase(...args);};
const partyLoadWorldBase=loadWorld;loadWorld=(...args)=>{villagePartyDisposeView();villagePartyConnection?.leave();return partyLoadWorldBase(...args);};
const partyLogoutBase=rankingLogout;rankingLogout=async(...args)=>{villagePartyConnection?.leave();return partyLogoutBase(...args);};
function addVillagePartyActors(actors){if(villagePartyActive())VillageParty.appendPartyActors(actors,villagePartyReplicas,Date.now(),{visibleAt,actorSprite,heroSheet,groundRing,project,ctx});}
// Capture requested motion, never send coordinates. The server applies village
// collisions and returns the position. Offline movement uses the original path.
const partyMoveActorBase=moveActor;moveActor=(actor,dx,dy,...args)=>{
 if(actor!==p||!villagePartyActive())return partyMoveActorBase(actor,dx,dy,...args);
 const capture=villagePartyDodge||villagePartyFrame;if(!capture)return 0;
 capture.x+=dx;capture.y+=dy;return Math.hypot(dx,dy);
};
const partyCastBase=cast;cast=(n,...args)=>{
 if(n!==3||!villagePartyActive())return partyCastBase(n,...args);
 const before=cd[3],capture={x:0,y:0};villagePartyDodge=capture;
 try{const result=partyCastBase(n,...args);if(cd[3]>before)villagePartyClient.dodge(capture.x,capture.y);return result;}finally{villagePartyDodge=null;}
};
const partyUpdateBase=update;update=dt=>{
 villagePartyConnection?.checkWorld();
 if(villagePartyRoot&&!villagePartyRoot.isConnected)villagePartyDisposeView();
 if(!villagePartyActive())return partyUpdateBase(dt);
 villagePartyFrame={x:0,y:0};
 try{return partyUpdateBase(dt);}finally{
  if(villagePartyActive()){
   const scale=Math.max(.001,dt)*240;
   villagePartyConnection.input(villagePartyFrame.x/scale,villagePartyFrame.y/scale,{menuOpen:paused,hidden:document.hidden,focused:padWindowActive});
  }
  villagePartyFrame=null;
 }
};
const partyPadMenuBase=padMenu;padMenu=(g,left,right,dt)=>{
 if(menuSurface!=='villageParty'||!villagePartyView)return partyPadMenuBase(g,left,right,dt);
 padCursor.active=false;
 if(padEdge(g,'back')||padEdge(g,'pause')){villagePartyView.pad('back');return;}
 const down=i=>!!g.buttons[i]&&(g.buttons[i].pressed||g.buttons[i].value>.5);
 let x=Number(down(15))-Number(down(14)),y=Number(down(13))-Number(down(12));
 if(!x&&!y&&left.magnitude>.55){if(Math.abs(left.x)>Math.abs(left.y))x=Math.sign(left.x);else y=Math.sign(left.y);}
 const direction=x?(x<0?'left':'right'):y?(y<0?'up':'down'):null;villagePartyRepeat-=dt;
 if(direction&&(direction!==villagePartyDirection||villagePartyRepeat<=0)){villagePartyView.pad(direction);villagePartyRepeat=direction===villagePartyDirection?.14:.36;}
 villagePartyDirection=direction;menuScroll(right,dt);if(padEdge(g,'accept'))villagePartyView.pad('accept');
};
addEventListener('blur',()=>villagePartyConnection?.input(0,0,{focused:false}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)villagePartyConnection?.input(0,0,{hidden:true});});
addEventListener('pagehide',()=>villagePartyConnection?.leave());
