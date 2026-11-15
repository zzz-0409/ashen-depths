// Read-only views of the actual combat resources; no separate UI timers.
const JOB_COMBAT_LOOPS=[
 ['通常攻撃で連撃をためる','Cで前方へ解放','3連撃目の強化を生かす'],
 ['Cで堅守に入る','攻撃を防いで反撃を蓄積','Cで反撃・SP切れ前に解除'],
 ['通常攻撃で魔力とMPを回収','Cで魔力を解放','4秒間にジェムスキルを集中'],
 ['照準を合わせCで標識','距離180以上を保つ','標的へ通常攻撃を集中'],
 ['敵の攻撃にCを合わせる','受け流しで反撃','回避後の強化通常攻撃も使う'],
 ['Cで祈りの場を置く','円の中でHP・MPを回復','通常攻撃でもHPを回復'],
 ['通常攻撃で3体召喚','通常攻撃で集中攻撃を指示','Cで集合・進撃を切り替える'],
 ['村で討伐済みの竜と契約','通常攻撃で呼び出し・指示','Cで専用ブレスを指示']
];
function jobSystemDisplayState(){
 let id=combatProfessionType(),label='',value=0,max=1,cells=1;
 if(id===0){label='連撃';value=jobMeter;max=cells=3;}
 if(id===1){label=jobGuard?'反撃蓄積':'堅守待機';value=jobGuard?jobBlocked:0;max=Math.max(1,maxhp()*.3);}
 if(id===2){label=jobMagicTime>0?'魔力解放':'魔力';value=jobMagicTime>0?jobMagicTime:jobMeter;max=jobMagicTime>0?4:3;cells=jobMagicTime>0?1:3;}
 if(id===3){label='狩猟標識';value=jobMark?.hp>0?jobMarkTime:0;max=8;}
 if(id===4){label='受け流し';value=jobParry;max=1;}
 if(id===5){label='祈り';value=jobPrayer?.time||0;max=5;}
 if(id===6){label=companionRecall?'集合':'進撃';value=companions.filter(c=>!c.dragon&&c.life>0).length;max=cells=3;}
 if(id===7){label=dragonRideActive()?'騎乗':companionFury>0?'竜のブレス':'契約竜';value=dragonRideActive()?dragonRide.time:companionFury>0?companionFury:companions.some(c=>c.dragon&&c.life>0)?1:0;max=dragonRideActive()?6:companionFury>0?8:1;}
 return {label,value:Math.max(0,Math.min(max,Number.isFinite(value)?value:0)),max,cells,color:PROFESSIONS[id].color};
}
// Keep one text node and three meter cells for the lifetime of the HUD.
let jobHudText=null,jobHudMeter=null,jobHudMeterLabel=null,jobHudMeterCells=[];
function prepareJobHud(){
 if(jobHudText)return;
 jobHudText=document.createElement('span');jobHudText.className='job-action-label';
 jobHudMeter=document.createElement('span');jobHudMeter.className='job-system-meter';jobHudMeter.setAttribute('aria-hidden','true');
 jobHudMeterLabel=document.createElement('span');jobHudMeter.append(jobHudMeterLabel);
 for(let i=0;i<3;i++){let cell=document.createElement('i'),fill=document.createElement('b');cell.append(fill);jobHudMeter.append(cell);jobHudMeterCells.push({cell,fill});}
 jobActionButton.replaceChildren(jobHudText,jobHudMeter);
}
function paintJobSystemDisplay(){
 if(jobActionButton.hidden)return;
 prepareJobHud();let s=jobSystemDisplayState();
 if(jobHudMeterLabel.textContent!==s.label)jobHudMeterLabel.textContent=s.label;
 if(jobHudMeter.style.getPropertyValue('--job-color')!==s.color)jobHudMeter.style.setProperty('--job-color',s.color);
 for(let [i,{cell,fill}]of jobHudMeterCells.entries()){
  let hidden=i>=s.cells;if(cell.hidden!==hidden)cell.hidden=hidden;
  if(hidden)continue;
  let width=Math.round(10000*Math.max(0,Math.min(1,s.value/s.max*s.cells-i)))/100+'%';if(fill.style.width!==width)fill.style.width=width;
 }
}
function commitJobHud(view){
 if(jobActionButton.hidden!==view.hidden)jobActionButton.hidden=view.hidden;
 if(view.hidden)return;
 prepareJobHud();
 if(jobHudText.textContent!==view.textContent)jobHudText.textContent=view.textContent;
 if(jobActionButton.title!==view.title)jobActionButton.title=view.title;
 for(let [key,value]of Object.entries(view.attrs))if(jobActionButton.getAttribute(key)!==value)jobActionButton.setAttribute(key,value);
 if(view.basicLabel!==undefined)setJobBasicLabel(view.basicLabel);
 paintJobSystemDisplay();
}
const systemDisplayHudBase=drawHud;drawHud=()=>{
 // All base/advanced job decorators compose plain values before touching DOM.
 let previous=jobHudDraft,view={hidden:true,textContent:'',title:'',attrs:{},setAttribute(key,value){this.attrs[key]=String(value);}};
 jobHudDraft=view;
 try{systemDisplayHudBase();}finally{jobHudDraft=previous;}
 commitJobHud(view);
};
const systemGuideContentBase=jobGuideContent;jobGuideContent=(topic,selected)=>{
 let html=systemGuideContentBase(topic,selected);
 if(topic!=='basic')return html;
 let steps=selected>=8?ADVANCED_JOB_STEPS[selected%8]:JOB_COMBAT_LOOPS[selected%8];
 return html+'<h3>戦い方の流れ</h3><ol class="job-combat-loop">'+steps.map(t=>'<li>'+t.replace(/Cで/g,'専用操作で').replace(/Cを/g,'専用操作を')+'</li>').join('')+'</ol>';
};
