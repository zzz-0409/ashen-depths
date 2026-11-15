import {rankingApi} from './ranking.mjs';
import {createWorker} from './party/worker-router.mjs';
import {SERVER_RELEASE} from './game-release.mjs';
export {PartyRoomObject} from './party/party-object.mjs';
const worker=createWorker({rankingApi});
export default {fetch(request,env){return worker.fetch(request,{...env,GAME_REVISION:SERVER_RELEASE});}};
