// A steady warning, with hysteresis so regeneration near 25% does not flicker.
let dangerOwner=null,dangerActive=false,dangerSoundAt=-Infinity;
const dangerNotice=document.createElement('div');dangerNotice.id='lifeDanger';dangerNotice.hidden=true;dangerNotice.textContent='⚠ HP低下';dangerNotice.setAttribute('role','status');dangerNotice.setAttribute('aria-live','polite');document.body.append(dangerNotice);
function updateLifeDanger(){
 if(dangerOwner!==p){dangerOwner=p;dangerActive=false;dangerSoundAt=-Infinity;}
 const eligible=started&&p&&!dead&&!villageOpen;
 if(!eligible){dangerActive=false;}
 else if(!paused){
  const maximum=maxhp(),ratio=maximum>0?p.hp/maximum:1,was=dangerActive;
  if(!Number.isFinite(ratio)||ratio<=0||ratio>=.35)dangerActive=false;
  else if(ratio<=.25)dangerActive=true;
  if(dangerActive&&!was&&clock-dangerSoundAt>=8){dangerSoundAt=clock;soundVoice('sine',220,180,.18,.1);soundVoice('sine',165,140,.25,.08,0,.2);}
 }
 const visible=!!(eligible&&!paused&&dangerActive);dangerNotice.hidden=!visible;document.body.classList.toggle('life-danger',visible);
}
const lifeDangerHudBase=drawHud;drawHud=()=>{lifeDangerHudBase();updateLifeDanger();};
const lifeDangerLoadBase=loadWorld;loadWorld=(...args)=>{dangerOwner=null;dangerActive=false;dangerSoundAt=-Infinity;dangerNotice.hidden=true;document.body.classList.toggle('life-danger',false);return lifeDangerLoadBase(...args);};
