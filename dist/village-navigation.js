// Ground footprints sit behind the service entrances. The training pavilion is
// open: only its posts block movement, not the floor or the target in front.
const VILLAGE_OBSTACLES=[
 {x:-65,y:-195,hx:48,hy:48},
 {x:-235,y:15,hx:48,hy:48},
 {x:135,y:-155,r:12},{x:225,y:-155,r:12},
 {x:135,y:-65,r:12},{x:225,y:-65,r:12},
 {x:-290,y:-130,r:23},{x:-270,y:140,r:22},
 {x:100,y:160,r:9},{x:-120,y:-190,r:9}
];
function villagePointOpen(x,y,r=13){
 return !VILLAGE_OBSTACLES.some(o=>o.r!==undefined?Math.hypot(x-o.x,y-o.y)<=o.r+r:Math.abs(x-o.x)<=o.hx+r&&Math.abs(y-o.y)<=o.hy+r);
}
const villagePassableBase=passable;passable=(x,y,r=13)=>villagePassableBase(x,y,r)&&(!p?.campaign||!villageOpen||villagePointOpen(x,y,r));
const villagePathBase=findPath;findPath=(start,end)=>{
 if(!p?.campaign||!villageOpen)return villagePathBase(start,end);
 if(!end||!passable(start.x,start.y,13)||!passable(end.x,end.y,13))return [];
 if(lineClear(start,end,13))return [end];
 let a=gridPos(start.x,start.y),b=gridPos(end.x,end.y),first=cell(a.x,a.y),goal=cell(b.x,b.y);
 if(first===goal)return [];
 let previous=new Int32Array(MW*MH).fill(-1),queue=[first];previous[first]=first;
 for(let k=0;k<queue.length&&previous[goal]<0;k++){
  let at=queue[k],gx=at%MW,gy=Math.floor(at/MW),from=at===first?start:center(gx,gy);
  for(let [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
   let x=gx+dx,y=gy+dy;if(x<0||y<0||x>=MW||y>=MH)continue;
   let id=cell(x,y);if(previous[id]!==-1)continue;
   let to=id===goal?end:center(x,y);if(!passable(to.x,to.y,13)||!lineClear(from,to,13))continue;
   previous[id]=at;queue.push(id);
  }
 }
 if(previous[goal]<0)return [];
 let points=[end];for(let at=previous[goal];at!==first;at=previous[at])points.push(center(at%MW,Math.floor(at/MW)));points.reverse();
 let result=[],from=start;for(let i=0;i<points.length;){let j=i;while(j+1<points.length&&lineClear(from,points[j+1],13))j++;result.push(points[j]);from=points[j];i=j+1;}
 return result;
};
