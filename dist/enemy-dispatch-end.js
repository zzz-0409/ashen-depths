// Later common wrappers (e.g. foreshadow) still wrap these public entry points.
animateEnemy=(e,dt)=>(directEnemyGroup.animate.get(e.species)||directEnemyGroup.animateBase)(e,dt);
drawRegionEnemy=(e,size)=>(directEnemyGroup.draw.get(e.species)||directEnemyGroup.drawBase)(e,size);
const groupedEnemyGroundBase=drawGroundEffects;drawGroundEffects=()=>withEnemyRenderGroups(groupedEnemyGroundBase);
const groupedEnemyEffectsBase=drawEffects;drawEffects=()=>withEnemyRenderGroups(groupedEnemyEffectsBase);
