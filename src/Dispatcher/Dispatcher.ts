import Router from '@koa/router';
import {commandMiddleware, infoMiddleware, staticMiddleware} from './Middleware';
import {COMMAND, INFO, STATIC} from './ROUTE';

/*注意：默认没有启用 koa-body 进行解析。如果需要解析 body，将 koa-body 作为第二个参数传入即可*/
export const dispatcher = (router: Router) =>
{
    router.get(STATIC, staticMiddleware);
    router.head(STATIC, staticMiddleware);

    router.get(INFO, infoMiddleware);

    router.post(COMMAND, commandMiddleware);
};