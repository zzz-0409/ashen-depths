// Keep rarity on the artwork so every caller (loadout, stash, forge) shares it.
function itemRarityArt(html,item){let rarity=item?.rarity;if(!['normal','magic','rare'].includes(rarity))return html;return html.replace('class="','data-item-rarity="'+rarity+'" class="');}
const rarityEquipmentArtBase=equipmentArt;equipmentArt=(item,...args)=>itemRarityArt(rarityEquipmentArtBase(item,...args),item);
const rarityRecipeIconBase=forgeRecipeIcon;forgeRecipeIcon=recipe=>itemRarityArt(rarityRecipeIconBase(recipe),forgeRecipeItem(recipe));
const rarityMaterialIconBase=materialIcon;materialIcon=id=>{let html=rarityMaterialIconBase(id),m=MATERIALS[id];return m?html.replace('class="','data-material-tier="'+m.tier+'" class="'):html;};
