function gearTotalPreviewValues(item){
 let before=gearStats(p[item.slot]),after=gearStats(item),delta=key=>(after[key]||0)-(before[key]||0),set={attack:0,life:0};
 for(let change of gearTagChanges(item))for(let row of change.stages)for(let key of ['attack','life'])set[key]+=(change.gained?1:-1)*(GEAR_TAGS[change.id].stages[row.index][key]||0);
 return {attack:{before:damage(),after:Math.round((keyDamage()+delta('baseAttack')+delta('attack')+set.attack)*keyDamageMultiplier())},life:{before:maxhp(),after:Math.round((keyHP()+delta('baseArmor')*3+delta('life')+set.life)*keyLifeMultiplier())}};
}
function gearTotalPreview(item){let values=gearTotalPreviewValues(item),rows=Object.entries(values).filter(([,v])=>v.before!==v.after);if(!rows.length)return '';
 return '<div class="gear-comparison gear-total-preview"><small>交換後の能力（パッシブ・セット込み）</small>'+rows.map(([key,v])=>'<span class="'+(v.after>v.before?'gain':'loss')+'">'+(key==='attack'?'総攻撃力':'最大ライフ')+' '+v.before+' → '+v.after+'</span>').join('')+'</div>';
}
const totalComparisonBase=gearComparison;gearComparison=item=>gearTotalPreview(item)+totalComparisonBase(item);
