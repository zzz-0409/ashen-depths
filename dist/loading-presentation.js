// Hide stale canvas frames until the destination has rendered at least once.
let presentationLoadEpoch=0;
function finishLoadingPresentation(){const epoch=++presentationLoadEpoch;requestAnimationFrame(()=>{if(epoch!==presentationLoadEpoch||assetRequest)return;if(started&&typeof draw==='function')draw();requestAnimationFrame(()=>{if(epoch!==presentationLoadEpoch||assetRequest)return;document.documentElement.classList.remove('boot-pending','scene-loading');document.getElementById('bootScreen')?.remove();});});}
const presentationImageLoadBase=withGameImages;withGameImages=(action,back,...args)=>{if(assetRequest)return presentationImageLoadBase(action,back,...args);++presentationLoadEpoch;document.documentElement.classList.add('scene-loading');return presentationImageLoadBase(()=>{try{return action();}finally{finishLoadingPresentation();}},()=>{try{return back();}finally{finishLoadingPresentation();}},...args);};
// Keep the old vector only as an error fallback, never as a loading frame.
const artLoadingStyle=document.createElement('style');artLoadingStyle.textContent=Object.keys(GENERATED_ART).map(key=>'body.art-'+key+'-loading .art-'+key+'>.generated-art-fallback{visibility:hidden!important}body.art-'+key+'-loading .art-'+key+'{background:radial-gradient(circle,#4a5360 0,#172029 60%)}body.art-'+key+'-loading .art-'+key+'::after{content:"…";position:absolute;inset:0;display:grid;place-items:center;color:#d7c6a4;font:24px serif}').join('');document.head.append(artLoadingStyle);
finishLoadingPresentation();

// Loading cancellation takes precedence over title navigation.
const loadingTitlePadBase=padMenu;padMenu=(g,l,r,dt)=>{if(assetRequest&&(padEdge(g,'back')||padEdge(g,'pause'))){cancelGameImages();return;}return loadingTitlePadBase(g,l,r,dt);};
const loadingTitleCloseBase=closePanel;closePanel=(...args)=>{if(assetRequest){cancelGameImages();return;}return loadingTitleCloseBase(...args);};
