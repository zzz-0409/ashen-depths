// Do not mutate the character until every required game image is available.
const GAME_IMAGES=[sunGuardianSheet,azimSheet,nefraSheet,saharSheet,rotMotherSheet,morgaSheet,waterPriestSheet,venomKingSheet,abyssSpiritSheet,doomEyeSheet,dimensionHunterSheet,collapseColossusSheet,voidSniperSheet,riftSoldierSheet,starCrystalSheet,voidWolfSheet,revenantSheet,deathFlowerSheet,shadowPantherSheet,tombGiantSheet,boneArcherSheet,gravekeeperSheet,underworldLanternSheet,boneWolfSheet,memorySpiritSheet,arcaneOrbSheet,guardianPantherSheet,ancientColossusSheet,stoneCrossbowSheet,stoneSoldierSheet,bronzeDeviceSheet,ruinHoundSheet,tideSpiritSheet,seaMoonSheet,tideLeapfishSheet,armoredTurtleSheet,coralArcherSheet,drownedSailorSheet,tideCrystalSheet,seaFangSheet,moltenSpiritSheet,fireLampSheet,fireLizardSheet,lavaGiantSheet,fireArcherSheet,ashSoldierSheet,fireCrystalSheet,lavaHoundSheet,stormSpiritSheet,thunderLampSheet,thunderRunnerSheet,chargedGolemSheet,thunderArcherSheet,highlandSoldierSheet,thunderCrystalSheet,thunderWolfSheet,blizzardSpiritSheet,frostFlowerSheet,snowLeopardSheet,iceBearSheet,iceLancerSheet,frozenGuardianSheet,iceHareSheet,snowWolfSheet,sandSpiritSheet,sandLampSheet,sandLizardSheet,sandArcherSheet,sandGolemSheet,sandBanditSheet,caveRidgeSheet,caveCrystalSheet,sandCrystalSheet,sandWolfSheet,heroSheet,enemySheet,abilityAtlas,terrain,knight,revenant,villageSheet,dragonSheet,wolfSheet,behemothSheet,sporeSheet,archerSheet,turtleSheet,boarSheet,scoutSheet,fenSheet,woodlandSheet,meadowTexture,cavernSheet,cavernTexture,rookSheet,hareSheet,garudaSheet,windbirdSheet,ormSheet,batSheet,wispSheet,rockBeastSheet,moleSheet,granitoSheet,minerSheet,lanternSheet,serpentSheet,seleneSheet,valSheet,rootSheet,thornSheet,pantherSheet,owlSheet,eldraSheet,roseSheet,noxSheet,aulSheet,crocSheet,swampWispSheet,sunkenSheet,swampArcherSheet,mudBeastSheet,swampFrogSheet,swampFlowerSheet,swampWaterSheet];
const BASE_GAME_IMAGES=[heroSheet,enemySheet,abilityAtlas,terrain,villageSheet];
function regionGameImages(region,contract=null){let images=[...BASE_GAME_IMAGES];if([0,2,3].includes(region))images.push(woodlandSheet,meadowTexture);if(region===0)images.push(wolfSheet,behemothSheet,sporeSheet,archerSheet,turtleSheet,boarSheet,scoutSheet,fenSheet,rookSheet,hareSheet,garudaSheet,windbirdSheet);if(region===11)images.push(voidWolfSheet,starCrystalSheet,riftSoldierSheet,voidSniperSheet,collapseColossusSheet,dimensionHunterSheet,doomEyeSheet,abyssSpiritSheet);if(region===10)images.push(boneWolfSheet,underworldLanternSheet,gravekeeperSheet,boneArcherSheet,tombGiantSheet,shadowPantherSheet,deathFlowerSheet,revenantSheet);if(region===9)images.push(ruinHoundSheet,bronzeDeviceSheet,stoneSoldierSheet,stoneCrossbowSheet,ancientColossusSheet,guardianPantherSheet,arcaneOrbSheet,memorySpiritSheet);if(region===8)images.push(seaFangSheet,tideCrystalSheet,drownedSailorSheet,coralArcherSheet,armoredTurtleSheet,tideLeapfishSheet,seaMoonSheet,tideSpiritSheet);if(region===7)images.push(lavaHoundSheet,fireCrystalSheet,ashSoldierSheet,fireArcherSheet,lavaGiantSheet,fireLizardSheet,fireLampSheet,moltenSpiritSheet);if(region===6)images.push(thunderWolfSheet,thunderCrystalSheet,highlandSoldierSheet,thunderArcherSheet,chargedGolemSheet,thunderRunnerSheet,thunderLampSheet,stormSpiritSheet);if(region===5)images.push(snowWolfSheet,iceHareSheet,frozenGuardianSheet,iceLancerSheet,iceBearSheet,snowLeopardSheet,frostFlowerSheet,blizzardSpiritSheet);if(region===4)images.push(sandWolfSheet,sandCrystalSheet,sandBanditSheet,sandArcherSheet,sandGolemSheet,sandLizardSheet,sandLampSheet,sandSpiritSheet,saharSheet,nefraSheet,azimSheet,sunGuardianSheet);if(region===3)images.push(crocSheet,swampWispSheet,sunkenSheet,swampArcherSheet,mudBeastSheet,swampFrogSheet,swampFlowerSheet,swampWaterSheet,venomKingSheet,waterPriestSheet,morgaSheet,rotMotherSheet);if(region===1)images.push(caveRidgeSheet,caveCrystalSheet,cavernSheet,cavernTexture,ormSheet,batSheet,wispSheet,rockBeastSheet,moleSheet,granitoSheet,minerSheet,lanternSheet,serpentSheet,seleneSheet,valSheet);if(region===2)images.push(rootSheet,thornSheet,pantherSheet,owlSheet,serpentSheet,sporeSheet,wolfSheet,scoutSheet,eldraSheet,roseSheet,noxSheet,aulSheet);if(contract?.kind==='ex'&&['ex100','ex100skill'].includes(contract.target))images.push(dragonSheet);return images;}
function characterGameImages(character){let c=character?.campaign;return c?.inVillage===false?regionGameImages(c.region,c.contract):BASE_GAME_IMAGES;}
function resumeGameImages(){try{return characterGameImages(decodeSave(localStorage.getItem(SAVE_KEY)).p);}catch{try{return characterGameImages(validHistory()[0]?.data.p);}catch{return BASE_GAME_IMAGES;}}}
let assetRequest=null,assetSequence=0;
const decodedGameImages=new WeakMap(),failedDecodedSources=new WeakMap();
function decodeGameImage(img){
 if(typeof img.decode!=='function')return Promise.resolve();
 const src=img.src,cached=decodedGameImages.get(img);if(cached?.src===src)return cached.promise;
 const entry={src,ready:false,promise:null};decodedGameImages.set(img,entry);
 entry.promise=new Promise((resolve,reject)=>{
  let settled=false,timer;const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);if(error){if(decodedGameImages.get(img)===entry)decodedGameImages.delete(img);failedDecodedSources.set(img,src);reject(error);}else{entry.ready=true;if(failedDecodedSources.get(img)===src)failedDecodedSources.delete(img);resolve();}};
  timer=setTimeout(()=>finish(Error('image decode timeout')),20000);
  Promise.resolve().then(()=>img.decode()).then(()=>finish(img.src!==src||!img.complete||!img.naturalWidth?Error('image changed during decode'):null),finish);
 });return entry.promise;
}
function gameImagesReady(images=BASE_GAME_IMAGES){return images.every(img=>img.complete&&img.naturalWidth>0&&(typeof img.decode!=='function'||decodedGameImages.get(img)?.src===img.src&&decodedGameImages.get(img)?.ready))}
function waitGameImage(img,retry=false){return new Promise((resolve,reject)=>{
 if(img.complete&&img.naturalWidth>0&&!(retry&&failedDecodedSources.get(img)===img.src)){resolve();return}
 let timer;const clean=()=>{clearTimeout(timer);img.removeEventListener('load',loaded);img.removeEventListener('error',failed)},loaded=()=>{clean();img.naturalWidth>0?resolve():reject(Error('image'))},failed=()=>{clean();reject(Error('image'))};
 img.addEventListener('load',loaded);img.addEventListener('error',failed);timer=setTimeout(failed,20000);
 if(img.assetSrc&&!img.src){img.src=img.assetSrc;}
 else if(retry){let url=img.src.split('?')[0];img.src=url+'?reload='+Date.now()}
 else if(img.complete&&!img.naturalWidth)failed();
}).then(()=>decodeGameImage(img))}
function showAssetRequest(){worldMenu('冒険の準備','<p id="assetProgress" role="status" aria-live="polite">画像を準備しています…</p><button id="assetRetry" onclick="retryGameImages()" disabled>もう一度読み込む</button><button onclick="cancelGameImages()">戻る</button>','assets')}
function withGameImages(action,back,images=BASE_GAME_IMAGES){if(assetRequest)return false;if(gameImagesReady(images))return action();assetRequest={id:++assetSequence,action,back,images:[...images],running:false};showAssetRequest();void runGameImageLoad(false);return false}
async function runGameImageLoad(retry){let request=assetRequest;if(!request||request.running)return;request.running=true;let done=0;$('assetRetry').disabled=true;$('assetProgress').textContent='画像を準備中 0 / '+request.images.length;
 let results=await Promise.allSettled(request.images.map(img=>waitGameImage(img,retry).then(()=>{done++;if(assetRequest===request)$('assetProgress').textContent='画像を準備中 '+done+' / '+request.images.length})));
 if(assetRequest!==request)return;request.running=false;
 if(results.some(result=>result.status==='rejected')){$('assetProgress').textContent='一部の画像を準備できませんでした。再試行してください。キャラクターは変更していません。';$('assetRetry').disabled=false;menuFocusElement($('assetRetry'));return}
 assetRequest=null;request.action();
}
function retryGameImages(){void runGameImageLoad(true)}
function cancelGameImages(){let request=assetRequest;if(!request)return;assetRequest=null;request.back()}
function assetBackWelcome(){if(started)showSaveManager();else{menuSurface='';$('card').classList.remove('framed-panel','wide');welcome()}}
const assetNewGame=newGame;newGame=type=>withGameImages(()=>assetNewGame(type),assetBackWelcome);
const assetBeginNew=beginNewCharacter;beginNewCharacter=type=>withGameImages(()=>assetBeginNew(type),()=>showSaveManager());
const assetResume=resume;resume=()=>withGameImages(()=>assetResume(),assetBackWelcome,resumeGameImages());
const assetApplySave=applyPendingSave;applyPendingSave=()=>withGameImages(()=>assetApplySave(),()=>showSaveManager(),characterGameImages(savePending?.data.p));
const assetLoadSave=loadSaveData;loadSaveData=data=>withGameImages(()=>assetLoadSave(data),()=>showSaveManager(),characterGameImages(data.p));
const assetDepart=departRegion;departRegion=id=>{let c=campaign();if(!villageOpen||!Number.isInteger(id)||!REGIONS[id]||id>c.unlocked)return false;return withGameImages(()=>assetDepart(id),()=>showVillage(),regionGameImages(id,c.contract));};
const assetClose=closePanel;closePanel=()=>{if(assetRequest){cancelGameImages();return}assetClose()};
const assetPadMenu=padMenu;padMenu=(g,left,right,dt)=>{if(assetRequest&&(padEdge(g,'back')||padEdge(g,'pause'))){cancelGameImages();return}assetPadMenu(g,left,right,dt)};
















