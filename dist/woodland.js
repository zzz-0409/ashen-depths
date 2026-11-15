const woodlandSheet=new Image();woodlandSheet.assetSrc='assets/woodland-trees.png';
const meadowTexture=new Image();meadowTexture.assetSrc='assets/meadow-ground.png';
function isWoodlandBiome(biome){return ['草原','森林','湿地'].includes(biome)}
function woodlandTree(gx,gy,biome){let seed=((gx*73856093)^(gy*19349663))>>>0,variants=biome==='湿地'?[3,3,2]:biome==='森林'?[0,0,1]:[1,2,0];return{frame:variants[seed%variants.length],height:155+(seed%40)}}
function treeOpacity(pos,width,height){
 if(!p||pos.x+pos.y<p.x+p.y)return 1;
 let s=project(pos.x,pos.y),hero=project(p.x,p.y);
 return Math.abs(s.x-hero.x)<width*.4+24&&s.y-height*.94<hero.y+5&&s.y+height*.06>hero.y-92?.24:1;
}
function paintStaticWoodlandFloor(context,gx,gy,s,biome){
 context.save();context.translate(s.x,s.y);context.transform(ISOX,ISOY,-ISOX,ISOY,0,0);let sw=meadowTexture.naturalWidth/4,sh=meadowTexture.naturalHeight/4;
 context.drawImage(meadowTexture,((gx%4+4)%4)*sw,((gy%4+4)%4)*sh,sw,sh,-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4);
 context.fillStyle=biome==='森林'?'#12382155':'#4c6e3433';context.fillRect(-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4);
 if(!dungeon.visible[cell(gx,gy)]){context.fillStyle='#000a';context.fillRect(-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4)}context.restore();
}
const woodlandFloorBase=floorTile;floorTile=(gx,gy)=>{
 let biome=REGIONS[worldRegion]?.biome;if(!p?.campaign||villageOpen||!isWoodlandBiome(biome)||!meadowTexture.complete||!meadowTexture.naturalWidth)return woodlandFloorBase(gx,gy);
 let pos=center(gx,gy),s=project(pos.x,pos.y);if(s.x<-100||s.y<-100||s.x>W+100||s.y>H+100)return;
 if(biome!=='湿地'){paintStaticWoodlandFloor(ctx,gx,gy,s,biome);return;}
 ctx.save();ctx.translate(s.x,s.y);ctx.transform(ISOX,ISOY,-ISOX,ISOY,0,0);let sw=meadowTexture.naturalWidth/4,sh=meadowTexture.naturalHeight/4;
 ctx.drawImage(meadowTexture,((gx%4+4)%4)*sw,((gy%4+4)%4)*sh,sw,sh,-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4);
 ctx.fillStyle=biome==='森林'?'#12382155':biome==='湿地'?'#30483b66':'#4c6e3433';ctx.fillRect(-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4);
 if(biome==='湿地'&&typeof drawWetlandGround==='function')drawWetlandGround(pos,performance.now()/1000);
 if(!dungeon.visible[cell(gx,gy)]){ctx.fillStyle='#000a';ctx.fillRect(-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4)}ctx.restore();
};
const woodlandWallBase=wall;wall=(gx,gy)=>{
 let biome=REGIONS[worldRegion]?.biome;if(!p?.campaign||villageOpen||!isWoodlandBiome(biome)||!woodlandSheet.complete||!woodlandSheet.naturalWidth)return woodlandWallBase(gx,gy);
 let pos=center(gx,gy),s=project(pos.x,pos.y),tree=woodlandTree(gx,gy,biome),sw=woodlandSheet.naturalWidth/2,sh=woodlandSheet.naturalHeight/2,h=tree.height,w=h*sw/sh;
 if(s.x<-w||s.x>W+w||s.y<-30||s.y>H+h)return;
 ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=(dungeon.seen[cell(gx,gy)]?.9:.65)*treeOpacity(pos,w,h);ctx.fillStyle='#07170e55';ctx.beginPath();ctx.ellipse(5,5,w*.28,17,0,0,Math.PI*2);ctx.fill();
 ctx.drawImage(woodlandSheet,(tree.frame%2)*sw,Math.floor(tree.frame/2)*sh,sw,sh,-w/2,-h*.94,w,h);ctx.restore();
};

// Adjacent obstacle tiles already expose a tree; give its roots a fog-darkened base.
function drawTerrainEdge(gx,gy){if(p?.campaign&&!villageOpen&&isWoodlandBiome(REGIONS[worldRegion]?.biome)&&!dungeon.seen[cell(gx,gy)])floorTile(gx,gy)}

