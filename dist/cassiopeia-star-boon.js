NAMED_STAR_BOONS.Cas=['女王の継ぎ布','同じ装備タグを3・5・7部位そろえると、そのタグを4・6・8部位相当としてセット効果を発動する。複数のタグに同時適用。0・1部位には適用しない。鞄・倉庫は数えず、装備そのもののタグや能力は変更しない。装備変更・星座の完成解除で即座に再判定する。'];
const cassiopeiaStar=TREE_STARS.find(s=>s.code==='Cas');
if(!cassiopeiaStar)throw Error('Missing Cassiopeia');
namedBoonIndices.Cas=STAR_BOONS.length;cassiopeiaStar.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Cas);treeOwnershipRef=null;treeOwnershipLength=-1;
const cassiopeiaTagCountBase=tagEffectiveCountFor;
tagEffectiveCountFor=(character,id)=>{
 const count=cassiopeiaTagCountBase(character,id);
 if(count!==3&&count!==5&&count!==7)return count;
 // Equipment previews share the current node array: use the ownership cache in combat.
 let complete=false;
 if(character?.nodes===p?.nodes)complete=treeOwnership().complete.has(cassiopeiaStar.id);
 else if(Array.isArray(character?.nodes)){const owned=new Set(character.nodes);complete=cassiopeiaStar.ids.every(node=>owned.has(node));}
 return count+Number(complete);
};
