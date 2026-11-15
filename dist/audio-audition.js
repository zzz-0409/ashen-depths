// Settings-only audition uses the real mixer, without moving the character or changing unlocks.
let audioAudition=null,audioAuditionRequest=0,audioAuditionEffectAt=-Infinity;
function audioAuditionOpen(){return padSettingsOpen&&paused&&!!$('audioAudition');}
function audioAuditionLive(){return !!audioAudition&&audioAuditionOpen()&&!document.hidden&&!dead&&audioPrefs.enabled&&audioContext?.state==='running'&&audioContext.currentTime<audioAudition.until;}
function audioAuditionStatus(text){let el=$('audioAuditionStatus');if(el&&el.textContent!==text)el.textContent=text;}
function stopAudioAudition(){audioAuditionRequest++;audioAudition=null;musicPoll=0;switchMusic(chooseMusicScene());audioAuditionStatus('地域曲を12秒試聴できます');}
async function startAudioAudition(){
 let region=Number($('audioAuditionRegion')?.value),mode=$('audioAuditionMode')?.value;
 if(!audioAuditionOpen()||!Number.isInteger(region)||!REGION_MUSIC[region]||!['explore','battle'].includes(mode))return false;
 let request=++audioAuditionRequest;await unlockAudio();
 if(request!==audioAuditionRequest||!audioAuditionOpen()||document.hidden||dead)return false;
 if(!audioPrefs.enabled||audioContext?.state!=='running'){audioAuditionStatus('音を有効にしてから試聴してください');return false;}
 audioAudition={scene:'region:'+region+':'+mode,until:audioContext.currentTime+12};musicPoll=0;switchMusic(audioAudition.scene);applyAudioLevels();
 audioAuditionStatus(REGION_MUSIC[region].name+' · '+(mode==='battle'?'戦闘':'探索')+'を試聴中（プレイ中の音量）');return true;
}
async function auditionSound(name){
 if(!['impact','fire','loot'].includes(name)||!audioAuditionOpen())return false;let request=audioAuditionRequest;await unlockAudio();
 if(request!==audioAuditionRequest||!audioAuditionOpen()||document.hidden||!audioPrefs.enabled||audioContext?.state!=='running'||audioContext.currentTime<audioAuditionEffectAt)return false;
 audioAuditionEffectAt=audioContext.currentTime+.25;playSound(name);return true;
}
const auditionSceneBase=chooseMusicScene;chooseMusicScene=()=>audioAuditionLive()?audioAudition.scene:auditionSceneBase();
const auditionGainBase=musicGain;musicGain=()=>auditionGainBase()*(paused&&audioAuditionLive()?2.5:1);
const auditionTickBase=tickMusic;tickMusic=(dt=.016)=>{if(audioAudition&&!audioAuditionLive())stopAudioAudition();return auditionTickBase(dt);};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudioAudition();});
function audioAuditionHtml(){let region=typeof worldRegion==='number'&&REGION_MUSIC[worldRegion]?worldRegion:0;return '<div id="audioAudition"><h3>音の聴き比べ</h3><div class="audio-audition-actions"><button onclick="auditionSound(\'impact\')">打撃</button><button onclick="auditionSound(\'fire\')">炎スキル</button><button onclick="auditionSound(\'loot\')">素材回収</button></div><div class="audio-audition-actions"><select id="audioAuditionRegion" aria-label="試聴する地域">'+REGION_MUSIC.map((r,i)=>'<option value="'+i+'" '+(i===region?'selected':'')+'>'+r.name+'</option>').join('')+'</select><select id="audioAuditionMode" aria-label="試聴する場面"><option value="explore">探索</option><option value="battle">戦闘</option></select><button onclick="startAudioAudition()">BGM試聴</button><button onclick="stopAudioAudition()">試聴停止</button></div><p id="audioAuditionStatus" role="status" aria-live="polite">地域曲を12秒試聴できます</p></div>';}
const auditionSettingsBase=showControllerSettings;showControllerSettings=(...args)=>{stopAudioAudition();let result=auditionSettingsBase(...args);let old=$('card').querySelector('button[onclick*="playSound"]');if(old)old.outerHTML=audioAuditionHtml();return result;};
