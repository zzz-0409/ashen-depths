// Bound canvas work to 1080p worth of pixels, including large 4K windows.
// DOM text, CSS dimensions and input coordinates stay at native resolution.
function renderPixelRatio(){let light=typeof effectQuality!=='undefined'&&effectQuality==='low',native=Math.min(light?1:1.25,Math.max(1,Number(devicePixelRatio)||1));let pixels=Math.max(1,Number(innerWidth)||1)*Math.max(1,Number(innerHeight)||1);return Math.min(native,Math.sqrt((light?1280*720:1920*1080)/pixels));}
resize=()=>{W=innerWidth;H=innerHeight;let ratio=renderPixelRatio();canvas.width=Math.round(W*ratio);canvas.height=Math.round(H*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);};
resize();
// Throttle the complete HUD chain, including additions loaded after population-runtime.js.
let finalHudOwner=null,finalHudAt=-Infinity,finalHudSurface='',finalHudPaused=null;
const finalHudRender=drawHud;const finalHudBase=()=>typeof batchHudWrites==='function'?batchHudWrites(finalHudRender):finalHudRender();drawHud=()=>{let now=performance.now(),surface=typeof menuSurface==='string'?menuSurface:'';let changed=finalHudOwner!==p||finalHudSurface!==surface||finalHudPaused!==paused;if(!changed&&now-finalHudAt<100)return;finalHudOwner=p;finalHudSurface=surface;finalHudPaused=paused;finalHudAt=now;if(typeof populationHudTime!=='undefined')populationHudTime=-Infinity;return finalHudBase();};
const visibleDrawBase=draw;draw=()=>{if(document.hidden)return;return visibleDrawBase();};
