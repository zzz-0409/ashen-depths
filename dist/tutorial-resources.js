// Append before the final page so existing equipment lesson indices stay stable.
LESSONS.splice(10,0,
 ['sp-recovery','SPを使い、回復を待つ','{back}で画面を閉じ、{attack}か{dash}でSPを消費。その後は攻撃・回避を止め、減った分が戻るまで待ちます。','画面を閉じ、Shift＋左クリックかSpace。SPは消費後0.6秒で回復開始。マナとは別の資源です。'],
 ['ultimate-charge','命中させて必殺ゲージを溜める','村の東側のサンドバッグを{attack}で攻撃。DPS測定を始めなくても練習できます。通常攻撃を命中させ、ゲージを100にしましょう。','村の東側のサンドバッグをクリックして攻撃。空振りでは溜まりません。通常攻撃はスキルより溜まりやすく、戦闘中は被ダメージでも増えます。'],
 ['ultimate','職業の必殺技を使う','右スティックで狙い、{ultimate}で必殺技。発動するとゲージを消費します。職業ごとに技と特性が違います。','マウスで狙ってV、または画面下の必殺ゲージをクリック。剣士は三連斬、守護者は防御結界、術師は連続星落とし。']
);
function migrateResourceLesson(state){if(state&&state.resourceVersion!==1){if(state.step===10)state.step=13;state.resourceVersion=1;}return state;}
const resourceTutorialStateBase=tutorialState;tutorialState=()=>migrateResourceLesson(resourceTutorialStateBase());
const resourceTutorialValidateBase=validateSave;validateSave=data=>{let out=resourceTutorialValidateBase(data);if(out.p.tutorial){out.p.tutorial.resourceVersion=data.p.tutorial.resourceVersion===1?1:0;migrateResourceLesson(out.p.tutorial);}return out;};
const resourceTutorialButtonBase=tutorialButton;tutorialButton=action=>action==='ultimate'?(padProfile.buttons.ultimate===11?'右スティック押し込み':'Button '+padProfile.buttons.ultimate):resourceTutorialButtonBase(action);
let tutorialRecoveryTarget=null,tutorialUltimatePending=false;
function resourceLessonActive(id){let s=tutorialState();return started&&s.active&&!dead&&LESSONS[s.step]?.[0]===id;}
const resourceTutorialCastBase=cast;cast=n=>{let before=p.sp,watch=resourceLessonActive('sp-recovery'),result=resourceTutorialCastBase(n);if(watch&&(n===0||n===3)&&p.sp<before)tutorialRecoveryTarget=Math.min(maxsp(),before);return result;};
const resourceTutorialUltimateBase=activateUltimate;activateUltimate=()=>{let result=resourceTutorialUltimateBase();if(result){if(resourceLessonActive('ultimate-charge'))tutorialEvent('ultimate-charge');if(resourceLessonActive('ultimate'))tutorialUltimatePending=true;}return result;};
const resourceTutorialUpdateBase=update;update=dt=>{
 resourceTutorialUpdateBase(dt);if(!started||paused||dead)return;
 if(tutorialUltimatePending&&!ultimateState){tutorialUltimatePending=false;tutorialEvent('ultimate');}
 if(resourceLessonActive('sp-recovery')){if(tutorialRecoveryTarget!==null&&p.sp>=Math.min(maxsp(),tutorialRecoveryTarget)-.001){tutorialRecoveryTarget=null;tutorialEvent('sp-recovery');}}
 else tutorialRecoveryTarget=null;
 if(resourceLessonActive('ultimate-charge')&&p.ultimate>=100)tutorialEvent('ultimate-charge');
};
const resourceTutorialStartBase=tutorialStart;tutorialStart=()=>{tutorialState();tutorialRecoveryTarget=null;tutorialUltimatePending=false;return resourceTutorialStartBase();};
const resourceTutorialStopBase=tutorialStop;tutorialStop=(...args)=>{tutorialRecoveryTarget=null;tutorialUltimatePending=false;return resourceTutorialStopBase(...args);};
LESSONS[4][2]+=' 攻撃の構えや振り終わりからも回避できます。消費済みSP・マナは戻りません。';
LESSONS[4][3]+=' 攻撃中でも回避で中断できます。SP不足・回避待ち時間中は中断されません。';
// Migrate a character already present while scripts load, before a resume/save.
if(p?.tutorial)migrateResourceLesson(p.tutorial);
