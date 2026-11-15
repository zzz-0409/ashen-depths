import {SERVER_RELEASE} from '../game-release.mjs';
import {DurableObject} from 'cloudflare:workers';
import {partyObjectClass} from './party-host.mjs';
const BasePartyRoom=partyObjectClass(DurableObject,{
 now:()=>Date.now(),
 pair:()=>Object.values(new WebSocketPair()),
 start:(fn,ms)=>setInterval(fn,ms),
 stop:timer=>clearInterval(timer),
 upgrade:client=>new Response(null,{status:101,webSocket:client})
});

export class PartyRoomObject extends BasePartyRoom {constructor(ctx,env){super(ctx,{...env,GAME_REVISION:SERVER_RELEASE});}}
