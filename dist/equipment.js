const EQUIPMENT={
 weapon:{label:'武器',base:'長剣',stat:null,min:3,max:8,sockets:4},armor:{label:'胴防具',base:'胸甲',stat:null,min:3,max:8,sockets:6},
 shield:{label:'副装備',base:'盾',stat:'guard',min:1,max:4,sockets:3},helmet:{label:'頭',base:'兜',stat:'guard',min:1,max:3,sockets:4},
 gloves:{label:'手',base:'手甲',stat:'attack',min:2,max:5,sockets:4},boots:{label:'足',base:'長靴',stat:'speed',min:2,max:6,sockets:4},
 belt:{label:'ベルト',base:'革帯',stat:'life',min:10,max:25,sockets:0},amulet:{label:'首飾り',base:'護符',stat:'spell',min:4,max:10,sockets:0},
 ring1:{label:'指輪・左',base:'銀の指輪',stat:'crit',min:1,max:3,sockets:0},ring2:{label:'指輪・右',base:'青石の指輪',stat:'regen',min:1,max:3,sockets:0}
};
const GEAR_SLOTS=Object.keys(EQUIPMENT);
function gearEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function randomGearSlot(){return GEAR_SLOTS[Math.floor(Math.random()*GEAR_SLOTS.length)]}
function gearBaseLabel(it){return it.slot==='weapon'?'基礎攻撃':it.slot==='armor'?'防御':MODS[EQUIPMENT[it.slot].stat][0]}
function gearStats(it){if(!it)return{};let key=EQUIPMENT[it.slot].stat||(it.slot==='weapon'?'baseAttack':'baseArmor'),stats={[key]:it.value};for(let m of it.mods||[])stats[m.key]=(stats[m.key]||0)+m.value;return stats}
function gearComparison(it){let before=gearStats(p[it.slot]),after=gearStats(it),keys=[...new Set([...Object.keys(before),...Object.keys(after)])];return '<div class="gear-comparison"><small>現在の'+EQUIPMENT[it.slot].label+'との差</small>'+keys.map(key=>{let delta=(after[key]||0)-(before[key]||0);return delta?'<span class="'+(delta>0?'gain':'loss')+'">'+({baseAttack:'基礎攻撃',baseArmor:'防御'}[key]||MODS[key][0])+' '+(delta>0?'+':'')+delta+'</span>':''}).join('')+'</div>'}
function toggleItemLock(i){let it=p.bag[i];if(!it)return;let previous=it.locked;it.locked=!it.locked;if(save()===false){if(previous===undefined)delete it.locked;else it.locked=previous;say('保存できなかったため、保護設定を戻しました');return false}panel('inventory');return true}
function gearEmpty(slot){return '<div class="gearcard empty-gear"><small>'+EQUIPMENT[slot].label+'</small><strong>未装備</strong><p>探索で入手した'+EQUIPMENT[slot].base+'を鞄から装備できます。</p></div>'}
function gearInventoryHtml(){let h='<h2>装備と錬成 <span class="gold">'+p.gold+' G</span></h2><div class="gear-jumps"><button onclick="inventoryJump(false)">装備へ ZL</button><button onclick="inventoryJump(true)">鞄へ ZR</button></div><div class="equipment gear-equipment">';for(let slot of GEAR_SLOTS){let it=p[slot];if(!it){h+=gearEmpty(slot);continue}h+='<div class="gearcard"><small>'+EQUIPMENT[slot].label+'</small>'+itemDetails(it)+socketView(slot,false)+socketCraftButtons(slot)+'<div class="crafts">'+(it.forge==='endgame'?'<button onclick="craft(\''+slot+'\')" '+((it.forgeLevel||0)>=10?'disabled':'')+'>終焉強化 / 欠片 '+(20+(it.forgeLevel||0)*10)+'個</button>':'')+(it.sockets.length?[['colors','色再抽選'],['links','リンク再抽選']]:[]).map(([a,n])=>'<button onclick="reroll(\''+slot+'\',\''+a+'\')" '+(p.gold<40?'disabled':'')+'>'+n+' / 40G</button>').join('')+'</div></div>'}h+='</div><button id="gearHelpToggle" onclick="toggleGearHelp(this)" aria-expanded="false">装備の使い方</button><p id="gearHelp" class="muted" hidden>交換前の装備は鞄へ戻り、ジェムは元の装備に残ります。鞄の装備を選び「ジェムを取り外す」で回収できます。売却時は装着済みジェムを回収します。大切な装備は「売却から保護」で守れます。指輪・首飾り・ベルトにはソケットがありません。</p><h3>鞄 '+p.bag.length+'/20</h3><div class="baggrid">';p.bag.forEach((it,i)=>{h+='<div class="gearcard"><small>装備先：'+EQUIPMENT[it.slot].label+'</small>'+itemDetails(it)+gearComparison(it)+'<p class="muted">'+it.sockets.map((s,j)=>(j?(it.links[j-1]?'━':' · '):'')+s.color+(s.gem?' ['+GEM[s.gem.type].name+' Lv'+s.gem.level+']':'')).join('')+'</p><button onclick="equip('+i+')">装備</button> '+bagGemButton(it,i)+'<button onclick="toggleItemLock('+i+')" aria-pressed="'+!!it.locked+'">'+(it.locked?'保護を解除':'売却から保護')+'</button> <button onclick="sell('+i+')" '+(it.locked?'disabled':'')+'>売却 15G</button></div>'});return h+'</div>'}

function toggleGearHelp(button){let help=$('gearHelp');help.hidden=!help.hidden;button.setAttribute('aria-expanded',String(!help.hidden));button.textContent=help.hidden?'装備の使い方':'使い方を閉じる';if(!help.hidden&&typeof menuReveal==='function')menuReveal(help)}

function bagGemButton(item,index){let count=item.sockets.filter(s=>s.gem).length;return count?'<button onclick="recoverBagGems('+index+')">ジェムを取り外す（'+count+'個）</button>':'';}
function recoverBagGems(index){
 if(!Number.isInteger(index)||index<0||index>=p.bag.length)return false;
 let item=p.bag[index],filled=item.sockets.filter(s=>s.gem);if(!filled.length)return false;
 let gems=filled.map(s=>s.gem),count=p.gems.length;
 p.gems.push(...gems);for(let socket of filled)socket.gem=null;
 if(save()===false){p.gems.splice(count);filled.forEach((socket,i)=>socket.gem=gems[i]);say('保存できなかったため、ジェムの取り外しを取り消しました');return false;}
 panel('inventory');say('ジェム'+gems.length+'個を回収。スキルジェム画面から新しい装備に装着できます');return true;
}
