let heldMoveRefresh=0;
function gameplayKeyboardGuard(e){if(e.isComposing||e.ctrlKey||e.metaKey||e.altKey){e.stopImmediatePropagation();return}let editing=/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||'')||e.target?.isContentEditable;if(!editing||e.key==='Escape')return;if(e.key==='Tab'&&paused&&$('card')?.classList.contains('framed-panel'))return;e.stopImmediatePropagation();}
addEventListener('keydown',gameplayKeyboardGuard,true);
const heldMoveUpdate=update;
update=dt=>{if(started&&!paused){heldMoveRefresh-=dt;if(leftDown&&!keys.Shift&&!attackTarget&&!lootTarget&&!playerAction&&heldMoveRefresh<=0){heldMoveRefresh=.14;pointMove(unproject(mouse.x,mouse.y))}}heldMoveUpdate(dt)};
