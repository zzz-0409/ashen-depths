// Sprite dimensions depend only on species and these three size flags.
// Keep every original species override, but resolve each combination once.
const uncachedEnemyVisualSize=enemyVisualSize;
const enemyVisualSizeMemo=new Map();
enemyVisualSize=e=>{const species=e.species,variant=(e.exRank===100?1:0)|(e.boss?2:0)|(e.elite?4:0);let sizes=enemyVisualSizeMemo.get(species);if(!sizes){sizes=[];enemyVisualSizeMemo.set(species,sizes);}if(sizes[variant]===undefined)sizes[variant]=uncachedEnemyVisualSize(e);return sizes[variant];};
