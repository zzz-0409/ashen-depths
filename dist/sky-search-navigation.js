// Keep the destination selector aligned with the inspected node; search completion effects too.
let skySearchResults=[];
function skySearchText(value){return String(value||'').normalize('NFKC').trim().toLowerCase();}
function skyNodeMatches(n,query){let terms=skySearchText(query).split(/\s+/).filter(Boolean);if(!terms.length)return false;let star=TREE_STARS[n.star],completion=n.major&&star?starCompletionDescription(star.id):'',text=skySearchText([n.name,MODS[n.kind]?.[0],n.key?.desc,star?.latin,star?.code,completion].filter(Boolean).join(' '));return terms.every(term=>text.includes(term));}
searchTree=query=>{treeQuery=String(query||'');skySearchResults=NODES.filter(n=>skyNodeMatches(n,treeQuery)).map(n=>n.id);let found=new Set(skySearchResults);document.querySelectorAll('[data-node]').forEach(el=>el.classList.toggle('search-match',found.has(+el.dataset.node)));let active=!!skySearchText(treeQuery),status=$('treeSearchStatus'),next=$('treeSearchNext');if(status){status.hidden=!active;status.textContent=active?skySearchResults.length+'件':'';}if(next){next.hidden=!active;next.disabled=!skySearchResults.length;}};
function focusNextTreeSearch(){if(!skySearchResults.length)return false;let index=skySearchResults.indexOf(treeFocus),next=skySearchResults[(index+1)%skySearchResults.length];let star=TREE_STARS[NODES[next]?.star];if(star)jumpToConstellation(star.id);treeFocus=next;inspectNode(next);menuTreeFocus();return true;}
// The detail element survives selection changes; its old scroll position must not.
// Re-focusing the same star (including B from details) keeps the reader's place.
const skyNavigationInspectBase=inspectNode;inspectNode=id=>{
 let detail=$('nodeDetail'),same=detail?.dataset.skyNode===String(id),scroll=same?detail.scrollTop:0;
 let result=skyNavigationInspectBase(id),star=TREE_STARS[NODES[id]?.star],selector=$('skyJump');
 if(star&&selector)selector.value=String(star.id);
 detail=$('nodeDetail');if(detail){detail.dataset.skyNode=String(id);detail.scrollTop=scroll;}
 return result;
};
const skyNavigationHtmlBase=treeHtml;treeHtml=()=>{let html=skyNavigationHtmlBase(),star=TREE_STARS[NODES[treeFocus]?.star];if(star)html=html.replace('<option value="'+star.id+'">','<option value="'+star.id+'" selected>');return html.replace('<button onclick="zoomTree(-.15)">','<span id="treeSearchStatus" role="status" aria-live="polite" hidden></span><button id="treeSearchNext" onclick="focusNextTreeSearch()" hidden disabled>次の検索結果</button><button onclick="zoomTree(-.15)">');};
