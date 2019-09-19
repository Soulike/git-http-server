import {router} from './Router';
import Koa from 'koa';
import {SERVER} from '../CONFIG';
import {Response} from '../Class';

export const dispatcher = (app: Koa): Koa.Middleware =>
{
    app
        .use(router.routes())
        .use(router.allowedMethods());

    return async (ctx, next) =>
    {
        try
        {
            await next();
        }
        catch (e)
        {
            ctx.response.body = new Response(500);
            SERVER.ERROR_LOGGER(e);
        }
    };
};