import Router from '@koa/router';
import {dispatcher} from './Dispatcher';

const router = new Router();

// 在此注入 router 到各个 dispatcher
dispatcher(router);

export {router};