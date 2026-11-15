import {partyGateway} from './party-gateway.mjs';
import {connectParty} from './party-host.mjs';
// Instantiate with the existing rankingApi when integrating the staged modules.
// Party routes must run first because rankingApi handles all /api/ paths.
export function createWorker({rankingApi}){
 return {async fetch(request,env){
  const party=await partyGateway(request,env,{connect:metadata=>connectParty(env,metadata)});
  if(party)return party;
  const ranking=await rankingApi(request,env);if(ranking)return ranking;
  if(env.ASSETS)return env.ASSETS.fetch(request);
  return new Response('Game assets are not configured',{status:503});
 }};
}
