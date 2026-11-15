// CC0 author-made recordings, locally bundled. Never synthesize a fallback.
const RECORDED_SFX={
 slash:['rpg-knifeSlice','rpg-knifeSlice2'],impact:['rpg-chop','rpg-metalPot1'],arrow:['rpg-drawKnife1','rpg-drawKnife2'],
 step:['rpg-footstep00','rpg-footstep01','rpg-footstep02','rpg-footstep03'],dash:['rpg-cloth1','rpg-cloth2'],
 ui:['ui-click_001'],confirm:['ui-select_001'],open:['ui-open_001'],close:['ui-close_001'],
 loot:['rpg-handleCoins','rpg-handleCoins2'],level:['ui-confirmation_001'],seal:['magic-7'],
 fire:['magic-1'],frost:['magic-2'],arc:['magic-3'],water:['magic-4'],wind:['magic-5'],poison:['magic-6'],vortex:['magic-7'],
 heal:['magic-4'],screech:['magic-6'],hurt:['rpg-chop'],death:['magic-7'],warning:['magic-3']
};
const recordedBuffers=new Map(),recordedPending=new Map(),recordedGates=new Map();let recordedVoices=0,recordedSerial=0;
async function loadRecordedSfx(file){if(recordedBuffers.has(file))return recordedBuffers.get(file);if(!audioContext)return null;if(!recordedPending.has(file)){const context=audioContext;recordedPending.set(file,(async()=>{try{const response=await fetch('assets/audio/sfx/'+file+'.ogg');if(!response.ok)throw Error('SFX HTTP '+response.status);const buffer=await context.decodeAudioData(await response.arrayBuffer());recordedBuffers.set(file,buffer);return buffer;}catch{return null;}finally{recordedPending.delete(file);}})());}return recordedPending.get(file);}
async function preloadRecordedSfx(){return Promise.all([...new Set(Object.values(RECORDED_SFX).flat())].map(loadRecordedSfx));}
function recordedPlay(name,x=p?.x||0,y=p?.y||0,options={}){
 if(!audioContext||audioContext.state!=='running'||!audioPrefs.enabled||document.hidden)return false;
 const files=RECORDED_SFX[name]||RECORDED_SFX.fire,now=audioContext.currentTime,gate=options.gate??(name==='step'?.15:name==='impact'?.055:name==='ui'?.07:.04),key=options.key||name;
 if(now<(recordedGates.get(key)||0)||recordedVoices>=20)return false;recordedGates.set(key,now+gate);
 const file=files[(recordedSerial++)%files.length],buffer=recordedBuffers.get(file);if(!buffer){loadRecordedSfx(file);return false;}
 const source=audioContext.createBufferSource(),gain=audioContext.createGain(),pan=audioContext.createStereoPanner();source.buffer=buffer;source.playbackRate.value=options.rate||1;
 gain.gain.value=options.volume??(name==='step'?.22:['ui','confirm','open','close'].includes(name)?.45:.7);
 pan.pan.value=started&&Number.isFinite(x)&&Number.isFinite(y)?clamp((project(x,y).x-W/2)/(W/2),-.75,.75):0;
 source.connect(gain);gain.connect(pan);pan.connect(sfxBus);recordedVoices++;source.onended=()=>{recordedVoices--;source.disconnect();gain.disconnect();pan.disconnect();};source.start(now+(options.delay||0));return true;
}
createAmbience=()=>{};
// Legacy warning callers also resolve to recordings; no oscillators/noise voices.
soundVoice=(type,freq,end,duration,volume,pan,delay=0)=>recordedPlay(type==='noise'?'impact':'warning',p?.x,p?.y,{volume:Math.min(.7,(volume||.1)*4),delay,gate:.12});
playSound=(name,...args)=>{if(signatureAudioCasting&&name==='fire')return false;if(!RECORDED_SFX[name]&&typeof GEM!=='undefined'&&GEM[name])name=GEM[name].tags?.includes('melee')?'slash':'fire';return recordedPlay(name,...args);};
playSignatureAudio=(mode,impact=false,x=p?.x,y=p?.y)=>{if(!SIGNATURE_AUDIO[mode])return;const kind=SIGNATURE_AUDIO[mode][0],family=SKILL_AUDIO_FAMILIES.metal.has(kind)?'slash':SKILL_AUDIO_FAMILIES.heavy.has(kind)?'vortex':SKILL_AUDIO_FAMILIES.electric.has(kind)?'arc':SKILL_AUDIO_FAMILIES.dark.has(kind)?'poison':['fire','frost','water','wind','heal'][mode%5];return recordedPlay(impact?'impact':family,x,y,{key:'signature:'+mode+':'+impact,gate:impact?.09:.08,rate:.94+(mode%5)*.03,volume:impact?.35:.65});};
playRewardChord=kind=>{if(audioContext)musicDuckUntil=audioContext.currentTime+1.2;return recordedPlay(kind==='boss'?'seal':kind==='rare'?'level':'loot');};
playImpactAccent=(x,y,critical=false)=>recordedPlay('impact',x,y,{key:'impact',volume:critical?.9:.55});
const recordedUnlockBase=unlockAudio;unlockAudio=async()=>{await recordedUnlockBase();await preloadRecordedSfx();};
document.addEventListener('click',e=>{if(e.target.closest?.('button:not(:disabled),summary'))playSound('confirm');});
const recordedCloseBase=closePanel;closePanel=(...args)=>{const was=paused,result=recordedCloseBase(...args);if(was&&!paused)playSound('close');return result;};
const recordedPanelBase=panel;panel=(...args)=>{const before=menuSurface,result=recordedPanelBase(...args);if(menuSurface!==before)playSound('open');return result;};
showAudioCredits=()=>worldMenu('音楽・効果音クレジット','<h3>BGM · CC0</h3><p>Alexander Ehlers · MintoDog · skrjablin</p><h3>効果音 · CC0</h3><p>Kenney：RPG Audio（2014）／Interface Sounds（2020）<br>JaggedStone：Magic Spell SFX（2014）</p><p>作者制作の音源を同梱しています。出典・ライセンス・変更内容は AUDIO-LICENSES.txt に記載。</p><button onclick="showControllerSettings()">音・演出設定へ戻る</button>','settings');
