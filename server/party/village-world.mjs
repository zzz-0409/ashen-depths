// Ground footprints sit behind the service entrances. The training pavilion is
// open: only its posts block movement, not the floor or the target in front.
export const VILLAGE_OBSTACLES=[
 {x:-65,y:-195,hx:48,hy:48},
 {x:-235,y:15,hx:48,hy:48},
 {x:135,y:-155,r:12},{x:225,y:-155,r:12},
 {x:135,y:-65,r:12},{x:225,y:-65,r:12},
 {x:-290,y:-130,r:23},{x:-270,y:140,r:22},
 {x:100,y:160,r:9},{x:-120,y:-190,r:9}
];
export function villagePointOpen(x,y,r=13){
 return !VILLAGE_OBSTACLES.some(o=>o.r!==undefined?Math.hypot(x-o.x,y-o.y)<=o.r+r:Math.abs(x-o.x)<=o.hx+r&&Math.abs(y-o.y)<=o.hy+r);
}

export function villageCanOccupy(x,y,r=13){if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(r)||r<0)return false;for(const [dx,dy]of [[-r,-r],[r,-r],[-r,r],[r,r]]){const gx=Math.floor((x+dx)/64+9.5),gy=Math.floor((y+dy)/64+9.5);if(gx<3||gx>18||gy<3||gy>18)return false;}return villagePointOpen(x,y,r);}
