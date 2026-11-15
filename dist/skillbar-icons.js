// Reuse each crafted ability's silhouette across menus and combat slots.
// Only replace markup when the binding or forged primary element changes.
function updateSkillbarIcons(){
 if(!p)return;
 let buttons=document.querySelectorAll('.actions button');
 for(let i=0;i<6;i++){
  let button=buttons[i<2?i+1:i+3],icon=button?.querySelector('.bar-icon');if(!icon)continue;
  let build=skillBuild(p.bindings[i]),type=build?.type;
  let dedicated=GEM[type]?.kind==='active',key=dedicated?type+':'+build.elements[0]:'';
  if(icon.dataset.abilityKey===key)continue;
  icon.dataset.abilityKey=key;icon.classList.toggle('ability-bar-icon',dedicated);
  icon.innerHTML=dedicated?gemIcon(type):'';
  if(dedicated)icon.style.setProperty('--skill-ink',ELEMENTS[build.elements[0]].color);
  else icon.style.removeProperty('--skill-ink');
 }
}
const abilityBarHudBase=drawHud;drawHud=()=>{abilityBarHudBase();updateSkillbarIcons();};
