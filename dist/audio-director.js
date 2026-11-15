// Local, licensed recordings only. Nothing streams from a third party.
audioPrefs.music=Number.isFinite(+audioPrefs.music)?clamp(+audioPrefs.music,0,1):.35;
const MUSIC_TRACKS={explore:'assets/audio/great-labyrinth.ogg',battle:'assets/audio/fairy-battles.ogg',boss:'assets/audio/final-battle.ogg'};
let musicBus=null,musicVoices=[],musicScene='',musicThreatUntil=0,musicNextNote=0,musicNote=0,musicDuckUntil=0,musicOwner=null,musicPoll=0;
const musicFailures=new Set();
const musicParked=new Map();
function musicGain(){return audioPrefs.enabled&&!document.hidden&&!dead?audioPrefs.music*.4*(paused?.4:1)*(audioContext?.currentTime<musicDuckUntil?.5:1):0;}
function initMusicBus(){if(!audioContext||musicBus)return;musicBus=audioContext.createGain();musicBus.gain.value=0;musicBus.connect(audioMaster);}
function stopMusicVoice(v){v.el.pause();v.level=0;v.gain.gain.cancelScheduledValues?.(audioContext.currentTime);v.gain.gain.setValueAtTime(0,audioContext.currentTime);if(!v.failed){v.parked=true;musicParked.set(v.url,v);return;}v.disposed=true;v.el.removeAttribute('src');v.el.load();v.source.disconnect();v.gain.disconnect();musicParked.delete(v.url);}
function switchMusic(scene){
 if(musicScene===scene)return;let url=MUSIC_TRACKS[scene];musicScene=scene;musicNextNote=0;musicNote=0;
 for(let v of musicVoices)v.target=0;
 // Turning back during a fade keeps the same recording and playback position.
 let returning=musicVoices.find(v=>v.url===url&&!v.failed&&!v.disposed);if(returning){returning.scene=scene;returning.target=1;return;}
 // At most two recordings during a crossfade, even when regions change rapidly.
 while(musicVoices.length>1)stopMusicVoice(musicVoices.shift());
 if(!url||musicFailures.has(scene)||!musicBus)return;
 // Retain streaming elements by recording URL: seeking is not reliable on all static servers.
 let parked=musicParked.get(url);if(parked&&!parked.failed){musicParked.delete(url);parked.scene=scene;parked.parked=false;parked.target=1;musicVoices.push(parked);return;}
 let el=new Audio();el.preload='none';el.loop=true;el.src=url;
 let source=audioContext.createMediaElementSource(el),gain=audioContext.createGain();gain.gain.value=0;source.connect(gain);gain.connect(musicBus);
 let voice={el,source,gain,scene,url,level:0,target:1,pending:false,failed:false};
 el.addEventListener('error',()=>{if(voice.disposed)return;voice.failed=true;voice.target=0;musicFailures.add(scene);if(voice.parked)stopMusicVoice(voice);});musicVoices.push(voice);
}
function chooseMusicScene(){
 if(!started||!p||villageOpen)return 'village';
 let boss=enemies.some(e=>e.hp>0&&e.boss&&!e.dummy&&dist(e,p)<850&&lineClear(p,e)&&(e.aware||e.bossProvoked||e.state==='attack'));
 if(boss){musicThreatUntil=clock+5;return 'boss';}
 if(musicScene==='boss'&&clock<musicThreatUntil&&enemies.some(e=>e.hp>0&&e.boss))return 'boss';
 if(combatHudThreat()){musicThreatUntil=clock+4;return 'battle';}
 if(musicScene==='battle'&&clock<musicThreatUntil)return 'battle';
 return 'explore';
}
// BGM never synthesizes a replacement melody; failed recordings remain silent.
function musicVillageNote(){}
function tickMusic(dt=.016){
 if(!audioContext||audioContext.state!=='running')return;initMusicBus();
 musicBus.gain.setTargetAtTime(musicGain(),audioContext.currentTime,.18);
 if(musicOwner!==p){musicOwner=p;musicThreatUntil=0;musicPoll=0;}
 musicPoll-=dt;if(musicPoll<=0){musicPoll=.25;switchMusic(chooseMusicScene());}
 let audible=audioPrefs.enabled&&audioPrefs.music>0&&!document.hidden&&!dead;
 let incoming=musicVoices.find(v=>v.target===1&&!v.failed),waiting=incoming&&incoming.el.readyState<2;
 for(let v of [...musicVoices]){
  let target=waiting?(v===incoming?0:1):v.target;
  v.level+=(target-v.level)*Math.min(1,dt*2);v.gain.gain.setTargetAtTime(v.level*.65,audioContext.currentTime,.12);
  if(v.failed||!target&&v.level<.01&&v!==incoming){stopMusicVoice(v);musicVoices.splice(musicVoices.indexOf(v),1);continue;}
  if(!audible){v.el.pause();continue;}
  if(v.el.paused&&!v.pending&&!v.blocked){v.pending=true;v.el.play().catch(error=>{if(v.disposed||v.parked||error?.name==='AbortError')return;if(error?.name==='NotAllowedError'){v.blocked=true;return;}v.failed=true;musicFailures.add(v.scene);}).finally(()=>v.pending=false);}
 }
}
const directorLevelsBase=applyAudioLevels;applyAudioLevels=()=>{directorLevelsBase();if(!audioContext)return;if(document.hidden)audioMaster.gain.setTargetAtTime(0,audioContext.currentTime,.05);if(musicBus)musicBus.gain.setTargetAtTime(musicGain(),audioContext.currentTime,.1);};
const directorUnlockBase=unlockAudio;unlockAudio=async()=>{await directorUnlockBase();for(let v of [...musicVoices,...musicParked.values()])v.blocked=false;tickMusic();};
const directorUpdateBase=update;update=dt=>{directorUpdateBase(dt);tickMusic(Math.max(0,Math.min(.1,dt||0)));};
document.addEventListener('visibilitychange',()=>{applyAudioLevels();if(document.hidden)for(let v of musicVoices)v.el.pause();});
function playRewardChord(kind){
 if(!audioContext||audioContext.state!=='running'||!audioPrefs.enabled)return;
 musicDuckUntil=audioContext.currentTime+1.2;
 let tones=kind==='boss'?[146.83,220,293.66,369.99,440,587.33]:kind==='rare'?[659.25,830.61,987.77,1318.51]:[392,493.88,587.33];
 tones.forEach((f,i)=>soundVoice('triangle',f,f,.65,kind==='boss'?.07:.045,0,i*.075));
 if(kind==='boss')soundVoice('noise',1,1,.5,.15,0,0,280);
}
function playImpactAccent(x,y,critical=false){
 if(!audioContext||audioContext.state!=='running'||!audioPrefs.enabled)return;
 let pan=clamp((project(x,y).x-W/2)/(W/2),-.8,.8),pitch=critical?180:105;
 soundVoice('triangle',pitch,38,.13,critical?.12:.075,pan);
 soundVoice('noise',1,1,.075,critical?.1:.065,pan,0,critical?2600:1250);
 if(critical)soundVoice('sine',1320,880,.18,.04,pan,.015);
}
let menuSoundGate=0;
document.addEventListener('focusin',event=>{
 if(!paused||!audioContext||audioContext.state!=='running'||!$('card')?.contains(event.target)||!event.target.matches('button,input,select,summary'))return;
 if(audioContext.currentTime<menuSoundGate)return;menuSoundGate=audioContext.currentTime+.075;playSound('ui');
});
if(typeof craftForgeRecipe==='function'){const base=craftForgeRecipe;craftForgeRecipe=(...args)=>{let ok=base(...args);if(ok)playRewardChord('craft');return ok;};}
if(typeof craftMaterialGear==='function'){const base=craftMaterialGear;craftMaterialGear=(...args)=>{let ok=base(...args);if(ok)playRewardChord('craft');return ok;};}
if(typeof craftSkillGem==='function'){const base=craftSkillGem;craftSkillGem=(...args)=>{let ok=base(...args);if(ok)playRewardChord('craft');return ok;};}
