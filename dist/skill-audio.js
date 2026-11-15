// Ability identity determines the instrument; forged elements never change its rhythm.
const SIGNATURE_AUDIO=[
 ['meteor',90,.7],['trap',440,.2],['wave',180,.4],['brand',620,.3],['garden',330,.45],['chain',880,.22],['orbit',520,.35],['blade',260,.2],
 ['pierce',1050,.16],['guide',740,.3],['ricochet',920,.16],['split',460,.22],['tether',220,.4],['turret',350,.25],['drone',660,.3],['hook',190,.2],
 ['rush',140,.2],['retreat',480,.18],['guard',280,.32],['execute',110,.4],['hammer',75,.35],['combo',390,.15],['echo',560,.28],['tide',160,.5],
 ['barrier',420,.42],['shield',190,.4],['spring',780,.45],['resonance',590,.3],['cage',155,.35],['anchor',460,.4],['clock',1100,.2],['sacrifice',95,.55],
 ['bond',510,.35],['fork',840,.2],['curse',130,.5],['triangle',690,.4],['voltage',980,.16],['solitude',310,.5],['marks',730,.24],['pillars',205,.4],
 ['converge',270,.38],['lighthouse',810,.33],['tripwire',1240,.17],
 ['footfall',365,.21],['stillness',1150,.44],['fissure',175,.32],['distance',950,.27],['chalice',415,.51],
 ['pincer',330,.26],['unwind',705,.37],['footprint',540,.31],['countermark',1320,.19],['reserve',245,.46],
 ['mirrorwind',890,.41],['wallskip',1510,.13],['pyre',145,.57],['gate',610,.48],['pilot',1230,.23],['chant',375,.62],['pilgrimage',465,.58],['runcharge',685,.43],['focuslock',1435,.36],['pathmemory',795,.53],['threeverse',535,.66],['exchange',875,.34],['opposite',1025,.29],['balance',295,.54],['retinue',195,.64],['lifelantern',765,.59]
];
const SKILL_AUDIO_FAMILIES={
 heavy:new Set(['meteor','execute','hammer','sacrifice']),
 metal:new Set(['blade','pierce','ricochet','split','hook','rush','retreat','combo','pincer']),
 electric:new Set(['chain','fork','voltage','resonance','marks','countermark']),
 dark:new Set(['brand','curse','cage','clock','footprint']),
 airy:new Set(['wave','orbit','guide','drone','tide','echo','unwind'])
};
const skillAudioGates=new Map();
function playSignatureAudio(mode,impact=false,x=p.x,y=p.y){
 if(!audioContext||audioContext.state!=='running'||!audioPrefs.enabled||!SIGNATURE_AUDIO[mode])return;
 let now=audioContext.currentTime,key=mode+':'+impact;
 if(impact&&now<(skillAudioGates.get(key)||0))return;
 skillAudioGates.set(key,now+(impact?.07:.04));
 let [kind,freq,length]=SIGNATURE_AUDIO[mode],pan=(project(x,y).x-W/2)/(W/2),level=impact?.09:.065;
 let tone=(ratio,end,duration=length,delay=0,type='sine')=>soundVoice(type,freq*ratio,freq*end,duration,level,pan,delay);
 let noise=(filter,duration=length,volume=level)=>soundVoice('noise',1,1,duration,volume,pan,0,filter);
 if(SKILL_AUDIO_FAMILIES.heavy.has(kind)){noise(impact?420:1100,length,level*1.5);tone(impact?1:.65,impact?.25:1.8,length,0,'triangle');tone(2,.5,length*.6,.035,'sine');}
 else if(SKILL_AUDIO_FAMILIES.metal.has(kind)){noise(impact?2800:4200,length*.7);tone(2.5,.4,length,0,'triangle');tone(4,1.2,length*.5,.025,'sine');}
 else if(SKILL_AUDIO_FAMILIES.electric.has(kind)){noise(3200,length*.5);tone(1,.25,length,0,'sawtooth');tone(1.5,.7,length*.5,.055,'triangle');}
 else if(SKILL_AUDIO_FAMILIES.dark.has(kind)){tone(1,.65,length,0,'triangle');tone(1.06,.7,length,.025);noise(600,length,.035);}
 else if(SKILL_AUDIO_FAMILIES.airy.has(kind)){noise(2200,length,.055);tone(.8,1.5,length,0,'sine');tone(1.5,.75,length,.045);}
 else{tone(1,impact?.7:1,length);tone(1.5,impact?1:1.5,length*.8,.055);tone(2,impact?1.5:2,length*.7,.11);}
}
// Suppress the shared fire sound only while dispatching a scripted ability.
let signatureAudioCasting=false;
const signatureAudioPlayBase=playSound;playSound=(name,...args)=>{if(signatureAudioCasting&&name==='fire')return;return signatureAudioPlayBase(name,...args);};
const signatureAudioCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let mode=GEM[build.type]?.signature;if(mode===undefined)return signatureAudioCastBase(build,...args);
 let before=new Set(signatureSpells),anchor=signatureSpells.find(s=>s.mode===mode),linked=anchor?.linked;
 let prior=signatureAudioCasting;signatureAudioCasting=true;
 try{return signatureAudioCastBase(build,...args);}finally{
  signatureAudioCasting=prior;
  if(signatureSpells.some(s=>!before.has(s))||(mode===29&&anchor&&!signatureSpells.includes(anchor))||(mode===39&&anchor&&!linked&&anchor.linked))playSignatureAudio(mode);
 }
};
const signatureAudioHitBase=spellHit;spellHit=(enemy,damage,build)=>{
 let alive=enemy.hp>0,result=signatureAudioHitBase(enemy,damage,build);
 if(alive&&damage>0&&GEM[build.type]?.signature!==undefined)playSignatureAudio(GEM[build.type].signature,true,enemy.x,enemy.y);
 return result;
};
