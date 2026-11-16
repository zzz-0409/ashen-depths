const POTION_PAD_LAYOUT={inventory:3,flask:2,skill1:4,skill2:5,skill3:3,skill4:2,potion2:5,potion3:4};
Object.assign(PAD_DEFAULT,POTION_PAD_LAYOUT);Object.assign(PAD_NAMES,{flask:'ポーション1（Y）',skill3:'追加スキル3（ZL＋X）',skill4:'追加スキル4（ZL＋Y）',potion2:'ポーション2（ZL＋R）',potion3:'ポーション3（ZL＋L）'});
function migratePotionPad(profile){if(profile.potionLayoutVersion===1)return;profile.buttons={...profile.buttons,...POTION_PAD_LAYOUT};profile.potionLayoutVersion=1;}
migratePotionPad(padProfile);for(const profile of Object.values(padProfiles))migratePotionPad(profile);try{localStorage.setItem('ashen-pads-v1',JSON.stringify(padProfiles));}catch{}
const potionConnectBase=connectPad;connectPad=g=>{potionConnectBase(g);padProfile.potionLayoutVersion=padProfiles[g.id]?.potionLayoutVersion||0;migratePotionPad(padProfile);persistPad();};
const potionPadMenuBase=padMenu;padMenu=(g,l,r,dt)=>{if(started&&!dead&&padEdge(g,'inventory')){if(menuSelectDialog)closeMenuSelect();padSettingsOpen=false;padBinding=null;saveMenuOpen=false;savePending=null;closePanel();return;}return potionPadMenuBase(g,l,r,dt);};
const potionTutorialButton=tutorialButton;tutorialButton=action=>{const names={inventory:'X',flask:'Y',skill1:'L',skill2:'R',skill3:'X',skill4:'Y'};return names[action]&&padProfile.buttons[action]===PAD_DEFAULT[action]?names[action]:potionTutorialButton(action);};
skillPadLabel=i=>i<2?tutorialButton(['skill1','skill2'][i]):'ZL＋'+tutorialButton(['skill3','skill4','accept','back'][i-2]);
const potionPracticeHint=practiceHint;practiceHint=()=>{const h=potionPracticeHint();if(['inventory','equip','socket'].includes(practiceLesson())&&!paused)return ['X','装備メニューを開く'];return h;};

const potionMenuHintBase=menuHintText;menuHintText=()=>potionMenuHintBase()+' · X：全閉じ';
