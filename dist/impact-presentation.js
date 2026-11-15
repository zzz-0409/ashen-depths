let presentationPrefs={shake:.65,largeText:false,reduced:false};try{Object.assign(presentationPrefs,JSON.parse(localStorage.getItem('ashen-presentation-v1')||'{}'));}catch{}
presentationPrefs.shake=Number.isFinite(+presentationPrefs.shake)?clamp(+presentationPrefs.shake,0,1):.65;
function applyPresentationPrefs(){document.body.classList.toggle('large-game-text',!!presentationPrefs.largeText);document.body.classList.toggle('reduced-presentation',!!presentationPrefs.reduced);}
function changePresentation(key,value){if(key==='shake')presentationPrefs.shake=clamp(Number(value)||0,0,1);else if(key==='largeText'||key==='reduced')presentationPrefs[key]=!!value;try{localStorage.setItem('ashen-presentation-v1',JSON.stringify(presentationPrefs));}catch{}applyPresentationPrefs();}
applyPresentationPrefs();
let impactBursts=[],impactGate=0,rewardEvent=null,killChain=0,killChainTime=0;
const rewardToast=document.createElement('div');rewardToast.id='rewardMoment';rewardToast.hidden=true;rewardToast.setAttribute('role','status');rewardToast.setAttribute('aria-live','polite');document.body.append(rewardToast);
let materialPickupFeed=[],materialPickupSoundAt=-Infinity;
const materialPickupToast=document.createElement('div');materialPickupToast.id='materialPickupFeed';materialPickupToast.hidden=true;materialPickupToast.setAttribute('role','status');materialPickupToast.setAttribute('aria-live','polite');document.body.append(materialPickupToast);
function renderMaterialPickupFeed(){
 materialPickupToast.replaceChildren();
 for(let entry of materialPickupFeed){let material=MATERIALS[entry.id];if(!material)continue;
  let row=document.createElement('div'),icon=document.createElement('span'),label=document.createElement('span'),count=document.createElement('b');
  row.className='pickup-feed-row';row.dataset.tier=String(material.tier);icon.className='pickup-feed-icon';
  if(typeof materialIcon==='function')icon.innerHTML=materialIcon(entry.id);else icon.textContent='◆';
  label.textContent=material.name;count.textContent='×'+entry.count;row.append(icon,label,count);materialPickupToast.append(row);
 }
 materialPickupToast.hidden=!materialPickupFeed.length||paused||dead;
}
function recordMaterialPickup(id,count){
 if(!MATERIALS[id]||!Number.isFinite(count)||count<=0)return;
 let entry=materialPickupFeed.find(v=>v.id===id);
 if(entry){entry.count+=count;entry.life=4;materialPickupFeed.splice(materialPickupFeed.indexOf(entry),1);}else entry={id,count,life:4};
 materialPickupFeed.unshift(entry);materialPickupFeed.length=Math.min(4,materialPickupFeed.length);renderMaterialPickupFeed();
 // Coalesce repeated pickup chimes, without losing the item quantities on screen.
 let now=audioContext?.currentTime??clock;if(now-materialPickupSoundAt>=.2){materialPickupSoundAt=now;if(MATERIALS[id].tier>=2)playRewardChord('rare');else playSound('loot');}
}
function showRewardMoment(title,detail,kind='normal'){
 if(rewardEvent?.kind==='boss'&&kind!=='boss')return;
 rewardEvent={title,detail,kind,life:kind==='boss'?4:2.4};rewardToast.replaceChildren();let h=document.createElement('strong'),d=document.createElement('span');h.textContent=title;d.textContent=detail;rewardToast.append(h,d);rewardToast.dataset.kind=kind;playRewardChord(kind);
}
function recordImpact(e){
 if(!started||paused||dead||e.dotTick||treeExplosion||!visibleAt(e.x,e.y)||clock<impactGate)return;
 impactGate=clock+.065;let text=texts.at(-1),critical=!!(text?.crit&&text.x===e.x);playImpactAccent(e.x,e.y,critical);impactBursts.push({x:e.x,y:e.y,life:.22,max:.22,angle:Math.atan2(e.y-p.y,e.x-p.x),strong:critical||classHitKind==='ultimate'});if(impactBursts.length>12)impactBursts.shift();
}
const presentationHitBase=hit;hit=(e,d)=>{let hp=e?.hp,training=e?.trainingHits||0;let result=presentationHitBase(e,d);if(e&&(e.hp<hp||(e.trainingHits||0)>training))recordImpact(e);return result;};
const presentationKillBase=worldKill;worldKill=e=>{let rewarded=e?.rewarded;let result=presentationKillBase(e);if(e?.rewarded&&!rewarded&&!e.dummy){
 if(e.boss){showRewardMoment('討伐達成',SPECIES[e.species]?.name||'強敵を撃破','boss');impactBursts.push({x:e.x,y:e.y,life:1,max:1,strong:true,angle:0});}
 else{killChain=killChainTime>0?killChain+1:1;killChainTime=3;if(killChain===5||killChain%10===0)showRewardMoment(killChain+' 連続討伐','戦いをつなげ！','chain');}
 }return result;};
