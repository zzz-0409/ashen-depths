// Loaded after every HUD decorator so potion, guide and touch labels share one batch.
let finalHudOwner=null,finalHudAt=-Infinity,finalHudSurface='',finalHudPaused=null;
const finalHudRender=drawHud;const finalHudBase=()=>typeof batchHudWrites==='function'?batchHudWrites(finalHudRender):finalHudRender();drawHud=()=>{let now=performance.now(),surface=typeof menuSurface==='string'?menuSurface:'';let changed=finalHudOwner!==p||finalHudSurface!==surface||finalHudPaused!==paused;if(!changed&&now-finalHudAt<100)return;finalHudOwner=p;finalHudSurface=surface;finalHudPaused=paused;finalHudAt=now;if(typeof populationHudTime!=='undefined')populationHudTime=-Infinity;return finalHudBase();};

// Canvas overlays must redraw with the canvas, independently of throttled DOM HUD writes.
const bossOverlayFrame=draw;draw=()=>{const result=bossOverlayFrame();if(!document.hidden&&typeof drawBossHud==='function')drawBossHud();return result;};
