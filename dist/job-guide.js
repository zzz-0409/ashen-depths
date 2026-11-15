let jobGuideView=null;
const JOB_GUIDE_TOPICS=[['basic','基本'],['action','専用操作'],['advanced','上位連携'],['ultimate','必殺技'],['resources','SP・ゲージ']];
const ADVANCED_JOB_STEPS=[
 ['通常攻撃を3回当て、連撃解放。','残像から60～450移動する。','3秒以内に専用操作で残像斬り。'],
 ['堅守で敵の攻撃を防ぐ。','専用操作で反撃し、結界を残す。','結界を盾にして敵弾を防ぐ。近接・地面攻撃には回避。'],
 ['魔力を3つためて解放。','強化スキルを別々の敵へ当て、星印を配置。','6秒以内に専用操作で一斉起爆。'],
 ['狙う敵に標識を付ける。','1.25秒静止して「照準完了」を待つ。','標的への通常攻撃で、一度だけ貫通追撃。'],
 ['受け流しを成功させる。','5秒以内の通常攻撃で舞印を付ける。','さらに5秒以内に90度以上回り込み、通常攻撃で終舞。'],
 ['祈りの円でHP・マナを実際に回復。','回復を続けるか、攻撃に転じるか選ぶ。','円内で専用操作を再入力し、祈りを光波へ転換。'],
 ['3体を呼び、専用操作で集合。','3体が近くに1秒そろい「連携準備完了」。','専用操作で進撃。各個体の次の攻撃が一度だけ強化。'],
 ['村で竜と契約し、野外へ出発。','専用操作で6秒騎乗。移動と通常攻撃でブレスを操作。','再入力で下馬。時間切れでも通常の同行状態へ戻る。']
];
function jobGuideControl(kind){let id=padProfile.buttons[kind];return kind==='jobAction'?'C / '+(id===10?'左スティック押し込み':'Button '+id):'V / '+(id===11?'右スティック押し込み':'Button '+id);}
function jobGuideSelection(compare,topic,selected){return {compare:!!compare,topic:JOB_GUIDE_TOPICS.some(t=>t[0]===topic)?topic:'action',selected:Number.isInteger(selected)&&selected>=0&&selected<16?selected:currentJob()};}
function jobGuideContent(topic,selected){let id=selected%8,base=PROFESSIONS[id],upper=selected>=8,own=selected===currentJob();
 if(topic==='basic')return '<h3>この職業の戦い方</h3><p>'+base.trait+'</p>'+(upper?'<p class="muted">上位職の連携は「上位連携」で確認できます。</p>':'<p class="muted">ランク5で転職、ランク8で上位職が解放されます。</p>');
 if(topic==='action')return '<div class="job-guide-key">'+jobGuideControl('jobAction')+'</div><h3>'+(selected===15?'竜騎乗':JOB_ACTIONS[id][0])+'</h3><p>'+(selected===15?DRAGON_RIDE_DESC:JOB_ACTIONS[id][1])+'</p>'+(upper?'<p>この職業では「上位連携」も使用できます。</p>':'')+(own&&villageOpen?'<button onclick="startJobPractice()">基本操作を村で練習</button>':own?'<p class="muted">基本操作の練習は村で開始できます。</p>':'');
 if(topic==='advanced')return '<h3>'+ADVANCED_JOBS[id][0]+'の連携</h3>'+(!upper?'<p class="muted">上位職の予習 · 使用にはランク8と転職が必要です。</p>':'')+'<ol class="job-guide-steps">'+ADVANCED_JOB_STEPS[id].map(t=>'<li>'+t+'</li>').join('')+'</ol><details><summary>数値・条件を詳しく見る</summary><p>'+ADVANCED_JOBS[id][1]+'</p></details>';
 if(topic==='ultimate')return '<div class="job-guide-key">'+jobGuideControl('ultimate')+'</div><h3>'+base.ultimate+'</h3><p>'+base.desc+(upper?' 上位職は必殺技の威力20%増。':'')+(selected===15?' 竜を呼び直すため、騎乗は終了します。':'')+'</p><p class="muted">ゲージ100で発動。画面下の必殺ゲージからも使えます。</p>';
 let rate=own?ultimateChargeRate():1;return '<h3>'+ (own?'現在の装備・星座を含む数値':'職業の基礎値')+'</h3><dl class="profession-resource-grid">'+csRow('最大SP',own?maxsp():base.sp)+csRow('通常攻撃 / 回避',csNumber(own?staminaCost(0):8)+' / '+csNumber(own?staminaCost(3):24)+' SP')+csRow('SP自然回復',csNumber(own?staminaRegen():base.regen)+' /秒')+csRow('通常攻撃の命中',csNumber(7*rate)+' ゲージ / 最大 '+csNumber(10*rate))+csRow('スキルの命中',csNumber(2*rate)+' ゲージ / 0.5秒で最大 '+csNumber(4*rate))+'</dl><p class="muted">SPは消費後0.6秒から回復。被ダメージでも必殺ゲージが増えます。召喚・指示は通常攻撃の直接命中と異なり、騎乗ブレスは一発動の命中につき一度だけゲージを獲得します。</p>';
}
professionGuideHtml=(compare=false,topic='action',selected=currentJob())=>{let state=jobGuideSelection(compare,topic,selected);({compare,topic,selected}=state);let id=selected%8,name=selected>=8?ADVANCED_JOBS[id][0]:PROFESSIONS[id].name;
 return '<div class="job-guide"><div class="job-guide-heading"><h3>'+jobEmblem(selected)+name+'</h3><span>'+(selected===currentJob()?'現在の職業':selected>=8?'上位職 · ランク8':'基本職 · 転職はランク5')+'</span></div>'+(compare?'<div class="job-guide-picker">'+Array.from({length:16},(_,i)=>'<button data-guide-job="'+i+'" aria-pressed="'+(i===selected)+'" onclick="showProfessionGuide(true,\''+topic+'\','+i+',\'job\')">'+jobEmblem(i)+'<span>'+(i>=8?ADVANCED_JOBS[i%8][0]:PROFESSIONS[i].name)+'</span></button>').join('')+'</div>':'')+'<nav class="job-guide-tabs" aria-label="職業説明の項目">'+JOB_GUIDE_TOPICS.map(([key,label])=>'<button data-guide-topic="'+key+'" aria-pressed="'+(key===topic)+'" onclick="showProfessionGuide('+compare+',\''+key+'\','+selected+')">'+label+'</button>').join('')+'</nav><section class="job-guide-content">'+jobGuideContent(topic,selected)+'</section><div class="job-guide-footer">'+(compare?'<button onclick="showProfessionGuide(false,\''+topic+'\')">自分の職業へ戻る</button>':'<button onclick="showProfessionGuide(true,\''+topic+'\')">ほかの職業を見る</button>')+(jobPractice?'<button onclick="stopJobPractice();showProfessionGuide()">練習を終える</button>':'')+'<button onclick="panel(\'inventory\')">装備へ戻る</button></div></div>';
};
showProfessionGuide=(compare=false,topic='action',selected=currentJob(),focus='topic')=>{let s=jobGuideSelection(compare,topic,selected);jobGuideView=s;worldMenu('職業ガイド · '+(s.selected>=8?ADVANCED_JOBS[s.selected%8][0]:PROFESSIONS[s.selected].name),professionGuideHtml(s.compare,s.topic,s.selected),'profession');menuFocusElement($('card').querySelector(focus==='job'?'[data-guide-job="'+s.selected+'"]':'[data-guide-topic="'+s.topic+'"]'));};

const guideCloseBase=closePanel;closePanel=(...args)=>{if(menuSurface==='profession'){if(jobGuideView?.compare){showProfessionGuide(false,jobGuideView.topic);return;}panel('inventory');return;}return guideCloseBase(...args);};
