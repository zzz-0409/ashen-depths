// Settings and save management opened from pause return to that same menu.
const pauseReturnTargets={settings:false,save:false};
function rememberPauseParent(kind){
 if(menuSurface!==kind)pauseReturnTargets[kind]=started&&!dead&&paused&&menuSurface==='pause';
}
function returnToPause(kind){
 let allowed=pauseReturnTargets[kind]&&started&&!dead&&paused&&menuSurface===kind;
 pauseReturnTargets[kind]=false;if(!allowed)return false;
 padSettingsOpen=false;padBinding=null;padCursor.active=false;saveMenuOpen=false;savePending=null;
 panel('pause');
 let action=kind==='settings'?'showControllerSettings()':'showSaveManager()';
 let button=Array.from($('card').querySelectorAll('button')).find(el=>el.getAttribute('onclick')===action);
 if(button)menuFocusElement(button);
 return true;
}
const parentShowSettings=showControllerSettings;showControllerSettings=(...args)=>{rememberPauseParent('settings');return parentShowSettings(...args)};
const parentShowSave=showSaveManager;showSaveManager=(...args)=>{rememberPauseParent('save');return parentShowSave(...args)};
const parentCloseSettings=closeControllerSettings;closeControllerSettings=()=>{if(!returnToPause('settings'))return parentCloseSettings()};
const parentCloseSave=closeSaveManager;closeSaveManager=()=>{if(!returnToPause('save'))return parentCloseSave()};
// Loading a character or explicitly resuming invalidates previous menu origins.
const parentClosePanel=closePanel;closePanel=(...args)=>{pauseReturnTargets.settings=false;pauseReturnTargets.save=false;return parentClosePanel(...args)};
addEventListener('keydown',event=>{
 if(event.key!=='Escape'||!paused)return;
 if(menuSurface==='settings'&&padSettingsOpen){closeControllerSettings();event.preventDefault();event.stopImmediatePropagation()}
 else if(menuSurface==='save'&&saveMenuOpen){closeSaveManager();event.preventDefault();event.stopImmediatePropagation()}
},true);
