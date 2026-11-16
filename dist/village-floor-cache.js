// Compare aligned byte masks in four-byte blocks, retaining exact tail checks.
function floorMaskChanged(layer,field,values){
 const saved=layer[field];
 if(!(values instanceof Uint8Array)||values.byteOffset%4||saved.byteOffset%4){for(let i=0;i<values.length;i++)if(saved[i]!==values[i])return true;return false;}
 const key=field+'Comparison';let views=layer[key];
 if(!views||views.values!==values||views.saved!==saved){const count=Math.floor(values.length/4);views={values,saved,count,a:new Uint32Array(values.buffer,values.byteOffset,count),b:new Uint32Array(saved.buffer,saved.byteOffset,count)};layer[key]=views;}
 for(let i=0;i<views.count;i++)if(views.a[i]!==views.b[i])return true;
 for(let i=views.count*4;i<values.length;i++)if(values[i]!==saved[i])return true;
 return false;
}
// Stationary village, grassland, forest and cavern ground only. Wetland water stays animated.
// Actors, walls, unseen terrain edges and effects remain live.
let villageFloorLayer=null;
function drawVillageFloorLayer(){
 const biome=villageOpen?'village':REGIONS[worldRegion]?.biome;
 const woodland=(biome==='草原'||biome==='森林')&&meadowTexture.complete&&meadowTexture.naturalWidth>0;
 const cavern=biome==='洞窟'&&typeof cavernTexture!=='undefined'&&cavernTexture.complete&&cavernTexture.naturalWidth>0;
 const texture=woodland?meadowTexture:cavern?cavernTexture:null;
 if(!p?.campaign||(!villageOpen&&!woodland&&!cavern)||!dungeon){villageFloorLayer=null;return false;}
 const ratio=renderPixelRatio(),key=[p.x,p.y,W,H,MW,MH,TILE,ISOX,ISOY,ratio,biome,texture?.naturalWidth||0,texture?.naturalHeight||0].join('|');
 let layer=villageFloorLayer;
 // During movement use the direct path, without allocating an extra canvas each step.
 if(!layer||layer.map!==dungeon||layer.key!==key){
  villageFloorLayer={map:dungeon,key,surface:layer?.surface,paint:layer?.paint,fresh:true};return false;
 }
 if(!layer.surface){layer.surface=document.createElement('canvas');layer.paint=layer.surface.getContext('2d');}
 if(!layer.paint)return false;
 let dirty=layer.fresh;
 for(const field of ['tiles','seen','visible']){
  const values=dungeon[field];
  if(!layer[field]||layer[field].length!==values.length){layer[field]=new Uint8Array(values.length);dirty=true;}
  if(floorMaskChanged(layer,field,values))dirty=true;
 }
 if(dirty){
  const surface=layer.surface,paint=layer.paint;
  surface.width=Math.round(W*ratio);surface.height=Math.round(H*ratio);paint.setTransform(ratio,0,0,ratio,0,0);
  for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++){
   if(!dungeon.seen[cell(gx,gy)]||(villageOpen&&!isFloor(gx,gy)))continue;
   const pos=center(gx,gy),screen=project(pos.x,pos.y);
   if(screen.x<-100||screen.y<-100||screen.x>W+100||screen.y>H+100)continue;
   if(woodland)paintStaticWoodlandFloor(paint,gx,gy,screen,biome);else if(cavern)paintStaticCavernFloor(paint,gx,gy,screen);else paintRegionFloor(paint,gx,gy,screen);
  }
  for(const field of ['tiles','seen','visible'])layer[field].set(dungeon[field]);
  layer.fresh=false;
 }
 // Match the backing-store extent exactly, avoiding scaling when W*ratio is fractional.
 ctx.drawImage(layer.surface,0,0,layer.surface.width/ratio,layer.surface.height/ratio);return true;
}
