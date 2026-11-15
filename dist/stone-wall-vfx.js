// Optional twelve-frame stone columns. The spell owns all lifetime/collision state.
const stoneWallVfxSheet=new Image();stoneWallVfxSheet.assetSrc='assets/stone-wall-vfx-v1.png';GAME_IMAGES.push(stoneWallVfxSheet);
function stoneWallVfxFrame(time,low=false){if(low)return 4;if(time<.3)return Math.min(3,Math.floor(Math.max(0,time)/.3*4));if(time>=3.6)return Math.min(11,8+Math.floor((time-3.6)/.4*4));return 4+Math.floor((time-.3)*4)%4;}
function paintStoneWallAtlas(s){
 if(presentationPrefs.reduced||!stoneWallVfxSheet.complete||!stoneWallVfxSheet.naturalWidth||!stoneWallVfxSheet.naturalHeight||!visibleAt(s.x,s.y))return false;
 let sw=stoneWallVfxSheet.naturalWidth/4,sh=stoneWallVfxSheet.naturalHeight/3,frame=stoneWallVfxFrame(s.time,effectQuality==='low'),width=76,height=width*sh/sw,[a,b]=s.ends;
 let columns=Array.from({length:4},(_,i)=>project(a.x+(b.x-a.x)*(i+.5)/4,a.y+(b.y-a.y)*(i+.5)/4)).sort((a,b)=>a.y-b.y);
 ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,Math.max(0,(4-s.time)*4));
 for(let q of columns)ctx.drawImage(stoneWallVfxSheet,(frame%4)*sw,Math.floor(frame/4)*sh,sw,sh,q.x-width/2,q.y-height*.94,width,height);
 ctx.restore();return true;
}
