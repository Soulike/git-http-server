import Router from '@koa/router';
import {COMMAND, INFO, STATIC} from './ROUTE';
import {commandService, infoService, staticService} from '../Service';
import {auth} from '../Middleware';

/*注意：默认没有启用 koa-body 进行解析。如果需要解析 body，将 koa-body 作为第二个参数传入即可*/
export const dispatcher = (router: Router) =>
{
    router.get(STATIC, auth(), async (ctx, next) =>
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
                await staticService(repoPath, file, ctx.res);
            }
        }
        finally
        {
            await next();
        }
    });

    router.get(INFO, auth(), async (ctx, next) =>
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
    });

    router.post(COMMAND, auth(), async (ctx, next) =>
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
                // 越过 koa 直接操纵请求和响应流
                await commandService(repoPath, command, ctx.req, ctx.res);
            }
        }
        finally
        {
            await next();
        }
    });
};