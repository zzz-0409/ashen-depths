// Each pattern uses real star coordinates. Only the arrangement of whole
// constellations and the dashed travel paths belong to the game's skill graph.
const SKY_TREE_SIZE=7600,SKY_TREE_CENTER=3800;
const REAL_STAR_EDGES=new Set(),REAL_STAR_GROUPS=[];
const skyEdgeKey=(a,b)=>Math.min(a,b)+':'+Math.max(a,b);
function projectConstellation(data){
 let rad=Math.PI/180,ra=Math.atan2(data.points.reduce((s,p)=>s+Math.sin(p[0]*rad),0),data.points.reduce((s,p)=>s+Math.cos(p[0]*rad),0)),dec=data.points.reduce((s,p)=>s+p[1]*rad,0)/data.points.length;
 let xy=data.points.map(([r,d])=>{r=r*rad-ra;d*=rad;let z=Math.sin(dec)*Math.sin(d)+Math.cos(dec)*Math.cos(d)*Math.cos(r);return[-Math.cos(d)*Math.sin(r)/z,-(Math.cos(dec)*Math.sin(d)-Math.sin(dec)*Math.cos(d)*Math.cos(r))/z]});
 let minX=Math.min(...xy.map(p=>p[0])),maxX=Math.max(...xy.map(p=>p[0])),minY=Math.min(...xy.map(p=>p[1])),maxY=Math.max(...xy.map(p=>p[1])),scale=260/Math.max(maxX-minX,maxY-minY,.001);
 let points=xy.map(([x,y])=>[(x-(minX+maxX)/2)*scale,(y-(minY+maxY)/2)*scale]);
 // Keep the astronomical source coordinates intact; separate only display frames.
 let degree=Array(points.length).fill(0);for(let [a,b] of data.edges){degree[a]++;degree[b]++;}let main=degree.indexOf(Math.max(...degree));
 for(let pass=0;pass<240;pass++){let overlap=0;for(let i=0;i<points.length;i++)for(let j=0;j<i;j++){let dx=points[i][0]-points[j][0],dy=points[i][1]-points[j][1],distance=Math.hypot(dx,dy),gap=(i===main?22:12)+(j===main?22:12)+80;if(distance>=gap)continue;overlap=Math.max(overlap,gap-distance);if(distance<1e-8){dx=Math.cos(i*2.4+j);dy=Math.sin(i*2.4+j);distance=1;}let push=(gap-distance)/2+.001;points[i][0]+=dx/distance*push;points[i][1]+=dy/distance*push;points[j][0]-=dx/distance*push;points[j][1]-=dy/distance*push;}if(overlap<.01)break;}
 let mx=(Math.min(...points.map(p=>p[0]))+Math.max(...points.map(p=>p[0])))/2,my=(Math.min(...points.map(p=>p[1]))+Math.max(...points.map(p=>p[1])))/2;
 return points.map(([x,y])=>[x-mx,y-my]);
}
const skyOldMajors=TREE_STARS.map(s=>s.major),skySmallPool=NODES.filter(n=>n.id&&!n.key).map(n=>n.id),skyCovenants=NODES.filter(n=>n.covenant);
for(let n of NODES){n.links=[];delete n.star;}
TREE_STARS.length=0;TREE_BRANCHES.length=0;
NODES[0].x=NODES[0].y=SKY_TREE_CENTER;
function skyNewNode(){let n={id:NODES.length,x:0,y:0,kind:'attack',name:'星',value:2,major:false,links:[]};NODES.push(n);return n.id;}
for(let [index,data]of REAL_CONSTELLATIONS.entries()){
 let angle=index*2.399963229728653+Math.sin(index)*.08,radius=440+320*Math.sqrt(index),cx=SKY_TREE_CENTER+Math.cos(angle)*radius,cy=SKY_TREE_CENTER+Math.sin(angle)*radius,xy=projectConstellation(data),degree=Array(data.points.length).fill(0);
 for(let [a,b]of data.edges){degree[a]++;degree[b]++;}
 let main=degree.indexOf(Math.max(...degree)),majorId=skyOldMajors[index]??skyNewNode(),ids=data.points.map((_,i)=>i===main?majorId:skySmallPool.shift()??skyNewNode()),branch=index%12,tier=1+Math.min(2,Math.floor(index/30));
 let star={id:index,major:majorId,members:ids.filter(id=>id!==majorId),name:data.name,code:data.id,latin:data.latin,center:{x:cx,y:cy},ids};TREE_STARS.push(star);REAL_STAR_GROUPS.push(star);
 for(let i=0;i<ids.length;i++){
  let n=NODES[ids[i]];delete n.key;delete n.talent;n.major=i===main;n.kind=types[branch%6];n.value=n.major?0:({attack:2,life:10,spell:3,crit:1,speed:1,guard:1})[n.kind];n.x=cx+xy[i][0];n.y=cy+xy[i][1];n.star=index;n.sky={ra:data.points[i][0],dec:data.points[i][1],constellation:data.id};n.name=data.name+' · 星'+(i+1);
  if(n.major){n.name=data.name+'の加護';n.talent={branch,tier};n.key={code:'talent_'+data.id,icon:ICONS[n.kind]??8,desc:'ツリー限定 · '+TREE_TALENTS[branch][1](tier)};}
 }
 for(let [a,b]of data.edges){treeConnect(ids[a],ids[b]);REAL_STAR_EDGES.add(skyEdgeKey(ids[a],ids[b]));}
 // Some legitimate figures contain disjoint line groups (notably Serpens).
 // Join those with visibly different, gameplay-only travel paths.
 let reached=new Set([majorId]);
 while(reached.size<ids.length){let queue=[...reached];for(let id of queue)for(let next of NODES[id].links)if(ids.includes(next)&&!reached.has(next)){reached.add(next);queue.push(next)}if(reached.size===ids.length)break;let pair=null,best=Infinity;for(let a of reached)for(let b of ids)if(!reached.has(b)){let d=dist(NODES[a],NODES[b]);if(d<best){best=d;pair=[a,b]}}treeConnect(...pair);reached.add(pair[1]);}
}
// A minimum spanning tree supplies organic, branching travel from the center.
let skyConnected=[{ids:[0],center:NODES[0]}],skyPending=[...REAL_STAR_GROUPS];
while(skyPending.length){let best=Infinity,pick=0,parent=null;for(let i=0;i<skyPending.length;i++)for(let source of skyConnected){let d=dist(source.center,skyPending[i].center);if(d<best){best=d;pick=i;parent=source}}let target=skyPending.splice(pick,1)[0],pair=null,nearest=Infinity;for(let a of parent.ids)for(let b of target.ids){let d=dist(NODES[a],NODES[b]);if(d<nearest){nearest=d;pair=[a,b]}}treeConnect(...pair);skyConnected.push(target);}
for(let [i,n]of skyCovenants.entries()){let angle=i*Math.PI/6+.12;n.x=SKY_TREE_CENTER+Math.cos(angle)*3540;n.y=SKY_TREE_CENTER+Math.sin(angle)*3540;let closest=REAL_STAR_GROUPS.flatMap(s=>s.ids).reduce((best,id)=>dist(n,NODES[id])<dist(n,NODES[best])?id:best,REAL_STAR_GROUPS[0].major);treeConnect(n.id,closest);}
// Separate entire constellations so their internal astronomical pattern stays intact.
// Include the origin and outer covenant frames in the same clearance pass.
{
 const groups=REAL_STAR_GROUPS.map(s=>({star:s,nodes:s.ids.map(id=>NODES[id])}));
 groups.push({nodes:[NODES[0]],fixed:true},...skyCovenants.map(n=>({nodes:[n],fixed:true})));
 const move=(g,x,y)=>{if(g.fixed)return;for(let n of g.nodes){n.x+=x;n.y+=y;}g.star.center.x+=x;g.star.center.y+=y;};
 for(let pass=0;pass<160;pass++){
  let worst=0;
  for(let i=0;i<groups.length;i++)for(let j=0;j<i;j++){
   let a=groups[i],b=groups[j];if(a.fixed&&b.fixed)continue;
   let push=null;
   for(let n of a.nodes)for(let m of b.nodes){let dx=n.x-m.x,dy=n.y-m.y,d=Math.hypot(dx,dy),over=skyFrameRadius(n)+skyFrameRadius(m)+80-d;if(over>0&&(!push||over>push.over))push={dx,dy,d,over};}
   if(!push)continue;worst=Math.max(worst,push.over);
   let {dx,dy,d,over}=push;if(d<1e-8){dx=1;dy=0;d=1;}
   let amount=(over+.01)/(a.fixed||b.fixed?1:2);move(a,dx/d*amount,dy/d*amount);move(b,-dx/d*amount,-dy/d*amount);
  }
  if(worst<.01)break;
 }
}
// Place names once, after frame separation. Moving labels must not move saved nodes.
function skyLabelBounds(star,x,y){let width=Array.from(star.name).length*24+16;return {x,y,left:x-width/2,right:x+width/2,top:y-32,bottom:y+8};}
function skyLabelIntersects(a,b,gap=0){return a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;}
const SKY_LABELS=[];
{
 const obstacles=NODES.map(n=>{let r=skyFrameRadius(n)+8;return {left:n.x-r,right:n.x+r,top:n.y-r,bottom:n.y+r};});
 const offsets=[];for(let y=-240;y<=240;y+=24)for(let x=-240;x<=240;x+=24)offsets.push({x,y});
 offsets.sort((a,b)=>a.x*a.x+a.y*a.y-b.x*b.x-b.y*b.y||a.y-b.y||a.x-b.x);
 for(let star of REAL_STAR_GROUPS){
  let x=star.center.x,y=Math.min(...star.ids.map(id=>NODES[id].y))-52,chosen=null;
  for(let offset of offsets){let box=skyLabelBounds(star,x+offset.x,y+offset.y);if(box.left<8||box.right>SKY_TREE_SIZE-8||box.top<8||box.bottom>SKY_TREE_SIZE-8)continue;if(obstacles.some(n=>skyLabelIntersects(box,n))||SKY_LABELS.some(label=>skyLabelIntersects(box,label,8)))continue;chosen=box;break;}
  // The current 88 figures all fit nearby. Keep an explicit fallback for future data.
  SKY_LABELS.push(chosen||skyLabelBounds(star,x,y));
 }
}
treeOwnershipRef=null;treeOwnershipLength=-1;
function skyFrameRadius(n){return n.id===0?28:n.covenant?27:n.major?22:12;}
function skyLinkEnds(a,b){let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,ra=skyFrameRadius(a)+4,rb=skyFrameRadius(b)+4;return {x1:a.x+dx/d*ra,y1:a.y+dy/d*ra,x2:b.x-dx/d*rb,y2:b.y-dy/d*rb};}
function skyNodeHtml(n,owned){let r=n.id===0?24:n.covenant?23:n.major?18:8,complete=owned.complete.has(n.star),status=owned.owned.has(n.id)?'owned':nodeAvailable(n.id)?'available':'locked';return '<g data-node="'+n.id+'" role="button" tabindex="0" aria-label="'+gearEscape(n.name)+'" onclick="inspectNode('+n.id+')" onkeydown="if(event.key===\'Enter\')inspectNode('+n.id+')" class="node '+status+(n.major?' talent':'')+(n.covenant?' covenant':'')+(complete?' blessed':'')+'"><circle cx="'+n.x+'" cy="'+n.y+'" r="'+r+'"/>'+(n.major||n.id===0?iconSVG(n.key?.icon??8,n.x,n.y,r*.6):'')+'<circle class="rim" cx="'+n.x+'" cy="'+n.y+'" r="'+(r+4)+'"/><title>'+gearEscape(n.name)+'</title></g>';}
treeHtml=()=>{
 let ownership=treeOwnership(),edges=[];for(let n of NODES)for(let id of n.links)if(id>n.id){let ends=skyLinkEnds(n,NODES[id]);edges.push('<line class="'+(REAL_STAR_EDGES.has(skyEdgeKey(n.id,id))?'sky-pattern':'sky-travel')+(ownership.owned.has(n.id)&&ownership.owned.has(id)?' learned':'')+'" x1="'+ends.x1+'" y1="'+ends.y1+'" x2="'+ends.x2+'" y2="'+ends.y2+'"/>');}
 let labels=REAL_STAR_GROUPS.map(s=>'<text class="sky-label '+(ownership.complete.has(s.id)?'complete':'')+'" data-star-label="'+s.id+'" x="'+SKY_LABELS[s.id].x+'" y="'+SKY_LABELS[s.id].y+'">'+gearEscape(s.name)+'</text>').join('');
 return '<div class="tree-toolbar"><span>全88星座 · '+NODES.length+'ノード · 残り <b>'+p.points+'</b>pt</span><input id="treeSearch" aria-label="パッシブを検索" placeholder="星座・効果を検索" oninput="searchTree(this.value)"><select id="skyJump" aria-label="移動する星座">'+REAL_STAR_GROUPS.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('')+'</select><button onclick="jumpToConstellation(Number($(\'skyJump\').value))">星座へ移動</button><button onclick="zoomTree(-.15)">−</button><button onclick="zoomTree(.15)">＋</button><button onclick="refundTree()">全返還</button></div><p class="muted">実線：星の並び · 点線：取得ルート。星座の全ノードで加護が発動。</p><div class="branching-tree-layout"><div id="treeViewport"><svg id="tree" width="'+SKY_TREE_SIZE*treeZoom+'" height="'+SKY_TREE_SIZE*treeZoom+'" viewBox="0 0 '+SKY_TREE_SIZE+' '+SKY_TREE_SIZE+'">'+edges.join('')+labels+NODES.map(n=>skyNodeHtml(n,ownership)).join('')+'</svg></div><div id="nodeDetail"></div></div>';
};
zoomTree=amount=>{let vp=$('treeViewport');if(!vp)return;let cx=(vp.scrollLeft+vp.clientWidth/2)/treeZoom,cy=(vp.scrollTop+vp.clientHeight/2)/treeZoom;treeZoom=clamp(treeZoom+amount,.1,3);$('tree').setAttribute('width',SKY_TREE_SIZE*treeZoom);$('tree').setAttribute('height',SKY_TREE_SIZE*treeZoom);vp.scrollLeft=cx*treeZoom-vp.clientWidth/2;vp.scrollTop=cy*treeZoom-vp.clientHeight/2;};
function jumpToConstellation(index){let s=REAL_STAR_GROUPS[index];if(!s)return;treeFocus=s.major;inspectNode(s.major);menuTreeFocus();let vp=$('treeViewport');let width=Math.max(...s.ids.map(id=>NODES[id].x))-Math.min(...s.ids.map(id=>NODES[id].x))+80,height=Math.max(...s.ids.map(id=>NODES[id].y))-Math.min(...s.ids.map(id=>NODES[id].y))+130;zoomTree(clamp(Math.min((vp.clientWidth-40)/width,(vp.clientHeight-40)/height),.2,1.4)-treeZoom);vp.scrollLeft=s.center.x*treeZoom-vp.clientWidth/2;vp.scrollTop=(s.center.y-20)*treeZoom-vp.clientHeight/2;}
const skyPanelBase=panel;panel=kind=>{let result=skyPanelBase(kind);if(kind==='skills'&&started&&!dead){let vp=$('treeViewport'),n=NODES[treeFocus]||NODES[0];if(vp){vp.scrollLeft=n.x*treeZoom-vp.clientWidth/2;vp.scrollTop=n.y*treeZoom-vp.clientHeight/2}}return result};
const skyInspectBase=inspectNode;inspectNode=id=>{skyInspectBase(id);let n=NODES[id],star=REAL_STAR_GROUPS[n?.star];if(!star)return;$('nodeDetail').insertAdjacentHTML('beforeend','<small class="sky-provenance">'+gearEscape(star.latin)+' · '+star.code+'<br>星の座標に基づく配列。枠が重ならないよう表示間隔を調整。星座間の配置・点線はゲーム用。</small><button onclick="nextConstellationStar('+id+')">この星座の次の星を見る</button>');};
function nextConstellationStar(id){let s=REAL_STAR_GROUPS[NODES[id]?.star];if(!s)return;let next=s.ids[(s.ids.indexOf(id)+1)%s.ids.length];treeFocus=next;inspectNode(next);menuTreeFocus();}
