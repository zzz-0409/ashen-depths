// Read-only loadout comparison. The first equipped gem of a type is its source.
function gearSkillSource(character,type){
 if(!type||GEM[type]?.kind!=='active')return null;
 for(let slot of GEAR_SLOTS){let item=character[slot],index=item?.sockets.findIndex(s=>s.gem?.type===type)??-1;if(index<0)continue;
  const group=socketGroupIndices(item,index,character);
  let supports=[...new Set(group.map(i=>item.sockets[i].gem?.type).filter(t=>GEM[t]?.kind==='support'&&GEM[t].tags.some(tag=>GEM[type].tags.includes(tag))))];
  return {slot,level:item.sockets[index].gem.level,supports,forged:item.sockets[index].gem.forged||null};
 }
 return null;
}
function gearSkillChanges(item){
 let after={...p,[item.slot]:item};
 return (p.bindings||[]).flatMap((type,index)=>{
  let before=gearSkillSource(p,type),next=gearSkillSource(after,type);
  if(!before&&!next)return [];
  let lost=before?.supports.filter(t=>!next?.supports.includes(t))||[],gained=next?.supports.filter(t=>!before?.supports.includes(t))||[];
  if(before&&next&&before.level===next.level&&!lost.length&&!gained.length&&JSON.stringify(before.forged)===JSON.stringify(next.forged))return [];
  return [{type,index,before,next,lost,gained}];
 });
}
function gearSkillPreview(item){
 let changes=gearSkillChanges(item);if(!changes.length)return '';
 return '<div class="gear-comparison gear-skill-preview"><small>装備変更後のスキル</small>'+changes.map(row=>{
  let name=gearEscape(SKILL_KEYS[row.index]+' · '+GEM[row.type].name);
  if(!row.next)return '<p class="loss">'+name+'：使用できなくなります</p>';
  if(!row.before)return '<p class="gain">'+name+'：使用可能になります（Lv'+row.next.level+'）</p>';
  let rolls='';if(JSON.stringify(row.before.forged)!==JSON.stringify(row.next.forged)){let describe=f=>f?f.elements.map(i=>ELEMENTS[i].name).join('・')+' / 威力'+f.power+'% / クールダウン'+f.tempo+'%':'通常ジェム';rolls='<p>抽選性能：'+describe(row.before.forged)+' → '+describe(row.next.forged)+'</p>';}
  return '<p>'+name+(row.before.level!==row.next.level?'：Lv'+row.before.level+' → '+row.next.level:'')+'</p>'+rolls+(row.lost.length?'<p class="loss">外れるサポート：'+row.lost.map(t=>gearEscape(GEM[t].name)).join('・')+'</p>':'')+(row.gained.length?'<p class="gain">加わるサポート：'+row.gained.map(t=>gearEscape(GEM[t].name)).join('・')+'</p>':'');
 }).join('')+(changes.some(r=>!r.next)?'<p class="muted">ジェムは元の装備に残ります。先にジェム画面で取り外し、交換先に装着してください。</p>':'')+'</div>';
}
const skillComparisonBase=gearComparison;gearComparison=item=>skillComparisonBase(item)+gearSkillPreview(item);
