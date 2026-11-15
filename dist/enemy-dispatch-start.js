// Capture after shared awareness/death hooks and before this contiguous species group.
const directEnemyGroup={animateBase:animateEnemy,drawBase:drawRegionEnemy,animate:new Map(),draw:new Map()};
function registerDirectEnemy(species,animate,draw){if(directEnemyGroup.animate.has(species))throw Error('Duplicate enemy dispatch: '+species);directEnemyGroup.animate.set(species,animate);directEnemyGroup.draw.set(species,draw);}
// These buckets live only for one rendering call; never retain actors across frames/worlds.
let activeEnemyRenderGroups=null,activeEnemyRenderSource=null;
const emptyEnemyRenderList=Object.freeze([]),emptyEnemyRenderGroups=new Map();
function enemyRenderList(species){return activeEnemyRenderGroups?(activeEnemyRenderGroups.get(species)||emptyEnemyRenderList):enemies;}
function withEnemyRenderGroups(draw){if(activeEnemyRenderGroups&&activeEnemyRenderSource===enemies)return draw();let previous=activeEnemyRenderGroups,previousSource=activeEnemyRenderSource,groups=emptyEnemyRenderGroups;if(enemies.length){groups=new Map();for(let e of enemies){let list=groups.get(e.species);if(list)list.push(e);else groups.set(e.species,[e]);}}activeEnemyRenderGroups=groups;activeEnemyRenderSource=enemies;try{return draw();}finally{activeEnemyRenderGroups=previous;activeEnemyRenderSource=previousSource;}}
