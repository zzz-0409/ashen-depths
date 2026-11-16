NAMED_STAR_BOONS.CrB=['星冠の結び','ソケットが3個以上ある各装備で、先頭と末尾を追加で接続する。通常のリンクと合わせてつながる範囲に、サポートジェムの効果が届く。切れた中間リンクそのものは直さず、別の装備ともつながらない。同種サポートは重複せず、対応するスキルの種類と装着色の制限も通常どおり。装備のリンク情報は変えず、加護を外すと追加接続だけが消える。'];
const coronaStar=TREE_STARS.find(s=>s.code==='CrB');
if(!coronaStar)throw Error('Missing Corona Borealis');
namedBoonIndices.CrB=STAR_BOONS.length;coronaStar.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.CrB);treeOwnershipRef=null;treeOwnershipLength=-1;
function coronaLinked(item,character=p){
 if((item?.sockets?.length||0)<3)return false;
 if(character?.nodes===p?.nodes)return treeOwnership().complete.has(coronaStar.id);
 if(!Array.isArray(character?.nodes))return false;const owned=new Set(character.nodes);return coronaStar.ids.every(id=>owned.has(id));
}
const coronaGroupBase=socketGroupIndices;socketGroupIndices=(item,index,character=p)=>{
 const group=coronaGroupBase(item,index,character);if(!group.length||!coronaLinked(item,character))return group;
 const last=item.sockets.length-1,atStart=group[0]===0,atEnd=group.at(-1)===last;if(atStart===atEnd)return group;
 const other=coronaGroupBase(item,atStart?last:0,character);
 // Stable socket order preserves element conversion/support priority.
 return [...new Set([...group,...other])].sort((a,b)=>a-b);
};
const coronaSocketViewBase=socketView;socketView=(slot,...args)=>{
 const html=coronaSocketViewBase(slot,...args),item=p[slot];if(!coronaLinked(item))return html;
 return html.slice(0,-6)+'<small class="socket-crown-link" title="かんむり座の加護：先頭と末尾のソケットを追加で接続" aria-label="かんむり座の加護でソケット1と'+item.sockets.length+'を接続">♔ 星冠リンク：1 ↔ '+item.sockets.length+'</small></div>';
};
