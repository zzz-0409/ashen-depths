function defeatSummary(){
 let c=campaign(),q=c.contract,quest=q&&guildQuest(q.id||'boss:'+q.target);
 return{quest:quest?.name||'受注中の依頼はありません',progress:q?Math.min(q.required||1,q.progress||0)+' / '+(q.required||1)+'体':'' ,complete:!!q?.killed,materials:Object.values(c.materials).reduce((sum,count)=>sum+count,0),bag:p.bag.length,rank:c.rank,rankXP:c.rankXP};
}
function showDefeatMenu(){
 let summary=defeatSummary();
 worldMenu('灯火の村で再起する','<h3>村へ戻る</h3><p>村で体力と生命瓶を回復し、装備を整えて再挑戦できます。</p><button onclick="returnVillage()">村へ帰還する</button><h3>依頼の進行</h3><p>'+gearEscape(summary.quest)+'</p>'+(summary.progress?'<p>討伐数 '+summary.progress+' · '+(summary.complete?'討伐完了。村で報告できます。':'途中の討伐数は保持されます。再出発して続きを進められます。')+'</p>':'')+'<p>冒険者ランク '+summary.rank+' · ランクXP '+summary.rankXP+'</p><h3>保持されるもの</h3><p>回収済み素材 '+summary.materials+'個 · 鞄の装備 '+summary.bag+'個</p><p>装備・ジェム・成長・依頼の討伐数は保持されます。地面に残した素材は帰還すると失われます。</p><p>EX挑戦の獲得素材は、帰還後の結果画面で確認できます。</p><h3>操作設定</h3><p>プロコンのボタン配置と音量を確認できます。</p><button onclick="showControllerSettings()">操作・音の設定を開く</button>','defeat');
 $('card').querySelector('.close')?.remove();let heading=$('card').querySelector('h2');heading.setAttribute('data-world-death','');heading.setAttribute('data-defeat-menu','');
 iconMenuMemory.defeat='defeat:0';iconTopicMenu('defeat');
}
const defeatUpdateBase=update;update=dt=>{defeatUpdateBase(dt);if(dead&&p?.campaign&&!padSettingsOpen&&!$('card').querySelector('[data-defeat-menu]'))showDefeatMenu();};
// B/Escape returns from details but cannot dismiss the required recovery screen.
const defeatCloseBase=closePanel;closePanel=()=>{if(dead&&p?.campaign)return;return defeatCloseBase();};
const defeatPadBase=padMenu;padMenu=(g,left,right,dt)=>{if(dead&&menuSurface==='defeat'&&(padEdge(g,'back')||padEdge(g,'pause'))){iconMenuBack();return;}return defeatPadBase(g,left,right,dt);};
addEventListener('keydown',event=>{if(dead&&menuSurface==='defeat'&&event.key==='Escape'){iconMenuBack();event.preventDefault();event.stopImmediatePropagation();}},true);
