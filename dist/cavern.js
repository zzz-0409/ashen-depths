const cavernSheet=new Image();cavernSheet.assetSrc='assets/cavern-props.png';
const cavernTexture=new Image();cavernTexture.assetSrc='assets/cavern-floor.png';
function inCavern(){return !!p?.campaign&&!villageOpen&&REGIONS[worldRegion]?.biome==='洞窟'}
function cavernProp(gx,gy){let seed=((gx*83492791)^(gy*2971215073))>>>0,frame=[0,0,0,1,1,2,2,3][seed%8];return{frame,height:(frame===1?150:110)+seed%30}}
function caveEdgeVisible(gx,gy){return [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>isFloor(gx+dx,gy+dy)&&dungeon.visible[cell(gx+dx,gy+dy)])}
function paintStaticCavernFloor(context,gx,gy,s){
 context.save();context.translate(s.x,s.y);context.transform(ISOX,ISOY,-ISOX,ISOY,0,0);let sw=cavernTexture.naturalWidth/4,sh=cavernTexture.naturalHeight/4;
 context.drawImage(cavernTexture,((gx%4+4)%4)*sw,((gy%4+4)%4)*sh,sw,sh,-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4);
 if(!dungeon.visible[cell(gx,gy)]){context.fillStyle=isFloor(gx,gy)?'#000a':'#0006';context.fillRect(-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4)}context.restore();
}
const cavernFloorBase=floorTile;floorTile=(gx,gy)=>{
 if(!inCavern()||!cavernTexture.complete||!cavernTexture.naturalWidth)return cavernFloorBase(gx,gy);
 let pos=center(gx,gy),s=project(pos.x,pos.y);if(s.x<-100||s.y<-100||s.x>W+100||s.y>H+100)return;
 paintStaticCavernFloor(ctx,gx,gy,s);
};
const cavernWallBase=wall;wall=(gx,gy)=>{
 if(!inCavern()||!cavernSheet.complete||!cavernSheet.naturalWidth)return cavernWallBase(gx,gy);
 let pos=center(gx,gy),s=project(pos.x,pos.y),prop=cavernProp(gx,gy),sw=cavernSheet.naturalWidth/2,sh=cavernSheet.naturalHeight/2,h=prop.height,w=h*sw/sh;
 if(s.x<-w||s.x>W+w||s.y<-30||s.y>H+h)return;
 ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=(caveEdgeVisible(gx,gy)?1:.4)*treeOpacity(pos,w,h);ctx.fillStyle='#02070888';ctx.beginPath();ctx.ellipse(0,3,w*.35,14,0,0,Math.PI*2);ctx.fill();ctx.drawImage(cavernSheet,(prop.frame%2)*sw,Math.floor(prop.frame/2)*sh,sw,sh,-w/2,-h*.94,w,h);ctx.restore();
};
const cavernEdgeBase=drawTerrainEdge;drawTerrainEdge=(gx,gy)=>{
 cavernEdgeBase(gx,gy);if(!inCavern())return;if(!dungeon.seen[cell(gx,gy)])floorTile(gx,gy);
 if(!cavernSheet.complete||!cavernSheet.naturalWidth||cavernProp(gx,gy).frame<2||!caveEdgeVisible(gx,gy))return;
 let pos=center(gx,gy),s=project(pos.x,pos.y);ctx.save();ctx.translate(s.x,s.y);ctx.scale(1,.5);let glow=ctx.createRadialGradient(0,0,0,0,0,70);glow.addColorStop(0,'#80e4e32b');glow.addColorStop(1,'#80e4e300');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,70,0,Math.PI*2);ctx.fill();ctx.restore();
};

