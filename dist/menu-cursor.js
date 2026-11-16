// One marker for the actual input target, outside all clipped/scrolling panes.
let menuCursorFrame=null,menuCursorQueued=false,menuCursorCaption=null,menuCursorBadge=null;
function menuCursorRegion(el){
 if(el?.closest?.('.inventory-detail,.icon-detail,.guild-quest-detail,#foundryDetail,#nodeDetail,.job-detail'))return '詳細';
 if(el?.closest?.('.inventory-list,.icon-list,#foundryGrid,.guild-quest-list,.job-hall'))return '一覧';
 if(el?.closest?.('#treeViewport'))return 'パッシブ';
 if(el?.closest?.('.panel-heading'))return '切替';
 return '';
}
function menuCursorTarget(el){
 // A checkbox alone can be only 13 pixels wide. Highlight its visible label too.
 if(el?.type==='checkbox'||el?.type==='radio'){
  let label=el.closest?.('label')||el.labels?.[0];
  if(label&&$('card')?.contains(label)){let r=label.getBoundingClientRect();if(r.width&&r.height)return label;}
 }
 return el;
}
function menuCursorName(el){
 let label=el?.getAttribute?.('aria-label')||el?.getAttribute?.('title');
 if(!label&&el?.labels?.length)label=Array.from(el.labels).map(x=>x.textContent).join(' ');
 if(!label)label=el?.querySelector?.('.icon-name,.item-name,h3,h2,strong,b')?.textContent||el?.textContent||'項目';
 label=label.replace(/\s+/g,' ').trim();
 if(el?.tagName==='SELECT')label+='：'+(el.selectedOptions?.[0]?.textContent||'');
 if(el?.type==='range')label+='：'+Math.round(Number(el.value)*100)/100;
 return label.length>48?label.slice(0,47)+'…':label;
}
function menuStickyBoundary(container,el){
 if(!container.matches?.('.icon-detail,.inventory-detail,.guild-quest-detail,#foundryDetail,.job-detail'))return null;
 let area=container.getBoundingClientRect(),target=el.getBoundingClientRect(),bottom=null;
 for(let heading of container.querySelectorAll('h3')){
  if(heading.contains(el)||el.contains?.(heading)||getComputedStyle(heading).position!=='sticky')continue;
  let r=heading.getBoundingClientRect();
  if(r.width&&r.height&&r.bottom>area.top&&r.top<area.bottom&&r.right>target.left&&r.left<target.right)bottom=Math.max(bottom??area.top,r.bottom+8);
 }
 return bottom;
}
// Existing reveal logic reserves scroll padding, but did not reserve sticky titles.
const stickyMenuRevealWithin=menuRevealWithin;menuRevealWithin=(container,el,horizontal=false)=>{
 stickyMenuRevealWithin(container,el,horizontal);
 let top=menuStickyBoundary(container,el);if(top===null)return;
 let r=el.getBoundingClientRect();if(r.top<top+8)container.scrollTop-=top+8-r.top;
};
function menuCursorGeometry(el){
 if(!el||!$('card')?.contains(el)||el.disabled||!el.getBoundingClientRect||!menuControlAvailable(el))return null;
 let shape=el.matches?.('.node')?(el.querySelector('.rim')||el.querySelector('circle')):null;
 let r=(shape||menuCursorTarget(el)).getBoundingClientRect();if(!r.width||!r.height)return null;
 let clip={left:4,top:4,right:innerWidth-4,bottom:innerHeight-4};
 for(let node=el.parentElement;node;node=node.parentElement){
  let style=getComputedStyle(node),b=node.getBoundingClientRect();
  if(/auto|scroll|hidden|clip/.test(style.overflowX)){clip.left=Math.max(clip.left,b.left);clip.right=Math.min(clip.right,b.right);}
  if(/auto|scroll|hidden|clip/.test(style.overflowY)){clip.top=Math.max(clip.top,b.top);clip.bottom=Math.min(clip.bottom,b.bottom);}
  if(node.id==='treeViewport'){
   let detail=$('nodeDetail')?.getBoundingClientRect();
   if(detail&&detail.height&&detail.top>b.top&&detail.top<clip.bottom&&detail.right>r.left&&detail.left<r.right)clip.bottom=detail.top;
  }
  let sticky=menuStickyBoundary(node,el);if(sticky!==null)clip.top=Math.max(clip.top,sticky);
 }
 if(clip.right<=clip.left||clip.bottom<=clip.top)return null;
 let left=Math.max(r.left,clip.left),top=Math.max(r.top,clip.top),right=Math.min(r.right,clip.right),bottom=Math.min(r.bottom,clip.bottom);
 let visible=right>left&&bottom>top,ready=visible&&(bottom-top)>=Math.min(r.height,32)&&(right-left)>=Math.min(r.width,24);
 let direction=r.top<clip.top?'↑':r.bottom>clip.bottom?'↓':r.left<clip.left?'←':'→';
 return {left,top,right,bottom,clip,visible,ready,direction,centerX:(r.left+r.right)/2,centerY:(r.top+r.bottom)/2};
}
// Keep geometry live, but avoid invalidating layout for unchanged cursor presentation.
function menuCursorAssign(target,values){for(let key in values)if(target[key]!==values[key])target[key]=values[key];}
function drawMenuCursor(){
 menuCursorQueued=false;
 if(!menuCursorFrame){menuCursorFrame=document.createElement('div');menuCursorFrame.id='menuInputCursor';menuCursorFrame.setAttribute('aria-hidden','true');document.body.append(menuCursorFrame);}
 if(!menuCursorCaption){menuCursorCaption=document.createElement('div');menuCursorCaption.id='menuInputCaption';menuCursorCaption.setAttribute('aria-hidden','true');document.body.append(menuCursorCaption);}
 if(!menuCursorBadge){menuCursorBadge=document.createElement('div');menuCursorBadge.id='menuInputBadge';menuCursorBadge.setAttribute('aria-hidden','true');document.body.append(menuCursorBadge);}
 let g=paused?menuCursorGeometry(document.activeElement):null;
 let cardRect=g?$('card').getBoundingClientRect?.():null;
 menuCursorAssign(menuCursorFrame,{hidden:!g});menuCursorAssign(menuCursorCaption,{hidden:!g});menuCursorAssign(menuCursorBadge,{hidden:true});if(!g)return;
 let active=document.activeElement,reading=active.matches?.('.icon-pane,#guildQuestDetail,#nodeDetail,#foundryDetail'),action=!g.ready?'A 選択位置へ':reading?'右スティック 説明 · B 一覧':active.tagName==='SELECT'?'A 候補を開く · 十字キー 移動':active.type==='range'?'← → 調整':'A 決定';
 let region=menuCursorRegion(active),state=active.type==='checkbox'||active.type==='radio'?(active.checked?' ON':' OFF'):'';
 menuCursorAssign(menuCursorCaption,{textContent:'▶ '+(region?region+'：':'')+menuCursorName(active)+state+'　｜　'+action});
 menuCursorAssign(menuCursorFrame,{className:(g.ready?'target-visible':'target-outside')+(reading?' reading-detail':'')+(g.ready&&active.matches?.('#tree .node')?' tree-node-target':'')});
 menuCursorAssign(menuCursorBadge,{textContent:reading?'説明を表示中':g.ready?'▶ 選択中':'選択位置 '+g.direction});
 // Attach a solid label to the actual target, including tiny sockets and SVG nodes.
 // Place it outside the target whenever there is room; never let it leave the viewport.
 // Keep text in a reserved status strip, never floating over adjacent controls.
 // The target itself has a high contrast frame and corners, including tiny sockets.
 let stripTop=Math.max(4,(cardRect?.top||48)-42);
 menuCursorAssign(menuCursorCaption.style,{top:stripTop+'px',bottom:'auto'});

 if(g.ready){
  let inset=active.matches?.('#tree .node')?Math.min(2,(g.right-g.left)/12):2;
  menuCursorAssign(menuCursorFrame.style,{left:(g.left-inset)+'px',top:(g.top-inset)+'px',width:(g.right-g.left+inset*2)+'px',height:(g.bottom-g.top+inset*2)+'px'});
  menuCursorAssign(menuCursorFrame,{textContent:''});
 }else{
  let width=Math.min(150,g.clip.right-g.clip.left),height=26;
  menuCursorAssign(menuCursorFrame.style,{left:Math.max(g.clip.left,Math.min(g.clip.right-width,g.centerX-width/2))+'px',top:Math.max(g.clip.top,Math.min(g.clip.bottom-height,g.centerY-height/2))+'px',width:width+'px',height:height+'px'});
  menuCursorAssign(menuCursorFrame,{textContent:g.direction+' 選択位置へ A'});
 }
}
function queueMenuCursor(){if(menuCursorQueued)return;menuCursorQueued=true;requestAnimationFrame(drawMenuCursor);}
// Never activate an unseen button after manually scrolling its pane away.
function revealMenuCursorFirst(){
 let active=document.activeElement,g=menuCursorGeometry(active);
 // A stale DOM target (removed, collapsed or disabled) must never receive A.
 // Recover the cursor first; a second press can confirm the now-visible target.
 if(!g){if(typeof restoreMenuFocus==='function')restoreMenuFocus();queueMenuCursor();return true;}
 if(!g.ready){menuReveal(active);queueMenuCursor();return true;}return false;
}
const cursorMenuActivate=menuActivate;menuActivate=()=>{if(!revealMenuCursorFirst())cursorMenuActivate();queueMenuCursor();};
const cursorInventoryAccept=inventoryAccept;inventoryAccept=()=>{if(!revealMenuCursorFirst())cursorInventoryAccept();queueMenuCursor();};
const cursorPadMenu=padMenu;padMenu=(...args)=>{if(paused&&typeof restoreMenuFocus==='function')restoreMenuFocus();let result=cursorPadMenu(...args);queueMenuCursor();return result;};
addEventListener('focusin',queueMenuCursor);
addEventListener('focusout',queueMenuCursor);
addEventListener('scroll',queueMenuCursor,true);
addEventListener('resize',queueMenuCursor);
addEventListener('input',queueMenuCursor);
addEventListener('change',queueMenuCursor);
new MutationObserver(queueMenuCursor).observe($('card'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','style','disabled']});
new MutationObserver(queueMenuCursor).observe($('modal'),{attributes:true,attributeFilter:['class']});
queueMenuCursor();
