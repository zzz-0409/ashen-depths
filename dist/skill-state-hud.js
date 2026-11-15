// Transient status belongs to the equipped skill, not a permanent text panel.
function controlSkillStatus(s){
 let value=0,label='',waiting=false;
 if(s.mode===56){label=s.departed?'門へ戻る':'門から離れる';value=1-s.time/6;}
 if(s.mode===57){label='誘導 '+Math.max(0,3-s.time).toFixed(1)+'秒';value=1-s.time/3;}
 if(s.mode===58){label='詠唱 '+s.ticks+'/3';value=s.time/2.25;}
 if(s.mode===59){waiting=dist(p,s)>125||!lineClear(p,s);label=waiting?'近づいて護送':'護送中';value=s.travelled/Math.max(1,dist(s.origin,s.destination));}
 if(s.mode===60){label=s.travelled<60?'移動で蓄積':s.still>.1?'停止で放電':'蓄積 '+Math.floor(s.travelled/6)+'%';value=s.still>.1&&s.travelled>=60?s.still/.6:s.travelled/600;}
 if(s.mode===61){label='照準 '+Math.floor(s.lockTime/1.25*100)+'%';value=s.lockTime/1.25;waiting=!s.lockPoint;}
 if(s.mode===62){label=s.replaying?'残像が逆走':'経路を記録';value=s.replaying?1-(s.pathIndex+1)/Math.max(1,s.path.length-1):s.time/2;}
 if(s.mode===63){if(s.activated)return null;label='連携 '+s.verses.size+'/3';value=s.verses.size/3;}
 if(s.mode===64){label='転位まで '+Math.max(0,.8-s.time).toFixed(1)+'秒';value=s.time/.8;}
 if(s.mode===65){label='反対側へ回る';value=1-s.time/5;waiting=true;}
 if(s.mode===66){label='分配 '+s.targets.filter(e=>e.hp>0&&dist(e,s)<=180*s.build.radius&&lineClear(s,e)).length+'体';value=s.time/.9;}
 if(s.mode===67){let left=s.guards.filter(e=>e.hp>0).length;label=left?'護衛 残り'+left+'体':s.guards.length?'本命へ射線を通す':'単体攻撃を準備';value=1-s.time/6;waiting=left>0;}
 if(s.mode===68){label=s.lantern?'生命灯を拾う':'標的を倒す';value=s.lantern?(s.expires-s.time)/6:1-s.time/4;waiting=true;}
 return label?{label,value:Math.max(0,Math.min(1,Number.isFinite(value)?value:0)),waiting}:null;
}
function skillStateFor(type){
 if(!started||!p||paused||dead||!type)return null;
 for(let i=signatureSpells.length-1;i>=0;i--)if(signatureSpells[i].build.type===type)return controlSkillStatus(signatureSpells[i]);
 return null;
}
function updateSkillStateHud(){
 let buttons=document.querySelectorAll('.actions button');
 for(let i=0;i<6;i++){
  let button=i<2?buttons[i+1]:buttons[i+3];if(!button)continue;
  let status=skillStateFor(p?.bindings?.[i]),badge=button.querySelector('.skill-state');
  button.classList.toggle('skill-sealed',!!status?.locked);
  if(!status){if(badge&&!badge.hidden)badge.hidden=true;continue;}
  if(!badge){badge=document.createElement('span');badge.className='skill-state';badge.setAttribute('aria-hidden','true');button.append(badge);}
  if(badge.hidden)badge.hidden=false;if(badge.textContent!==status.label)hudText(badge,status.label);
  badge.style.setProperty('--skill-progress',String(status.value));badge.classList.toggle('waiting',status.waiting);
  hudTitle(button,hudTitleValue(button)+' · '+status.label);
 }
}
const stateSkillHudBase=drawHud;drawHud=()=>{stateSkillHudBase();updateSkillStateHud();};
