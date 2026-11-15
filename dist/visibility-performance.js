// Reuse stationary campaign visibility only while terrain and collision helpers match.
// Restore the mask on every call: other systems may clear visible/seen in place.
const stationaryRevealBase=reveal;
const stationaryRevealHelpers=[lineClear,passable,isFloor,gridPos,center,cell];
let stationaryVisibility=null;
reveal=()=>{
 if(!p?.campaign||!dungeon||stationaryRevealHelpers[0]!==lineClear||stationaryRevealHelpers[1]!==passable||stationaryRevealHelpers[2]!==isFloor||stationaryRevealHelpers[3]!==gridPos||stationaryRevealHelpers[4]!==center||stationaryRevealHelpers[5]!==cell){
  stationaryVisibility=null;return stationaryRevealBase();
 }
 let cached=stationaryVisibility,tiles=dungeon.tiles;
 let same=cached&&cached.map===dungeon&&cached.x===p.x&&cached.y===p.y&&cached.width===MW&&cached.height===MH&&cached.tileSize===TILE&&cached.tiles.length===tiles.length;
 if(same)for(let i=0;i<tiles.length;i++)if(tiles[i]!==cached.tiles[i]){same=false;break;}
 if(same){
  for(let i=0;i<cached.visible.length;i++){let value=cached.visible[i];dungeon.visible[i]=value;if(value)dungeon.seen[i]=1;}
  return;
 }
 stationaryRevealBase();
 if(!cached||cached.tiles.length!==tiles.length||cached.visible.length!==dungeon.visible.length){
  cached={tiles:new Uint8Array(tiles.length),visible:new Uint8Array(dungeon.visible.length)};
 }
 cached.map=dungeon;cached.x=p.x;cached.y=p.y;cached.width=MW;cached.height=MH;cached.tileSize=TILE;
 cached.tiles.set(tiles);cached.visible.set(dungeon.visible);stationaryVisibility=cached;
};
