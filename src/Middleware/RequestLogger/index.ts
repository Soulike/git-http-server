import Koa from 'koa';
import {SERVER} from '../../CONFIG';

export const requestLogger = (): Koa.Middleware =>
{
    return async (ctx, next) =>
    {
        const {method, path, query, body} = ctx.request;
        SERVER.INFO_LOGGER(`${method} request from ${ctx.request.ip} to ${path} with query ${JSON.stringify(query)} and body ${JSON.stringify(body)}`);
        await next();
        const {status, message, body: resBody} = ctx.response;
        SERVER.INFO_LOGGER(`Response to ${ctx.request.ip} with status ${status} ${message} and body ${JSON.stringify(resBody,
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