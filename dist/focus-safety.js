// Losing the window must never retain movement, attack or queued controller edges.
let focusWasSuspended=false,padNeedsNeutral=false,inputFocusEpoch=0;
function clearTransientInput(){keys={};held=false;leftDown=false;rightDown=false;route=[];moveGoal=null;attackTarget=null;lootTarget=null;playerAction=null;playerMoving=false;padCursor.active=false}
function suspendGameInput(){
 if(!focusWasSuspended)inputFocusEpoch++;focusWasSuspended=true;padNeedsNeutral=true;clearTransientInput();
 if(dpsRun?.active){dpsRun.active=false;clearDummy();say('画面を離れたためDPS測定を中止しました')}
 if(started&&!paused&&!dead)panel('pause');
}
function regainGameInput(){
 if(!focusWasSuspended)return;clearTransientInput();padNeedsNeutral=true;
 // Async loading may have started a character while this window was hidden.
 if(started&&!paused&&!dead)panel('pause');focusWasSuspended=false;
}
addEventListener('blur',suspendGameInput);
addEventListener('focus',regainGameInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendGameInput();else regainGameInput()});
const focusSafePadFrame=padFrame;padFrame=dt=>{
 if(padNeedsNeutral&&!document.hidden&&padWindowActive&&padEnabled){
  let pads=padList(),g=pads.find(g=>g.index===padDevice?.index&&g.id===padDevice?.id)||pads[0];
  if(g){let pressed=g.buttons.map(b=>b.pressed||b.value>.5),axes=padProfile.axes,zone=Math.max(.15,padProfile.deadzone||0);
   padPrevious=pressed;if(pressed.some(Boolean)||axes.some(i=>Math.abs(g.axes[i]||0)>zone))return null;
   padNeedsNeutral=false;return null;
  }
 }
 return focusSafePadFrame(dt);
};
const focusSafeUpdate=update;update=dt=>{
 if(started&&(document.hidden||!padWindowActive))suspendGameInput();
 focusSafeUpdate(dt);
};
