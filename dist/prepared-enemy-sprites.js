// Cache a display-resolution atlas; preserve source assets and exact destination geometry.
const preparedEnemyAtlases=new WeakMap();
function drawPreparedEnemySprite(context,img,sx,sy,sw,sh,dx,dy,dw,dh){
 let width=img.naturalWidth,height=img.naturalHeight;if(!img.complete||!width||!height||width<=768){context.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);return;}
 // Four-column enemy sheets; retain enough pixels for the renderer's maximum 1.25 scale.
 let targetWidth=Math.min(width,Math.max(768,Math.ceil(Math.abs(dw)*1.25/64)*64*4));
 let cached=preparedEnemyAtlases.get(img);if(!cached||cached.src!==img.src||cached.width!==width||cached.height!==height||cached.targetWidth<targetWidth){
  cached={src:img.src,width,height,targetWidth,surface:null};preparedEnemyAtlases.set(img,cached);
  try{let surface=document.createElement('canvas');surface.width=targetWidth;surface.height=Math.max(3,Math.round(height/width*targetWidth/3)*3);let paint=surface.getContext('2d');if(paint){paint.imageSmoothingEnabled=true;paint.imageSmoothingQuality='high';paint.drawImage(img,0,0,surface.width,surface.height);cached.surface=surface;}}catch{}
 }
 if(!cached.surface){context.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);return;}
 let rx=cached.surface.width/width,ry=cached.surface.height/height;context.drawImage(cached.surface,sx*rx,sy*ry,sw*rx,sh*ry,dx,dy,dw,dh);
}
