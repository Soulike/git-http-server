import {commandService, infoService, staticService} from '../Service';
import Koa from 'koa';

export const staticMiddleware: Koa.Middleware = async (ctx, next) =>
{
    try
    {
        const {repoPath, file} = ctx.params;
        if (typeof repoPath !== 'string' || typeof file !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const {statusCode, headers, body} = await staticService(ctx, repoPath, file);
            ctx.response.body = body;
            ctx.response.status = statusCode;
            if (headers !== undefined)
            {
                ctx.response.set(headers);
            }
        }
    }
    finally
    {
        await next();
    }
};

export const infoMiddleware: Koa.Middleware = async (ctx, next) =>
{
    try
    {
        const COMMAND = ['git-upload-pack', 'git-receive-pack'];    // 所有可能的 service 参数
        const {service} = ctx.request.query;
        if (typeof service !== 'string' || !COMMAND.includes(service))
        {
            ctx.response.status = 400;
        }
        else
        {
            const {repoPath} = ctx.params;
            const {statusCode, headers, body} = await infoService(repoPath, service);
            ctx.response.body = body;
            ctx.response.status = statusCode;
            if (headers !== undefined)
            {
                ctx.response.set(headers);
            }
        }
    }
    finally
    {
        await next();
    }
};

export const commandMiddleware: Koa.Middleware = async (ctx, next) =>
{
    try
    {
        const {repoPath, command} = ctx.params;
        if (typeof repoPath !== 'string' || typeof command !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const {statusCode, headers, body} = await commandService(repoPath, command, ctx.req);
            ctx.response.body = body;
            ctx.response.status = statusCode;
            if (headers !== undefined)
            {
                ctx.response.set(headers);
            }
        }
    }
    finally
    {
        await next();
    }
};