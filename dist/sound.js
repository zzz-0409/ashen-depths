// Original procedural effects. Licensed recordings are handled by audio-director.js.
let audioPrefs={enabled:true,master:.55,effects:.75,ambience:.3};try{Object.assign(audioPrefs,JSON.parse(localStorage.getItem('ashen-audio-v1')||'{}'))}catch{}
let audioResumePending=null;
let audioContext=null,audioMaster=null,sfxBus=null,ambientBus=null,audioNoise=null,voiceCount=0,footTimer=0,soundHitGate=0,ambienceNodes=[];
function storeAudio(){try{localStorage.setItem('ashen-audio-v1',JSON.stringify(audioPrefs))}catch{}}
function audioAvailable(){return !!(window.AudioContext||window.webkitAudioContext)}
function initAudio(){if(audioContext)return;if(!audioAvailable())return;audioContext=new(window.AudioContext||window.webkitAudioContext)();audioContext.onstatechange=refreshAudioBadge;audioMaster=audioContext.createGain();sfxBus=audioContext.createGain();ambientBus=audioContext.createGain();let compressor=audioContext.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=18;compressor.ratio.value=5;compressor.attack.value=.006;compressor.release.value=.18;sfxBus.connect(compressor);ambientBus.connect(compressor);compressor.connect(audioMaster);let limiter=audioContext.createDynamicsCompressor();limiter.threshold.value=-3;limiter.knee.value=0;limiter.ratio.value=20;limiter.attack.value=.003;limiter.release.value=.15;audioMaster.connect(limiter);limiter.connect(audioContext.destination);audioNoise=audioContext.createBuffer(1,audioContext.sampleRate*2,audioContext.sampleRate);let data=audioNoise.getChannelData(0),last=0;for(let i=0;i<data.length;i++){last=.65*last+.35*(Math.random()*2-1);data[i]=last}createAmbience();applyAudioLevels()}
async function unlockAudio(){try{initAudio();refreshAudioBadge();if(audioContext?.state==='suspended'){if(!audioResumePending)audioResumePending=audioContext.resume().finally(()=>{audioResumePending=null});await audioResumePending;}applyAudioLevels();refreshAudioBadge()}catch{refreshAudioBadge()}}
function applyAudioLevels(){if(!audioContext)return;let t=audioContext.currentTime;audioMaster.gain.setTargetAtTime(audioPrefs.enabled?clamp(+audioPrefs.master,0,1):0,t,.05);sfxBus.gain.setTargetAtTime(clamp(+audioPrefs.effects,0,1)*1.4,t,.05);ambientBus.gain.setTargetAtTime(clamp(+audioPrefs.ambience,0,1)*(paused?.25:1),t,.25)}
function refreshAudioBadge(){let badge=$('soundBadge');if(badge)badge.textContent=!audioAvailable()?'音声 非対応':!audioPrefs.enabled?'音 OFF':audioContext?.state==='running'?'音 ON':audioContext?'音声待機 · クリック':'音を有効化'}
async function toggleAudio(){if(!audioContext||audioContext.state!=='running'){audioPrefs.enabled=true;await unlockAudio()}else{audioPrefs.enabled=!audioPrefs.enabled;applyAudioLevels()}storeAudio();refreshAudioBadge()}
function changeAudio(key,value){audioPrefs[key]=clamp(+value,0,1);applyAudioLevels();storeAudio()}
function createAmbience(){for(let [frequency,volume]of[[55,.045],[82.41,.022],[110.15,.012]]){let osc=audioContext.createOscillator(),gain=audioContext.createGain(),filter=audioContext.createBiquadFilter();osc.type='sine';osc.frequency.value=frequency;gain.gain.value=volume;filter.type='lowpass';filter.frequency.value=250;osc.connect(filter);filter.connect(gain);gain.connect(ambientBus);osc.start();ambienceNodes.push(osc)}let wind=audioContext.createBufferSource(),filter=audioContext.createBiquadFilter(),gain=audioContext.createGain();wind.buffer=audioNoise;wind.loop=true;filter.type='lowpass';filter.frequency.value=420;gain.gain.value=.075;wind.connect(filter);filter.connect(gain);gain.connect(ambientBus);wind.start();let lfo=audioContext.createOscillator(),amount=audioContext.createGain();lfo.frequency.value=.09;amount.gain.value=.025;lfo.connect(amount);amount.connect(gain.gain);lfo.start();ambienceNodes.push(wind,lfo)}
function soundVoice(type,freq,end,duration,volume,pan=0,delay=0,filterFreq=1800){if(!audioContext||audioContext.state!=='running'||!audioPrefs.enabled||voiceCount>36)return;let t=audioContext.currentTime+delay,gain=audioContext.createGain(),filter=audioContext.createBiquadFilter(),panner=audioContext.createStereoPanner(),source;filter.type=type==='noise'?'bandpass':'lowpass';filter.frequency.setValueAtTime(filterFreq,t);filter.Q.value=type==='noise'?.7:.3;if(type==='noise'){source=audioContext.createBufferSource();source.buffer=audioNoise;source.playbackRate.value=freq}else{source=audioContext.createOscillator();source.type=type;source.frequency.setValueAtTime(Math.max(20,freq),t);source.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration)}gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);panner.pan.value=clamp(pan,-.8,.8);source.connect(filter);filter.connect(gain);gain.connect(panner);panner.connect(sfxBus);voiceCount++;source.onended=()=>{voiceCount--;source.disconnect();filter.disconnect();gain.disconnect();panner.disconnect()};source.start(t);source.stop(t+duration+.025)}
function playSound(name,x=p?.x||0,y=p?.y||0){if(!audioContext||audioContext.state!=='running')return;let pan=started?(project(x,y).x-W/2)/(W/2):0;const tone=(f,e,d,v,type='sine',delay=0)=>soundVoice(type,f,e,d,v,pan,delay),noise=(d,v,filter=1500,delay=0)=>soundVoice('noise',1,1,d,v,pan,delay,filter);
if(name==='slash'){noise(.17,.19,2100);tone(220,65,.18,.12,'triangle')}
if(name==='impact'){if(audioContext.currentTime<soundHitGate)return;soundHitGate=audioContext.currentTime+.035;noise(.1,.18,760);tone(110,38,.15,.17)}
if(name==='fire'){noise(.42,.24,800);tone(150,38,.35,.2,'sawtooth');tone(330,80,.17,.07,'triangle')}
if(name==='poison'){noise(.38,.1,620);tone(170,55,.3,.06,'triangle');tone(310,95,.22,.035,'sine',.06)}
if(name==='frost'){noise(.5,.18,4300);[1100,1550,2100].forEach((f,i)=>tone(f,f*.8,.4,.045,'sine',i*.04))}
if(name==='arc'){noise(.17,.2,3200);tone(700,120,.22,.12,'sawtooth');tone(1800,300,.1,.045,'square',.07)}
if(name==='water'){noise(.3,.15,1800);tone(500,180,.3,.09,'sine')}
if(name==='wind'){noise(.5,.17,2400);tone(300,100,.45,.05,'triangle')}
if(name==='screech'){tone(1200,420,.3,.045,'triangle');tone(1700,650,.22,.025,'sine',.08)}
if(name==='arrow'){noise(.15,.15,3600);tone(700,180,.18,.07,'triangle')}
if(name==='vortex'){noise(.8,.15,500);tone(95,45,.8,.17,'sawtooth');tone(220,90,.7,.06,'triangle')}
if(name==='dash'){noise(.25,.12,2600);tone(400,100,.2,.05,'triangle')}
if(name==='heal'){[330,440,660].forEach((f,i)=>tone(f,f,.35,.07,'sine',i*.07));noise(.2,.04,3000)}
if(name==='loot'){tone(900,600,.15,.06,'triangle');tone(1300,900,.18,.04,'sine',.07)}
if(name==='level'){[220,277.18,329.63,440].forEach((f,i)=>tone(f,f,.8,.07,'triangle',i*.13))}
if(name==='step'){noise(.065,.055,550);tone(75,40,.075,.04)}
if(name==='hurt'){noise(.15,.13,480);tone(70,30,.2,.16)}
if(name==='seal'){tone(110,220,1.1,.13,'triangle');[440,554,660].forEach((f,i)=>tone(f,f,.8,.055,'sine',.1+i*.1))}
if(name==='ui'){tone(480,380,.06,.035,'triangle')}
if(name==='death'){tone(110,28,1.4,.15,'sawtooth');noise(.8,.13,350)}}
function audioToggleTarget(target){return !!target?.closest?.('button')?.getAttribute('onclick')?.includes('toggleAudio(')}
addEventListener('pointerdown',e=>{if(audioPrefs.enabled&&!audioToggleTarget(e.target))unlockAudio()},true);
addEventListener('keydown',e=>{let typing=/INPUT|SELECT|TEXTAREA/.test(e.target?.tagName||'');if(!typing&&e.key.toLowerCase()==='m'){if(!e.repeat)toggleAudio();return;}if(audioPrefs.enabled&&!e.repeat&&!audioToggleTarget(e.target))unlockAudio()},true);
const soundPerform=performAction;performAction=a=>{soundPerform(a);playSound(a.n===0?'slash':p.bindings[skillBindingIndex(a.n)]==='cleave'?'slash':p.bindings[skillBindingIndex(a.n)])};
const soundHit=hit;hit=(e,d)=>{let before=e.hp,lv=p.level;soundHit(e,d);if(e.hp<before)playSound('impact',e.x,e.y);if(p.level>lv)playSound('level')};
const soundHurt=hurt;hurt=d=>{let hp=p.hp;soundHurt(d);if(p.hp<hp)playSound('hurt')};
const soundHeal=heal;heal=()=>{let hp=p?.hp;soundHeal();if(p&&p.hp>hp)playSound('heal')};
const soundCast=cast;cast=n=>{let before=cd[n];soundCast(n);if(n===3&&cd[n]>before)playSound('dash')};
const soundInteract=interact;interact=()=>{let gold=p?.gold,bag=p?.bag.length,seal=seals;soundInteract();if(seals>seal)playSound('seal');else if(p&&(p.gold>gold||p.bag.length>bag))playSound('loot')};
let wasSoundPaused=paused,wasSoundDead=dead;
const soundUpdate=update;update=dt=>{let x=p?.x,y=p?.y;soundUpdate(dt);if(started&&!paused&&p){footTimer-=dt;if((p.x!==x||p.y!==y)&&footTimer<=0){footTimer=.28;playSound('step')}}if(paused!==wasSoundPaused){wasSoundPaused=paused;applyAudioLevels()}if(dead&&!wasSoundDead)playSound('death');wasSoundDead=dead};
document.querySelector('.menu').insertAdjacentHTML('afterbegin','<button id="soundBadge" onclick="toggleAudio()">音を有効化</button>');refreshAudioBadge();

