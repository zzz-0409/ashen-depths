// Retain village building footprints and doorway routing after generic optimization.
const navigationVillagePassableBase=passable,navigationVillagePathBase=findPath;
// Preserve the existing four-corner collision test, avoiding duplicate tile lookups.
passable=(x,y,r=13)=>{
 if(typeof villagePointOpen==='function'&&p?.campaign&&villageOpen)return navigationVillagePassableBase(x,y,r);
 let low=gridPos(x-r,y-r),high=gridPos(x+r,y+r);
 if(!isFloor(low.x,low.y))return false;
 if(high.x!==low.x&&!isFloor(high.x,low.y))return false;
 if(high.y!==low.y){if(!isFloor(low.x,high.y))return false;if(high.x!==low.x&&!isFloor(high.x,high.y))return false;}
 return true;
};
// Stamp visitation instead of allocating/filling a full map for every creature's search.
// Nothing is cached across searches: changes to terrain and endpoints take effect immediately.
const navigationScratch={previous:new Int32Array(MW*MH),visited:new Uint32Array(MW*MH),queue:new Int32Array(MW*MH),stamp:0};
findPath=(start,end)=>{
 if(typeof villagePointOpen==='function'&&p?.campaign&&villageOpen)return navigationVillagePathBase(start,end);
 if(!end)return[];let a=gridPos(start.x,start.y),b=gridPos(end.x,end.y);
 if(!isFloor(a.x,a.y)||!isFloor(b.x,b.y))return[];
 let first=cell(a.x,a.y),goal=cell(b.x,b.y);if(first===goal)return[end];
 let {previous,visited,queue}=navigationScratch,stamp=(navigationScratch.stamp+1)>>>0;
 if(!stamp){visited.fill(0);stamp=1;}navigationScratch.stamp=stamp;
 let tail=1;queue[0]=first;visited[first]=stamp;previous[first]=first;
 for(let head=0;head<tail&&visited[goal]!==stamp;head++){
  let id=queue[head],x=id%MW,y=Math.floor(id/MW);
  // Match the original right/left/down/up order so shortest-path ties stay stable.
  for(let side=0;side<4;side++){
   let nx=x+(side===0?1:side===1?-1:0),ny=y+(side===2?1:side===3?-1:0),next=cell(nx,ny);
   if(isFloor(nx,ny)&&visited[next]!==stamp){visited[next]=stamp;previous[next]=id;queue[tail++]=next;}
  }
 }
 if(visited[goal]!==stamp)return[];
 let result=[end];for(let at=goal;at!==first;at=previous[at])result.push(center(at%MW,Math.floor(at/MW)));result.reverse();
 let simple=[],from=start;for(let i=0;i<result.length;){let j=i;while(j+1<result.length&&lineClear(from,result[j+1],15))j++;simple.push(result[j]);from=result[j];i=j+1;}return simple;
};
// Coalesce repeated tile footprints within one ray. Keep the exact sample positions;
// no cross-ray cache, so terrain edits are visible on the very next call.
const navigationRayBase=lineClear,navigationRayPassable=passable,navigationRayGrid=gridPos;
lineClear=(a,b,r=0)=>{
 if(typeof villagePointOpen==='function'&&p?.campaign&&villageOpen)return navigationRayBase(a,b,r);
 if(passable!==navigationRayPassable||gridPos!==navigationRayGrid)return navigationRayBase(a,b,r);
 let distance=dist(a,b),steps=Math.max(1,Math.ceil(distance/18)),lx,ly,hx,hy;
 for(let i=0;i<=steps;i++){
  let x=a.x+(b.x-a.x)*i/steps,y=a.y+(b.y-a.y)*i/steps;
  let ax=Math.floor((x-r)/TILE+9.5),ay=Math.floor((y-r)/TILE+9.5),bx=Math.floor((x+r)/TILE+9.5),by=Math.floor((y+r)/TILE+9.5);
  if(ax===lx&&ay===ly&&bx===hx&&by===hy)continue;
  if(!isFloor(ax,ay))return false;
  if(bx!==ax&&!isFloor(bx,ay))return false;
  if(by!==ay&&(!isFloor(ax,by)||(bx!==ax&&!isFloor(bx,by))))return false;
  lx=ax;ly=ay;hx=bx;hy=by;
 }
 return true;
};
