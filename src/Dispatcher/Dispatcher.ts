import Router from '@koa/router';
import {COMMAND, REFS, STATIC} from './ROUTE';
import {commandService, infoService, staticService} from '../Service';
import path from 'path';
import {GIT} from '../CONFIG';

export default (router: Router) =>
{
    router.get(REFS, async (ctx) =>
    {
        const {service} = ctx.request.query;
        if (typeof service !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const {repositoryPath} = ctx.params;
            if (typeof repositoryPath !== 'string')
            {
                ctx.response.status = 400;
            }
            else
            {
                const absoluteRepoPath = path.join(GIT.ROOT, repositoryPath);
                const {statusCode, headers, body} = await infoService(absoluteRepoPath, service);
                ctx.response.body = body;
                ctx.response.status = statusCode;
                if (headers !== undefined)
                {
                    ctx.response.set(headers);
                }
            }
        }
    });

    router.post(COMMAND, async (ctx) =>
    {
        const {repositoryPath, command} = ctx.params;
        if (typeof repositoryPath !== 'string' || typeof command !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const absoluteRepoPath = path.join(GIT.ROOT, repositoryPath);
            // 越过 koa 直接操纵请求和响应流
            await commandService(absoluteRepoPath, command, ctx.req, ctx.res);
        }
    });

    router.get(STATIC, async (ctx) =>
    {
        const {repositoryPath} = ctx.params;
        if (typeof repositoryPath !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const absoluteFilePath = path.join(GIT.ROOT, repositoryPath);
            await staticService(absoluteFilePath, ctx.res);
        }
    });
};