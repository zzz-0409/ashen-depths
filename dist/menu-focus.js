// Gamepad .focus() does not reliably activate the browser's :focus-visible heuristic.
// Recover focus after menus replace their DOM, without moving a valid current focus.
let menuFocusAnchor=null,menuFocusPending=false;
function menuFocusKey(el){return el?.getAttribute?.('aria-label')||el?.id||el?.getAttribute?.('onclick')||el?.textContent?.trim()||'';}
function rememberMenuFocus(el){if(!$('card')?.contains(el))return;menuFocusAnchor={surface:menuSurface,key:menuFocusKey(el)};}
function restoreMenuFocus(){
 menuFocusPending=false;let card=$('card');if(!paused||!card||!card.getBoundingClientRect().height)return;
 let active=document.activeElement;
 if(card.contains(active)&&menuControlAvailable(active))return;
 let items=menuFocusables();if(!items.length)return;
 let same=menuFocusAnchor?.surface===menuSurface?items.find(el=>menuFocusKey(el)===menuFocusAnchor.key):null;
 let first=items.find(el=>!el.matches('.close')&&!!el.closest('.panel-body'))||items[0];
 menuFocusElement(same||first);
}
addEventListener('focusin',e=>rememberMenuFocus(e.target));
if(typeof MutationObserver!=='undefined')new MutationObserver(()=>{
 if(menuFocusPending)return;menuFocusPending=true;requestAnimationFrame(restoreMenuFocus);
}).observe($('card'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class','style','inert']});
// Reveal every nested scrolling pane, including foundry grids and long detail panels.
const visibleMenuReveal=menuReveal;menuReveal=el=>{
 if(!el)return;
 for(let parent=el.parentElement;parent&&parent!==$('card');parent=parent.parentElement){
  if(parent.matches('.panel-heading'))break;
  let style=getComputedStyle(parent);
  if(/auto|scroll/.test(style.overflowY)&&parent.scrollHeight>parent.clientHeight)menuRevealWithin(parent,el);
 }
 visibleMenuReveal(el);
};
// Inventory's internal action index must follow the visible DOM focus too.
// Tab, mouse focus and restored focus can enter a different action than the D-pad did.
function syncInventoryActionFocus(el){
 if(!inventoryNav.open||!el||!$('card').contains(el))return;
 let pane=el.closest?.('[data-inventory-detail]');if(!pane||pane.hidden)return;
 let index=Number(pane.dataset.inventoryDetail),actions=Array.from(pane.querySelectorAll('button:not(:disabled)')),actionIndex=actions.indexOf(el);
 if(actionIndex<0)return;
 inventoryNav.index=index;inventoryNav.actions=true;inventoryNav.actionIndex=actionIndex;inventoryHint();
}
addEventListener('focusin',e=>syncInventoryActionFocus(e.target));
const focusedInventoryAccept=inventoryAccept;inventoryAccept=()=>{
 let el=document.activeElement;
 if(inventoryNav.open&&$('card').contains(el)&&el?.tagName==='BUTTON'){
  if(!el.disabled){el.click();playSound('ui');}return;
 }
 focusedInventoryAccept();
};
// Locking is a reversible toggle on the same bag item. Keep its toggle selected
// after the inventory DOM rebuild, for both mouse and gamepad users.
const focusedToggleItemLock=toggleItemLock;toggleItemLock=index=>{
 let item=p.bag[index],result=focusedToggleItemLock(index);
 if(inventoryNav.open&&p.bag[index]===item){
  let button=Array.from($('card').querySelectorAll('button')).find(el=>el.getAttribute('onclick')==='toggleItemLock('+index+')');
  menuFocusElement(button);
 }
 return result;
};
