// Slot-first loadout menus. Candidates exist only after a destination is chosen.
let loadoutRoute={kind:null,target:null};
function loadoutGearCandidates(slot){return p.bag.map((item,index)=>({item,index})).filter(row=>row.item.slot===slot);}
function loadoutSkillCandidates(){let seen=new Set();return equippedActives().filter(a=>{if(seen.has(a.gem.type))return false;seen.add(a.gem.type);return true;});}
function loadoutSocketCandidates(socket){return p.gems.map((gem,index)=>({gem,index})).filter(row=>socket.color==='W'||socket.color===GEM[row.gem.type].color);}
function loadoutNode(html){let n=document.createElement('div');n.innerHTML=html;return n;}
function loadoutAction(label,action){let b=document.createElement('button');b.textContent=label;b.onclick=action;return b;}
function loadoutOpen(kind,target){loadoutRoute={kind,target};panel(kind);}
function loadoutRootKey(){let t=loadoutRoute.target;return t?.type==='binding'?'binding:'+t.index:t?.type==='socket'?'socket:'+t.slot+':'+t.index:t?.slot?'slot:'+t.slot:null;}
function loadoutBack(){if(!paused||menuSurface!==loadoutRoute.kind||!loadoutRoute.target)return false;let key=loadoutRootKey();iconMenuMemory['loadout:'+menuSurface+':root']=key;loadoutRoute.target=null;selectedGem=null;panel(menuSurface);return true;}
function loadoutDeck(kind,entries,title,summary){let body=$('card').querySelector('.panel-body');body.replaceChildren();body.classList.remove('inventory-layout');body.classList.add('loadout-body');inventoryNav.open=false;inventoryNav.actions=false;
 makeIconBrowser('loadout:'+kind+':'+(loadoutRootKey()||'root'),entries);
 let deck=body.querySelector('.icon-browser'),nav=document.createElement('div');nav.className='loadout-path';let label=document.createElement('strong');label.textContent=title;nav.append(label);if(loadoutRoute.target)nav.append(loadoutAction('← 枠の選択へ戻る',loadoutBack));body.prepend(nav);if(summary)body.insertBefore(summary,deck);
 let hint=$('card').querySelector('.panel-hint');if(hint)hint.textContent='十字キー：選択 · A：決定 · B：一段戻る · L/R：タブ · 右スティック：詳細';
}
function loadoutInventory(){if(loadoutRoute.target?.type==='socket')return loadoutGems();let body=$('card').querySelector('.panel-body'),summary=body.querySelector('.character-summary'),panes=Array.from(body.querySelectorAll('[data-inventory-detail]'));let entries=[],target=loadoutRoute.target;
 const itemEntry=(item,index,key,label)=>({key,label,icon:equipmentArt(item,item?.slot||GEAR_SLOTS[index]),nodes:Array.from(panes[index]?.children||[])});
 if(!target){for(let i=0;i<GEAR_SLOTS.length;i++){let slot=GEAR_SLOTS[i],entry=itemEntry(p[slot],i,'slot:'+slot,EQUIPMENT[slot].label);entry.nodes.unshift(loadoutAction('変更する装備を選ぶ',()=>loadoutOpen('inventory',{slot})));entries.push(entry);}}
 else {let slot=target.slot,index=GEAR_SLOTS.indexOf(slot);entries.push(itemEntry(p[slot],index,'equipped:'+slot,'装備中：'+(p[slot]?.name||'未装備')));loadoutGearCandidates(slot).forEach(({item,index:i})=>entries.push(itemEntry(item,GEAR_SLOTS.length+i,'bag:'+i,item.name)));if(entries.length===1)entries[0].nodes.unshift(loadoutNode('<p>交換できる手持ち装備はありません。工房で製作できます。</p>'));}
 loadoutDeck('inventory',entries,target?EQUIPMENT[target.slot].label+'を選択':'変更する装備部位を選択',summary);
 if(!target)for(let button of body.querySelectorAll('.icon-entry'))button.onclick=()=>loadoutOpen('inventory',{slot:button.dataset.iconKey.slice(5)});
}
function loadoutGemDetails(gem){let d=GEM[gem.type],b=skillBuild(gem.type);return loadoutNode('<p>'+gearEscape(gemDisplayName(gem))+' · Lv '+gem.level+'</p><p>'+gearEscape(d.desc)+'</p>'+(b?'<p>'+Math.ceil(b.cost)+' MP · '+b.cool.toFixed(2)+'秒</p>':'')+(gem.forged?'<p>'+gearEscape(gem.forged.elements.map(i=>ELEMENTS[i].name).join('・'))+'</p>':''));}
function loadoutGems(){let body=$('card').querySelector('.panel-body'),oldHelp=body.querySelector('[data-icon-key="help"].icon-pane'),target=loadoutRoute.target,entries=[];
 if(!target){for(let i=0;i<SKILL_ACTIONS.length;i++){let type=p.bindings[i],source=equippedActives().find(a=>a.gem.type===type);entries.push({key:'binding:'+i,label:'スキル枠 '+(i+1)+' · '+SKILL_KEYS[i],icon:type?gemIcon(type):menuIcon('gems'),nodes:[source?loadoutGemDetails(source.gem):loadoutNode('<p>'+(type?'未装着':'未割当')+'</p>'),loadoutAction('割り当てるスキルを選ぶ',()=>loadoutOpen('gems',{type:'binding',index:i}))]});}
 entries.push(...combatLoadoutEntries());
 }else if(target.type==='binding'){for(let a of loadoutSkillCandidates()){entries.push({key:'skill:'+a.gem.type,label:gemDisplayName(a.gem),icon:gemIcon(a.gem.type),nodes:[loadoutGemDetails(a.gem),loadoutAction('このスキルを割り当てる',()=>bindSkill(target.index,a.gem.type))]});}entries.push({key:'clear',label:'未割当にする',icon:menuIcon('gems'),nodes:[loadoutNode('<p>候補は装備に装着済みのアクティブジェムです。サポートジェムは割り当て不要です。</p>'),loadoutAction('割り当てを外す',()=>bindSkill(target.index,''))]});
 }else {let socket=p[target.slot]?.sockets[target.index];if(!socket){loadoutRoute.target=null;return loadoutGems();}loadoutSocketCandidates(socket).forEach(({gem,index:i})=>{entries.push({key:'gem:'+i,label:gemDisplayName(gem),icon:gemIcon(gem.type),nodes:[loadoutGemDetails(gem),loadoutAction('この穴に装着する',()=>{selectedGem=i;socketGem(target.slot,target.index);selectedGem=null;})]});});entries.push({key:'remove',label:socket.gem?'装着中のジェム':'空きソケット',icon:socket.gem?gemIcon(socket.gem.type):menuIcon(target.slot),nodes:[loadoutNode('<p>'+(socket.gem?gearEscape(gemDisplayName(socket.gem)):'装着できる手持ちジェムを選んでください。候補がない場合は工房で製作できます。')+'</p>'),...(socket.gem?[loadoutAction('ジェムを取り外す',()=>{selectedGem=null;socketGem(target.slot,target.index);})]:[])]});}
 loadoutDeck(loadoutRoute.kind,entries,!target?'変更する技を選択':target.type==='binding'?'スキル枠 '+(target.index+1)+'：スキルを選択':EQUIPMENT[target.slot].label+'・穴 '+(target.index+1)+'：ジェムを選択');
 if(!target)for(let button of body.querySelectorAll('.icon-entry')){let key=button.dataset.iconKey;if(key.startsWith('binding:'))button.onclick=()=>loadoutOpen('gems',{type:'binding',index:+key.split(':')[1]});else if(key.startsWith('socket:'))button.onclick=()=>loadoutOpen('gems',{type:'socket',slot:key.split(':')[1],index:+key.split(':')[2]});}
}
const loadoutPanelBase=panel;panel=kind=>{if(kind!==loadoutRoute.kind)loadoutRoute={kind,target:null};let result=loadoutPanelBase(kind);if(started&&!dead&&!tutorialGuideOpen){if(kind==='inventory')loadoutInventory();else if(kind==='gems')loadoutGems();}return result;};
const loadoutIconBackBase=iconMenuBack;iconMenuBack=()=>{if(loadoutRoute.target&&menuSurface===loadoutRoute.kind){if(document.activeElement?.closest?.('.icon-pane'))return loadoutIconBackBase();return loadoutBack();}return loadoutIconBackBase();};
const loadoutCloseBase=closePanel;closePanel=(...args)=>{if(menuSurface!=='character-stats')loadoutRoute={kind:null,target:null};return loadoutCloseBase(...args);};

