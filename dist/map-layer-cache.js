// Cache only map terrain. Player, quest and boss markers still draw every frame.
const mapFloorUncached=drawRegionMapFloor;
let mapFloorLayers=[];
drawRegionMapFloor=(context,map,x,y,scale)=>{
 const ratio=typeof renderPixelRatio==='function'?renderPixelRatio():1;
 if(!Number.isFinite(scale)||scale<=0||typeof document.createElement!=='function')return mapFloorUncached(context,map,x,y,scale);
 let layer=mapFloorLayers.find(v=>v.map===map&&v.scale===scale&&v.ratio===ratio&&v.width===MW&&v.height===MH);
 if(!layer){
  const surface=document.createElement('canvas'),paint=surface.getContext('2d');
  if(!paint)return mapFloorUncached(context,map,x,y,scale);
  const width=(MW-1)*scale+Math.ceil(scale),height=(MH-1)*scale+Math.ceil(scale);
  surface.width=Math.ceil(width*ratio);surface.height=Math.ceil(height*ratio);
  layer={map,scale,ratio,width:MW,height:MH,surface,paint,tones:new Uint8Array(MW*MH),fresh:true};
  // Small map plus expanded map; never retain previous world maps indefinitely.
  mapFloorLayers=mapFloorLayers.filter(v=>v.map===map);
  if(mapFloorLayers.length>=2)mapFloorLayers.shift();
  mapFloorLayers.push(layer);
 }
 let dirty=layer.fresh;
 for(let i=0;i<layer.tones.length;i++){
  const tone=map.seen[i]&&map.tiles[i]?(map.visible[i]?2:1):0;
  if(layer.tones[i]!==tone){layer.tones[i]=tone;dirty=true;}
 }
 if(dirty){
  layer.paint.setTransform(1,0,0,1,0,0);
  layer.paint.clearRect(0,0,layer.surface.width,layer.surface.height);
  layer.paint.setTransform(ratio,0,0,ratio,0,0);
  mapFloorUncached(layer.paint,map,0,0,scale);layer.fresh=false;
 }
 context.drawImage(layer.surface,x,y,layer.surface.width/ratio,layer.surface.height/ratio);
};
