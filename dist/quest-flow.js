// While a contract is active, keep the next useful action in controller focus.
const questFlowVillageBase=showVillage;showVillage=(region=campaign().region)=>{
 let c=campaign(),q=c.contract,quest=q&&guildQuest(q.id||'boss:'+q.target);
 if(!villageOpen||!quest)return questFlowVillageBase(region);
 let destination=REGIONS[quest.region],primary=q.killed?'<button data-quest-primary onclick="claimContract()">報告して報酬を受け取る</button>':'<button data-quest-primary onclick="departRegion('+quest.region+')">'+destination.name+'へ出発</button>';
 worldMenu('受注中の依頼 · ランク '+c.rank,'<h3>'+quest.name+'</h3><div class="dps-results"><div><small>討伐数</small><strong>'+q.progress+' / '+q.required+'</strong></div><div><small>報告報酬</small><strong>'+quest.xp+' ランクXP</strong></div></div><p>'+(q.killed?'討伐完了。ギルドへ報告できます。':'目的地：'+destination.name)+'</p>'+(!q.killed&&typeof guildHabitatHtml==='function'?guildHabitatHtml(quest):'')+primary+'<div class="world-tabs"><button onclick="showForge()">素材工房</button><button onclick="panel(\'inventory\')">装備</button><button onclick="showDps()">DPS訓練</button></div>'+(c.lastEx?'<button onclick="showExResult()">前回のEX結果</button>':'')+'<details><summary>依頼の説明・取り消し</summary><p>'+GUILD_STORY[quest.region]+'</p><p>指定された敵を倒し、素材を拾って村へ帰還してください。討伐数は保存されます。</p><button onclick="cancelContract()">この依頼を取り消す</button></details>','village');
 menuFocusElement($('card').querySelector('[data-quest-primary]'));
};
const questFlowReturnBase=returnVillage;returnVillage=()=>{
 let result=questFlowReturnBase();if(villageOpen&&campaign().inVillage&&campaign().contract?.killed&&menuSurface!=='exResult')showVillage();return result;
};
// A promotion receipt is transient; rank and unlocks are already committed by claimContract.
const questFlowClaimBase=claimContract;claimContract=()=>{
 let before=campaign().rank,trial=campaign().contract?.kind==='trial',result=questFlowClaimBase(),c=campaign();
 if(!result||!trial||c.rank<=before)return result;
 let region=REGIONS[c.unlocked],previous=REGIONS[before-1];
 worldMenu('冒険者ランク '+c.rank+' に昇格','<div class="dps-results"><div><small>新しい探索地域</small><strong>'+region.name+'</strong></div><div><small>裏ボス依頼を解放</small><strong>'+previous.name+'</strong></div></div><button data-quest-primary onclick="showVillage('+region.id+')">'+region.name+'の依頼を見る</button><button onclick="showVillage('+previous.id+')">'+previous.name+'の裏ボス依頼を見る</button><details><summary>昇格後の進め方</summary><p>新しい地域の討伐依頼で素材とランク経験値を集めましょう。裏ボスは任意の強敵です。装備を整えてから挑戦できます。</p>'+(c.rank>=10?'<p>これからは依頼の経験値でランクが上がります。ランク20から10ごとにEXボスが解放されます。</p>':'<p>次の昇格試験も、ランク経験値をためてから受注できます。</p>')+'</details>','promotion');
 menuFocusElement($('card').querySelector('[data-quest-primary]'));return result;
};