const loadoutSlotPressBase=skillSlotPress;skillSlotPress=i=>{if(!skillBuild(p.bindings[i])){loadoutOpen('gems',{type:'binding',index:i});return;}return loadoutSlotPressBase(i);};
// External entry points resolve the item by identity before opening its filtered list.
function loadoutInspectItem(item){
 if(!item||!p||!GEAR_SLOTS.includes(item.slot))return false;
 let index=p.bag.indexOf(item),equipped=p[item.slot]===item;if(index<0&&!equipped)return false;
 let key=index>=0?'bag:'+index:'equipped:'+item.slot;
 iconMenuMemory['loadout:inventory:slot:'+item.slot]=key;
 loadoutOpen('inventory',{slot:item.slot});
 let button=Array.from($('card').querySelectorAll('.icon-entry')).find(el=>el.dataset.iconKey===key);
 if(!button)return false;iconSelectEntry(key);menuFocusElement(button);return true;
}
// After a successful swap, follow the newly equipped item, not the bag cell now
// occupied by the old gear. A repeated confirm must not immediately swap back.
const loadoutEquipBase=equip;equip=index=>{let item=p.bag[index],inPicker=menuSurface==='inventory'&&loadoutRoute.kind==='inventory'&&!!loadoutRoute.target,result=loadoutEquipBase(index);if(inPicker&&item&&p[item.slot]===item)loadoutInspectItem(item);return result;};
