import Koa from 'koa';
import signale from 'signale';

export const requestLogger = (): Koa.Middleware =>
{
    return async (ctx, next) =>
    {
        const {method, path, query, body} = ctx.request;
        const session = ctx.session;
        signale.info(`${method} request from session ${JSON.stringify(session)} to ${path} with query ${JSON.stringify(query)} and body ${JSON.stringify(body)}`);
        await next();
        const {status, message, body: resBody} = ctx.response;
        signale.info(`Response to session ${JSON.stringify(session)} with status ${status} ${message} and body ${JSON.stringify(resBody,
            ((_key, value) =>
            {
                if (typeof value === 'string' && value.length > 100)
                {
                    return value.slice(0, 101);
                }
                else
                {
                    return value;
                }
            }))}`);
    };
};