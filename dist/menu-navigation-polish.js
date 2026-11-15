// The right stick scrolls the description paired with the selected entry.
// Selects behave like sliders on a pad: left/right changes the value, up/down
// leaves the field. Never commit unavailable options or emit a false change.
function menuStepSelect(el,direction){
 if(!el||el.disabled||!direction)return false;
 let count=el.options.length,start=el.selectedIndex;
 for(let step=1;step<=count;step++){
  let index=((start+Math.sign(direction)*step)%count+count)%count,option=el.options[index];
  if(option.disabled||option.hidden||option.parentElement?.disabled)continue;
  if(index===start)return false;
  let identity=node=>['id','aria-label','name','onchange'].map(key=>node.getAttribute?.(key)||'').join('|'),key=identity(el);
  el.selectedIndex=index;el.dispatchEvent(new Event('change',{bubbles:true}));
  // Region/recipe changes may replace the whole menu. Keep adjusting the same
  // field instead of unexpectedly jumping into the newly rendered item list.
  let card=$('card');
  if(!card.contains(el)&&key!=='|||'){
   let replacement=Array.from(card.querySelectorAll('select:not(:disabled)')).find(node=>identity(node)===key);
   if(replacement)menuFocusElement(replacement);
  }
  return true;
 }
 return false;
}
const selectMenuMove=menuMove;menuMove=(dx,dy)=>{
 let el=document.activeElement;
 if(dx&&!dy&&el?.tagName==='SELECT'&&$('card').contains(el)){
  if(typeof revealMenuCursorFirst==='function'&&revealMenuCursorFirst())return;
  if(menuStepSelect(el,dx))playSound('ui');return;
 }
 return selectMenuMove(dx,dy);
};
const selectMenuActivate=menuActivate;menuActivate=()=>{
 let el=document.activeElement;
 if(el?.tagName==='SELECT'&&$('card').contains(el)&&!el.disabled){if(menuStepSelect(el,1))playSound('ui');return;}
 return selectMenuActivate();
};
// Scrolling the outer body used to move both columns (and the focused item) away.
function menuDescriptionPane(el){
 let card=$('card');if(!el||!card?.contains(el))return card?.querySelector('.panel-body');
 if(el.closest('.job-hall,.job-detail'))return card.querySelector('.job-detail');
 if(el.closest('.inventory-list,.inventory-detail'))return card.querySelector('.inventory-detail');
 if(el.closest('#foundryGrid,#foundryDetail'))return $('foundryDetail');
 let browser=el.closest('.icon-browser');if(browser)return browser.querySelector('.icon-detail');
 if(el.closest('.guild-board'))return $('guildQuestDetail');
 if(el.closest('#treeViewport,#nodeDetail'))return $('nodeDetail');
 return card.querySelector('.panel-body');
}
menuScroll=(stick,dt)=>{
 padCursor.active=false;if(stick.magnitude<=.15)return;
 let pane=menuDescriptionPane(document.activeElement);if(!pane)return;
 pane.scrollTop+=stick.y*500*dt;pane.scrollLeft+=stick.x*500*dt;
};
// Socket rows and forge actions use their on-screen geometry, just like item grids.
const spatialInventoryMove=inventoryMove;inventoryMove=(dx,dy)=>{
 let active=document.activeElement,cards=inventoryCards();
 // Header tabs/help can receive focus via Tab or mouse too. Do not snap back
 // to the remembered item when the next controller direction is pressed.
 if(!cards.includes(active)&&!inventoryActions().includes(active))return menuMove(dx,dy);
 if(!inventoryNav.actions){
  let current=cards.indexOf(active),next=inventoryNextIndex(cards.map(el=>el.getBoundingClientRect()),current,dx,dy);
  if(next===current)return menuMove(dx,dy);
  return spatialInventoryMove(dx,dy);
 }
 let actions=inventoryActions().filter(el=>{let r=el.getBoundingClientRect();return r.width>0&&r.height>0});
 if(!actions.length){inventoryNav.actions=false;inventoryFocus();return;}
 let current=actions.indexOf(document.activeElement);
 if(current<0)current=Math.max(0,Math.min(inventoryNav.actionIndex,actions.length-1));
 let next=inventoryNextIndex(actions.map(el=>el.getBoundingClientRect()),current,dx,dy);
 if(next===current)return menuMove(dx,dy);
 inventoryNav.actionIndex=inventoryActions().indexOf(actions[next]);inventoryFocus();playSound('ui');
};
// Crossing from actions/header into a tile must also change the inspected item.
addEventListener('focusin',event=>{
 if(!inventoryNav.open)return;
 let index=inventoryCards().indexOf(event.target);if(index<0)return;
 inventoryNav.index=index;inventoryNav.actions=false;inventoryNav.actionIndex=0;
 inventoryCards().forEach((el,i)=>{el.classList.toggle('inventory-selected',i===index);el.classList.remove('inventory-actions');el.setAttribute('aria-current',String(i===index));});
 inventoryShowDetail();inventoryHint();
});
