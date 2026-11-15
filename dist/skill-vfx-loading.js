// Specialized spell sheets are not startup requirements. Keep common combat art
// in BASE_GAME_IMAGES; register new skill-specific sheets in this table.
const SKILL_VFX_IMAGES=new Map([
 ['crafted_2_7',timeLoanVfxSheet],['crafted_3_2',balanceVfxSheet],
 ['crafted_3_5',grazeRingVfxSheet],['crafted_3_3',twinCircleVfxSheet],['crafted_3_4',partingChainVfxSheet],['crafted_5_0',stoneWallVfxSheet]
]);
for(let image of SKILL_VFX_IMAGES.values()){let index=BASE_GAME_IMAGES.indexOf(image);if(index>=0)BASE_GAME_IMAGES.splice(index,1);}
function equippedSkillVfxImages(character){
 if(!character||presentationPrefs.reduced)return [];
 let images=new Set();for(let slot of GEAR_SLOTS)for(let socket of character[slot]?.sockets||[]){let image=SKILL_VFX_IMAGES.get(socket.gem?.type);if(image)images.add(image);}
 return [...images];
}
const skillVfxRegionImagesBase=regionGameImages;
regionGameImages=(region,contract=null)=>[...new Set([...skillVfxRegionImagesBase(region,contract),...equippedSkillVfxImages(p)])];
// Use the incoming character, not the currently open character, on import/resume.
characterGameImages=character=>{let c=character?.campaign,images=c?.inVillage===false?skillVfxRegionImagesBase(c.region,c.contract):BASE_GAME_IMAGES;return [...new Set([...images,...equippedSkillVfxImages(character)])];};
const skillVfxLoads=new WeakMap();
function warmSkillVfxImage(image,retry=false){
 if(!image||presentationPrefs.reduced||gameImagesReady([image]))return;
 let previous=skillVfxLoads.get(image);if(previous?.src===image.src&&(previous.pending||!retry))return previous.promise;
 let entry={pending:true,promise:null,src:null};skillVfxLoads.set(image,entry);
 entry.promise=waitGameImage(image,previous?.src===image.src).then(()=>{entry.pending=false;return true;},()=>{entry.pending=false;return false;});entry.src=image.src;return entry.promise;
}
function warmEquippedSkillVfx(retry=false){if(started&&p)for(let image of equippedSkillVfxImages(p))warmSkillVfxImage(image,retry);}
// Equipment can change through sockets, gear swaps, stash and save restore.
// The throttled HUD catches each path; pending/failed loads never restart per tick.
const skillVfxLoadingHudBase=drawHud;drawHud=()=>{let result=skillVfxLoadingHudBase();warmEquippedSkillVfx();return result;};
const skillVfxLoadingCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{warmSkillVfxImage(SKILL_VFX_IMAGES.get(build?.type));return skillVfxLoadingCastBase(build,...args);};
// A failed optional prewarm can retry once on leaving a menu, without a retry loop.
const skillVfxLoadingCloseBase=closePanel;closePanel=(...args)=>{let result=skillVfxLoadingCloseBase(...args);warmEquippedSkillVfx(true);return result;};
