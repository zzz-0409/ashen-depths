// Shallow water is decorative ground: routes and enemy attacks keep their existing rules.
// Basins are anchored in world coordinates and clipped per tile, including across seams.
const wetlandBasinCache=new Map();
function wetlandBasin(gx,gy){
 let key=gx+','+gy,cached=wetlandBasinCache.get(key);if(cached)return cached;
 let seed=((gx*73856093)^(gy*19349663)^0x519ab)>>>0,spacing=TILE*4;
 seed=Math.imul(seed^(seed>>>16),0x45d9f3b)>>>0;seed=(seed^(seed>>>16))>>>0;
 let basin={x:(gx+.15+(seed%71)/100)*spacing,y:(gy+.15+((seed>>>8)%71)/100)*spacing,rx:TILE*(.7+(seed%125)/100),ry:TILE*(.45+((seed>>>5)%85)/100),phase:(seed%97)/97,seed};
 basin.outline=Array.from({length:48},(_,i)=>{let a=i/48*Math.PI*2,edge=1+.14*Math.sin(a*3+basin.phase*6.28)+.08*Math.cos(a*5+basin.phase*3);return{x:Math.cos(a)*basin.rx*edge,y:Math.sin(a)*basin.ry*edge}});
 if(wetlandBasinCache.size>=512)wetlandBasinCache.clear();wetlandBasinCache.set(key,basin);return basin;
}
function wetlandBasins(pos){
 let x=Math.floor(pos.x/(TILE*4)),y=Math.floor(pos.y/(TILE*4)),out=[];
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  let basin=wetlandBasin(x+dx,y+dy);
  if(Math.abs(basin.x-pos.x)<=basin.rx*1.25+TILE*.7&&Math.abs(basin.y-pos.y)<=basin.ry*1.25+TILE*.7)out.push(basin);
 }return out;
}
function drawWetlandGround(pos,seconds){
 ctx.save();ctx.beginPath();ctx.rect(-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4);ctx.clip();
 ctx.fillStyle='#352e22a8';ctx.fillRect(-TILE/2-.2,-TILE/2-.2,TILE+.4,TILE+.4);
 for(let basin of wetlandBasins(pos)){
  let x=basin.x-pos.x,y=basin.y-pos.y;
  for(let [scale,color] of [[1,'#514c35'],[.94,'#454c39'],[.87,'#344b42'],[.81,'#203d3d']]){
   ctx.fillStyle=color;ctx.beginPath();
   basin.outline.forEach((point,i)=>{let px=x+point.x*scale,py=y+point.y*scale;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});
   ctx.closePath();ctx.fill();
  }
  // Long, quiet reflections leave red/orange combat warnings clearly distinct.
  ctx.lineWidth=1;ctx.strokeStyle='#83b8ac20';
  for(let i=0;i<3;i++){
   let phase=(seconds*.11+basin.phase+i/3)%1,r=.18+phase*.48;
   ctx.beginPath();ctx.ellipse(x,y,basin.rx*r,basin.ry*r,0,.1,Math.PI*.83);ctx.stroke();
  }
  // Ground-cover tufts on the bank. These do not cover characters or hit indicators.
  ctx.strokeStyle='#777750';ctx.lineWidth=1.5;
  for(let i=0;i<4;i++){
   let a=basin.phase*6.28+i*2.399,bx=x+Math.cos(a)*basin.rx*.96,by=y+Math.sin(a)*basin.ry*.96;
   ctx.beginPath();ctx.moveTo(bx-3,by+3);ctx.lineTo(bx-7,by-6);ctx.moveTo(bx,by+2);ctx.lineTo(bx+2,by-9);ctx.moveTo(bx+2,by+3);ctx.lineTo(bx+7,by-2);ctx.stroke();
  }
 }
 ctx.restore();
}