const presentationInteractBase=interact;interact=()=>{let loot=started&&p?materialPickupTarget():null,had=loot&&drops.includes(loot),result=presentationInteractBase();if(had&&!drops.includes(loot)){
 recordMaterialPickup(loot.material.id,loot.material.count);
 if($('toast')?.textContent==='素材：'+loot.item?.name){notice=0;$('toast').textContent='';}
 }return result;};
const presentationUltimateBase=activateUltimate;activateUltimate=()=>{let result=presentationUltimateBase();if(result)showRewardMoment(profession().ultimate,'必殺技発動','ultimate');return result;};
const presentationLoadBase=loadWorld;loadWorld=(...args)=>{impactBursts=[];impactGate=0;rewardEvent=null;killChain=0;killChainTime=0;rewardToast.hidden=true;materialPickupFeed=[];materialPickupSoundAt=-Infinity;materialPickupToast.hidden=true;return presentationLoadBase(...args);};
const presentationUpdateBase=update;update=dt=>{let active=started&&!paused&&!dead;presentationUpdateBase(dt);if(active&&!paused&&!dead){for(let b of impactBursts)b.life-=dt;impactBursts=impactBursts.filter(b=>b.life>0);killChainTime=Math.max(0,killChainTime-dt);if(rewardEvent){rewardEvent.life-=dt;if(rewardEvent.life<=0)rewardEvent=null;}let count=materialPickupFeed.length;for(let entry of materialPickupFeed)entry.life-=dt;materialPickupFeed=materialPickupFeed.filter(entry=>entry.life>0);if(count!==materialPickupFeed.length)renderMaterialPickupFeed();}rewardToast.hidden=!rewardEvent||paused||dead;materialPickupToast.hidden=!materialPickupFeed.length||paused||dead;};
const presentationGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 presentationGroundBase();if(!started||!p)return;ctx.save();
 if(!presentationPrefs.reduced)for(let b of impactBursts){if(b.raster)continue;if(!visibleAt(b.x,b.y))continue;let s=project(b.x,b.y),t=1-b.life/b.max;ctx.globalAlpha=(1-t)*.8;ctx.strokeStyle=b.strong?'#fff1b8':'#ffe0a0';ctx.lineWidth=b.strong?3:2;for(let i=0;i<5;i++){let a=b.angle+i*Math.PI*.4,r=(b.strong?70:28)*t+8;ctx.beginPath();ctx.moveTo(s.x+Math.cos(a)*r*.5,s.y-20+Math.sin(a)*r*.5);ctx.lineTo(s.x+Math.cos(a)*r,s.y-20+Math.sin(a)*r);ctx.stroke();}}
 // Rare drops remain visible without flashing or covering attack telegraphs.
 let count=0;for(let d of drops){let m=d.material&&MATERIALS[d.material.id];if(!m||m.tier<2||!visibleAt(d.x,d.y)||count++>=16)continue;let s=project(d.x,d.y);ctx.globalAlpha=.65;ctx.strokeStyle=m.color;ctx.lineWidth=m.tier===3?3:2;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x,s.y-(m.tier===3?85:52));ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=m.color;ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText(m.tier===3?'◆':'◇',s.x,s.y-8);}
 ctx.restore();
};
const presentationDrawBase=draw;draw=()=>{let saved=shake;shake*=presentationPrefs.reduced?0:presentationPrefs.shake;try{return presentationDrawBase();}finally{shake=saved;}};
function presentationSettingsHtml(){return '<h3>読みやすさ・演出</h3><label class="slider-label">画面揺れ<input aria-label="画面揺れ" type="range" min="0" max="1" step=".05" value="'+presentationPrefs.shake+'" oninput="changePresentation(\'shake\',this.value)"></label><label class="presentation-check"><input type="checkbox" '+(presentationPrefs.largeText?'checked':'')+' onchange="changePresentation(\'largeText\',this.checked)">文字を大きく</label><label class="presentation-check"><input type="checkbox" '+(presentationPrefs.reduced?'checked':'')+' onchange="changePresentation(\'reduced\',this.checked)">追加演出と画面揺れを抑える</label><button onclick="showAudioCredits()">音楽・素材クレジット</button>';}
const presentationSettingsBase=showControllerSettings;showControllerSettings=(...args)=>{let result=presentationSettingsBase(...args);$('card').querySelector('.settings-grid section')?.insertAdjacentHTML('beforeend',presentationSettingsHtml());return result;};
function showAudioCredits(){worldMenu('音楽・素材クレジット','<div class="audio-credits"><h3>BGM · CC0 1.0</h3><p>探索（予備曲）：Great Labyrinth — MintoDog<br>戦闘（予備曲）：Fairy Battles — MintoDog<br>ボス：The Final Battle — skrjablin</p><p>12地域の探索曲・戦闘編成、村の旋律・効果音：本ゲーム用のオリジナル合成音。</p><p>録音BGMはOpenGameArtの各配布ページでCC0を確認し、ローカル同梱しています。作者による本ゲームの推奨を意味しません。</p><p>出典・ライセンス・変更内容は同梱のAUDIO-LICENSES.txtに記載。</p><button onclick="showControllerSettings()">音・演出設定へ戻る</button></div>','settings');}
