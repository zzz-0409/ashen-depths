let lastCraftedItem=null;
function craftedItemLocation(){if(!lastCraftedItem||!p)return-1;let bag=p.bag.indexOf(lastCraftedItem);return bag>=0?GEAR_SLOTS.length+bag:GEAR_SLOTS.findIndex(slot=>p[slot]===lastCraftedItem);}
function openCraftedItem(){let index=craftedItemLocation();if(index<0){lastCraftedItem=null;say('この装備は鞄や装備欄にありません');showForge();return false;}if(typeof loadoutInspectItem==='function')return loadoutInspectItem(lastCraftedItem);panel('inventory');inventoryNav.index=index;inventoryNav.actions=false;inventoryNav.actionIndex=0;inventoryFocus();return true;}
function dismissCraftResult(){lastCraftedItem=null;showForge();}
function renderCraftResult(focus=false){
 if(menuSurface!=='forge')return;let pane=$('card').querySelector('.icon-pane:not([hidden])');if(!pane)return;pane.querySelector('.forge-result')?.remove();
 if(craftedItemLocation()<0||lastCraftedItem.slot!==worldForgeSlot)return;
 let result=document.createElement('section');result.className='forge-result';result.setAttribute('aria-label','製作した装備');
 result.innerHTML='<h4>製作した装備</h4>'+itemDetails(lastCraftedItem)+'<button data-crafted-open onclick="openCraftedItem()">この装備を比較・装備する</button><button onclick="dismissCraftResult()">結果を閉じる</button>';
 pane.insertBefore(result,pane.children[1]||null);if(focus)menuFocusElement(result.querySelector('[data-crafted-open]'));
}
const resultForgeBase=showForge;showForge=(...args)=>{let value=resultForgeBase(...args);renderCraftResult();return value;};
const resultCraftBase=craftMaterialGear;craftMaterialGear=(...args)=>{let success=resultCraftBase(...args);if(success){lastCraftedItem=p.bag[p.bag.length-1];renderCraftResult(true);}return success;};
