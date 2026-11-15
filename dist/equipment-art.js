// Resolution-independent item illustrations: distinct silhouettes and rank upgrades.
function equipmentArt(item,slot=item?.slot){
 if(!item)return menuIcon(slot);
 let recipe=FORGE_RECIPES.find(r=>r.id===item.recipeId)||FORGE_RECIPES.find(r=>r.slot===slot&&r.name===item.name),rank=recipe?.rank||(item.forge==='endgame'?10:Math.max(1,REGIONS.findIndex(r=>item.name.startsWith(r.biome+'の'))+1)),level=Math.min(10,rank),kind=slot==='weapon'?['sword','staff','dagger'][recipe?.index??0]:slot;
 return rankedEquipmentArt(kind,level);
}
function rankedEquipmentArt(kind,rank){
 let tier=Math.floor((rank-1)/2),metal=['#929da3','#c2cbd0','#b7d1d6','#e2cf94','#e9ddbb'][tier],shade=['#48515a','#586778','#3f707d','#897047','#82708d'][tier],trim=['#846746','#a48451','#b3a56d','#f0cd75','#ffe8a1'][tier],gem=['#b1b6a4','#71b5c9','#63d2c8','#cf99ff','#97eaff'][tier];
 let path=(d,fill=metal,stroke=shade,width=2)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linejoin="round"/>',body='';
 if(kind==='sword')body=path('M27 65 64 16 74 9 74 23 39 72Z')+path('M33 65 70 17 64 34Z','#eff5e8','none')+path('M22 62 43 77 39 83 18 68Z',trim)+path('M22 72 29 78 19 91 12 85Z','#644934')+path('M12 84 20 90 15 95 7 89Z',trim);
 else if(kind==='staff')body=path('M43 33 50 34 39 91 32 90Z','#77543b')+path('M45 12 60 23 54 41 36 42 25 27Z',trim)+path('M45 17 54 25 48 36 35 31Z',gem)+path('M38 54 48 56 46 62 36 60Z',trim);
 else if(kind==='dagger')body=path('M30 61 51 25 75 13 66 43 43 70Z')+path('M37 61 65 25 57 47Z','#eef4db','none')+path('M24 60 47 74 42 81 19 67Z',trim)+path('M25 71 35 77 23 91 14 84Z','#60443a');
 else if(kind==='armor')body=path('M30 18 39 26 57 26 66 18 83 31 75 46 66 41 70 81 26 81 30 41 21 46 13 31Z')+path('M34 34 46 39 46 65 31 58Z',shade)+path('M62 34 50 39 50 65 65 58Z',shade)+path('M29 68 67 68 69 77 27 77Z',trim);
 else if(kind==='shield')body=path('M48 14 78 24 73 58Q65 76 48 88Q31 76 23 58L18 24Z',trim)+path('M48 22 69 29 64 57Q58 70 48 78Q38 70 32 57L27 29Z',shade)+path('M44 30 52 30 52 51 65 51 65 58 52 58 52 71 44 71 44 58 31 58 31 51 44 51Z',metal);
 else if(kind==='helmet')body=path('M23 75 23 43Q24 19 48 18Q72 19 73 43L73 75 57 83 54 58 42 58 39 83Z')+path('M30 45 44 48 43 55 30 52Z','#111c26')+path('M66 45 52 48 53 55 66 52Z','#111c26')+path('M45 20 51 20 53 67 48 74 43 67Z',trim);
 else if(kind==='gloves')body=path('M24 67 16 43 22 37 33 48 30 24 38 21 43 44 42 18 50 18 54 43 56 22 64 24 64 47 70 37 77 42 69 70 62 80 30 80Z')+path('M27 66 67 66 65 85 28 85Z',trim)+path('M37 48 57 47 63 59 38 61Z',shade);
 else if(kind==='boots')body=path('M29 13 63 13 60 55 79 67 82 82 20 82 21 64 28 52Z')+path('M29 19 62 19 60 28 29 28Z',trim)+path('M25 64 59 60 65 67 24 72Z',trim)+path('M21 77 81 77 81 86 20 86Z','#403833');
 else if(kind==='belt')body=path('M10 34 86 34 86 67 10 67Z','#6f4d36')+path('M34 28 64 28 64 73 34 73Z',trim)+path('M41 36 57 36 57 65 41 65Z',shade)+path('M47 48 72 48 72 53 47 53Z',metal);
 else if(kind==='amulet')body=path('M24 12Q23 39 48 54Q73 39 72 12L67 13Q68 34 48 47Q28 34 29 13Z',trim)+path('M48 46 69 66 48 91 27 66Z',trim)+path('M48 54 60 66 48 81 36 66Z',gem);
 else body=path('M28 38Q12 53 24 75Q48 97 72 75Q84 53 68 38L62 43Q73 56 65 68Q48 82 31 68Q23 56 34 43Z',trim)+path(kind==='ring2'?'M30 25 48 13 66 25 62 45 34 45Z':'M32 27 48 12 64 27 48 47Z',metal)+path(kind==='ring2'?'M37 27 48 20 59 27 56 38 40 38Z':'M39 27 48 19 57 27 48 37Z',gem);
 let ornament='';
 if(rank>=3)ornament+=path('M18 29 11 '+(29-rank)+' 17 48 25 45Z',trim)+path('M78 29 85 '+(29-rank)+' 79 48 71 45Z',trim);
 if(rank>=5)ornament+=path('M48 5 54 15 48 25 42 15Z',gem,trim)+path('M29 83 48 '+(88+rank/2)+' 67 83 48 87Z',trim);
 if(rank>=7)ornament+=path('M14 53 6 42 9 67 22 73 19 61Z',metal,trim)+path('M82 53 90 42 87 67 74 73 77 61Z',metal,trim);
 if(rank>=9)ornament+='<path d="M6 32 11 22 7 9 M90 32 85 22 89 9" fill="none" stroke="'+gem+'" stroke-width="2" opacity=".8"/>';
 let studs=Array.from({length:rank},(_,i)=>'<circle cx="'+(25+i*5)+'" cy="93" r="1.2" fill="'+trim+'"/>').join('');
 return '<svg class="equipment-art" viewBox="0 0 96 100" aria-hidden="true"><ellipse cx="48" cy="85" rx="34" ry="8" fill="#0007"/>'+ornament+body+studs+'</svg>';
}
const artRecipeItem=forgeRecipeItem;forgeRecipeItem=recipe=>({...artRecipeItem(recipe),recipeId:recipe.id});
forgeRecipeIcon=recipe=>rankedEquipmentArt(recipe.slot==='weapon'?['sword','staff','dagger'][recipe.index]:recipe.slot,recipe.rank);
const artSaveItem=saveItem;saveItem=(item,expected)=>{let out=artSaveItem(item,expected);if(out&&item.recipeId!==undefined){let recipe=FORGE_RECIPES.find(r=>r.id===item.recipeId&&r.slot===item.slot);if(!recipe)throw Error('装備の外観レシピが不正です');out.recipeId=recipe.id;}return out;};
