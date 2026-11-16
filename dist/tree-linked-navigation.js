// Directional movement follows the rendered graph rather than screen proximity.
function linkedTreeDestination(id,dx,dy){
 const from=NODES[id];if(!from||!dx&&!dy)return id;
 const length=Math.hypot(dx,dy);dx/=length;dy/=length;
 const candidates=from.links.map(id=>NODES[id]).filter(Boolean).map(n=>{
  const x=n.x-from.x,y=n.y-from.y,d=Math.hypot(x,y),dot=x*dx+y*dy;
  return {id:n.id,d,alignment:d?dot/d:0};
 }).filter(n=>n.alignment>1e-6);
 candidates.sort((a,b)=>b.alignment-a.alignment||a.d-b.d||a.id-b.id);
 return candidates[0]?.id??id;
}
function returnToTreeCenter(){
 if(!paused||menuSurface!=='skills'||!$('treeViewport'))return false;
 treeFocus=0;inspectNode(0);menuTreeFocus();
 const vp=$('treeViewport'),n=NODES[0];
 vp.scrollLeft=n.x*treeZoom-vp.clientWidth/2;vp.scrollTop=n.y*treeZoom-vp.clientHeight/2;
 menuDirection=null;menuRepeat=.25;padCursor.active=false;playSound('ui');return true;
}
const linkedTreeMenuMoveBase=menuMove;
menuMove=(dx,dy)=>{
 const el=document.activeElement;
 if(menuSurface==='skills'&&el?.closest('#treeLinkedChoices')){
  const items=Array.from($('treeLinkedChoices').querySelectorAll('button')),i=items.indexOf(el),next=clamp(i+Math.sign(dy||dx),0,items.length-1);
  if(items[next]){menuFocusElement(items[next]);playSound('ui');}return;
 }
 if(menuSurface!=='skills'||!$('treeViewport')?.contains(el)||el?.dataset.node===undefined)return linkedTreeMenuMoveBase(dx,dy);
 const id=Number(el.dataset.node),next=linkedTreeDestination(id,dx,dy);
 if(next===id)return;
 treeFocus=next;inspectNode(next);menuTreeFocus();padCursor.active=false;playSound('ui');
};
const linkedTreePadMenuBase=padMenu;
padMenu=(g,left,right,dt)=>{
 if(menuSurface==='skills'&&document.activeElement?.closest('#treeLinkedChoices')&&padEdge(g,'back')){menuTreeFocus();playSound('ui');return;}
 if(menuSurface==='skills'&&!menuSelectDialog&&!padSettingsOpen&&padButtonEdge(g,10)&&returnToTreeCenter())return;
 if(menuSurface==='skills'&&!menuSelectDialog&&!padSettingsOpen&&padEdge(g,'secondary')){focusTreeLinkedChoices();return;}
 return linkedTreePadMenuBase(g,left,right,dt);
};
function chooseLinkedTreeNode(from,to){
 if(menuSurface!=='skills'||treeFocus!==from||!NODES[from]?.links.includes(to))return false;
 treeFocus=to;inspectNode(to);menuTreeFocus();padCursor.active=false;playSound('ui');return true;
}
function focusTreeLinkedChoices(){const button=$('treeLinkedChoices')?.querySelector('button');if(button){menuFocusElement(button);playSound('ui');}}
const linkedTreeInspectBase=inspectNode;
inspectNode=id=>{
 const result=linkedTreeInspectBase(id),detail=$('nodeDetail'),n=NODES[id];
 if(detail&&n){detail.querySelector('#treeLinkedChoices')?.remove();
  const choices=document.createElement('div');choices.id='treeLinkedChoices';choices.setAttribute('role','group');choices.setAttribute('aria-label','線でつながる接続先');
  const heading=document.createElement('p');heading.textContent='接続先 · ZLで選択／Bでノードへ';choices.append(heading);
  for(const to of n.links){const button=document.createElement('button');button.type='button';button.textContent='◇ '+NODES[to].name;button.dataset.linkedNode=to;button.style.cssText='display:block;width:100%;margin:4px 0;text-align:left';button.onclick=()=>chooseLinkedTreeNode(id,to);choices.append(button);}
  detail.append(choices);
 }return result;
};
const linkedTreeHtmlBase=treeHtml;
treeHtml=()=>linkedTreeHtmlBase().replace('<button onclick="zoomTree(-.15)">','<button id="treeCenter" onclick="returnToTreeCenter()" title="左スティック押し込み / Home">中央へ戻る</button><button onclick="zoomTree(-.15)">');
const linkedTreeHintBase=menuHintText;
menuHintText=()=>menuSurface==='skills'?'十字キー：線に沿って選択 · ZL：分岐一覧 · A：決定 · B：戻る · X：全閉じ · 左スティック押し込み／Home：中央':linkedTreeHintBase();
addEventListener('keydown',e=>{
 if(e.key!=='Home'||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target?.tagName||'')||menuSelectDialog)return;
 if(returnToTreeCenter()){e.preventDefault();e.stopImmediatePropagation();}
},true);
CONTEXT_MENU_HELP.skills.push('十字キーは実線・点線でつながった隣のノードだけに移動します。その方向に接続先がなければ動きません。重なる分岐はZLで接続先一覧へ移り、十字キーとAで選択。Bで元のノードに戻ります。','左スティック押し込み、Homeキー、または「中央へ戻る」で開始ノードに戻ります。ズーム倍率は維持します。左スティックで表示範囲を移動、右スティックで詳細をスクロールできます。');
