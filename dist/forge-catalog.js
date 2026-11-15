// Named rank recipes have reproducible equipment, separate from EX random forging.
const FORGE_RECIPES=[];
for(let rank=1;rank<=10;rank++){
 let variants=[['weapon',0,'牙剣'],['weapon',1,'星杖'],['weapon',2,'狩刃'],...GEAR_SLOTS.filter(s=>s!=='weapon').map((s,i)=>[s,(i+2)%8,EQUIPMENT[s].base])];
 variants.forEach(([slot,role,title],index)=>FORGE_RECIPES.push({id:'rank'+rank+'_'+index,rank,slot,role,index,name:REGIONS[rank-1].biome+'・'+title,species:'r'+(rank-1)+'e'+role,cost:{['r'+(rank-1)+'e'+role+':0']:5}}));
}
function forgeRecipeItem(recipe){
 let item=forgeItem(SPECIES[recipe.species],recipe.slot,0,false,seeded(90001+recipe.rank*101+recipe.index*17));item.name=recipe.name;
 if(recipe.slot==='weapon'){let key=['attack','spell','crit'][recipe.index],value=[5,12,4][recipe.index]+recipe.rank;item.mods=[{key,value},{key:'life',value:18+recipe.rank*3}];let colors=[['R','R','G','R'],['B','B','G','B'],['G','G','G','R']][recipe.index];item.sockets.forEach((s,i)=>s.color=colors[i]);item.links=item.sockets.slice(1).map(()=>true);if(item.tags)item.tags=[['war','arcane','hunter'][recipe.index]];}
 return item;
}
function forgeRecipeStatus(recipe){let c=campaign();return !recipe?'レシピがありません':!villageOpen?'村の鍛冶屋で製作できます':c.rank<recipe.rank||c.unlocked<recipe.rank-1?'冒険者ランク '+recipe.rank+' で解放':p.bag.length>=20?'鞄が満杯です':Object.entries(recipe.cost).some(([id,n])=>(c.materials[id]||0)<n)?'素材が不足しています':'製作できます';}
let forgeCatalogRank=null,forgeCatalogSlot='all',forgeCatalogSelected=null,forgeCatalogResult=null,forgeCatalogUnlocked=0;
const randomForgeMenu=showForge;
function showRandomForge(){if(!villageOpen||campaign().rank<100)return false;worldForgeSpecies='ex100';worldForgeTier=0;randomForgeMenu();return true;}
openFinalForge=showRandomForge;
function forgeRecipeIcon(recipe){if(recipe.slot!=='weapon'||recipe.index===0)return menuIcon(recipe.slot);let path=recipe.index===1?'M17 55 40 14 M31 8 45 5 53 17 40 29 29 21Z M15 47 25 53':'M16 51 39 13 49 8 46 28 25 47Z M12 42 29 52';return '<svg class="menu-slot-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="'+path+'"/></svg>';}
function forgeRecipeDetail(recipe){let item=forgeRecipeItem(recipe),ready=forgeRecipeStatus(recipe)==='製作できます',result=forgeCatalogResult?.recipe===recipe.id&&p.bag.includes(forgeCatalogResult.item);
 let sockets='<div class="recipe-sockets">ソケット '+item.sockets.length+'個：'+item.sockets.map((s,i)=>(i?(item.links[i-1]?' ━ ':' · '):'')+'<span style="color:'+COLORS[s.color]+'">'+SOCKET_COLOR_NAMES[s.color]+'</span>').join('')+(item.sockets.length?'':'なし')+'</div>';
 return '<div class="recipe-meta">ランク '+recipe.rank+' · '+EQUIPMENT[recipe.slot].label+' · '+(recipe.slot==='weapon'?['近接攻撃向け','魔法スキル向け','会心向け'][recipe.index]:'防具・装飾品')+'</div><section class="recipe-stats" aria-label="完成品の性能">'+'<strong>'+gearBaseLabel(item)+' '+item.value+'</strong><div class="recipe-mods">'+item.mods.map(m=>'<span>'+MODS[m.key][0]+' +'+m.value+'</span>').join('')+'</div>'+(item.tags?.length?'<small>タグ：'+item.tags.map(id=>GEAR_TAGS[id].name).join('・')+'</small>':'')+sockets+'</section><h4>必要素材</h4>'+Object.entries(recipe.cost).map(([id,n])=>materialTile(id,n)).join('')+'<p class="recipe-status" role="status">'+forgeRecipeStatus(recipe)+' · 鞄 '+p.bag.length+' / 20</p><button data-recipe-craft onclick="craftForgeRecipe(\''+recipe.id+'\')" '+(!ready?'disabled':'')+'>この装備を製作</button>'+(result?'<section class="forge-result"><strong>'+gearEscape(forgeCatalogResult.item.name)+'を製作しました</strong><button data-recipe-result onclick="openCraftedItem()">比較・装備する</button></section>':'')+'<details><summary>レシピについて</summary><p>表示どおりの性能・ソケットで完成します。同じレシピから同じ装備を製作できます。終焉装備のランダム製作はランク100で解放されます。</p></details>';
}
showForge=()=>{
 if(!villageOpen){say('鍛冶屋は村で利用できます');return false;}
 let previous=menuSurface==='forgeRecipes'?document.activeElement?.getAttribute?.('aria-label'):null,cap=Math.min(10,campaign().rank);
 if(cap>forgeCatalogUnlocked)forgeCatalogRank=cap;forgeCatalogUnlocked=cap;forgeCatalogRank=clamp(forgeCatalogRank??cap,1,cap);
 let recipes=FORGE_RECIPES.filter(r=>r.rank===forgeCatalogRank&&(forgeCatalogSlot==='all'||r.slot===forgeCatalogSlot));
 worldMenu('灯火の村 · 鍛冶屋','','forgeRecipes');
 let entries=recipes.map(recipe=>{let node=document.createElement('div');node.innerHTML=forgeRecipeDetail(recipe);return{key:recipe.id,label:recipe.name,icon:forgeRecipeIcon(recipe),nodes:[node]};});
 if(!recipes.some(r=>r.id===forgeCatalogSelected))forgeCatalogSelected=recipes[0].id;
 iconMenuMemory.forgeRecipes=forgeCatalogSelected;makeIconBrowser('forgeRecipes',entries);
 let heading=$('card').querySelector('.panel-heading'),toolbar=document.createElement('div');toolbar.className='recipe-toolbar';toolbar.innerHTML='<label>レシピランク<select aria-label="レシピランク" onchange="forgeCatalogRank=+this.value;showForge()">'+Array.from({length:10},(_,i)=>'<option value="'+(i+1)+'" '+(forgeCatalogRank===i+1?'selected':'')+' '+(i+1>cap?'disabled':'')+'>ランク '+(i+1)+(i+1>cap?' · 未解放':'')+'</option>').join('')+'</select></label><label>種類<select aria-label="装備の種類" onchange="forgeCatalogSlot=this.value;showForge()"><option value="all">すべて</option>'+GEAR_SLOTS.map(s=>'<option value="'+s+'" '+(forgeCatalogSlot===s?'selected':'')+'>'+EQUIPMENT[s].label+'</option>').join('')+'</select></label><span>'+recipes.length+'種'+(cap<10?' · 次はランク'+(cap+1)+'で12種解放':' · ランク10まで解放済み')+'</span><button onclick="showVillage()">依頼</button>'+(campaign().rank>=100?'<button onclick="showRandomForge()">終焉のランダム製作</button>':'');heading.append(toolbar);
 for(let tile of $('card').querySelectorAll('.icon-entry')){tile.addEventListener('focus',()=>forgeCatalogSelected=tile.dataset.iconKey);tile.onclick=()=>{forgeCatalogSelected=tile.dataset.iconKey;iconSelectEntry(tile.dataset.iconKey);let pane=$('card').querySelector('.icon-pane:not([hidden])');menuFocusElement(pane.querySelector('[data-recipe-craft]:not(:disabled)')||pane);};let recipe=FORGE_RECIPES.find(r=>r.id===tile.dataset.iconKey);tile.dataset.ready=String(forgeRecipeStatus(recipe)==='製作できます');tile.insertAdjacentHTML('beforeend','<span class="recipe-tile-status">'+(tile.dataset.ready==='true'?'製作可':'素材不足')+'</span>');}
 if(previous)menuFocusElement($('card').querySelector('[aria-label="'+previous+'"]'));
 return true;
};
function craftForgeRecipe(id){let recipe=FORGE_RECIPES.find(r=>r.id===id);if(forgeRecipeStatus(recipe)!=='製作できます'){say(forgeRecipeStatus(recipe));return false;}let item=forgeRecipeItem(recipe);if(!worldTransaction(()=>{for(let [key,n]of Object.entries(recipe.cost))campaign().materials[key]-=n;p.bag.push(item);})){return false;}
 lastCraftedItem=item;forgeCatalogResult={recipe:id,item};forgeCatalogSelected=id;showForge();iconSelectEntry(id);menuFocusElement($('card').querySelector('.icon-pane:not([hidden]) [data-recipe-result]'));say(item.name+'を製作しました');return true;
}
const recipePadBase=padMenu;padMenu=(g,left,right,dt)=>{if(menuSurface==='forgeRecipes'&&padEdge(g,'back')&&!document.activeElement?.closest?.('.icon-pane')){showVillage();return;}return recipePadBase(g,left,right,dt);};
addEventListener('keydown',e=>{if(e.key==='Escape'&&menuSurface==='forgeRecipes'&&!document.activeElement?.closest?.('.icon-pane')){showVillage();e.preventDefault();e.stopImmediatePropagation();}},true);
