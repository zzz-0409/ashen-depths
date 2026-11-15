import {rankingApi} from './ranking.mjs';
import {createWorker} from './party/worker-router.mjs';
import {SERVER_RELEASE} from './game-release.mjs';
import {marketApi} from './market.mjs';
export {PartyRoomObject} from './party/party-object.mjs';
const worker=createWorker({rankingApi:async(request,env)=>(await marketApi(request,env))||rankingApi(request,env)});
export default {fetch(request,env){return worker.fetch(request,{...env,GAME_REVISION:SERVER_RELEASE});}};
