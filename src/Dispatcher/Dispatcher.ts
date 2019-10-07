import Router from '@koa/router';
import {COMMAND, INFO, STATIC} from './ROUTE';
import {commandService, infoService, staticService} from '../Service';
import path from 'path';
import {GIT} from '../CONFIG';

export default (router: Router) =>
{
    router.get(INFO, async (ctx) =>
    {
        const {service} = ctx.request.query;
        if (typeof service !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const {username, repo} = ctx.params;
            if (typeof username !== 'string' || typeof repo !== 'string')
            {
                ctx.response.status = 400;
            }
            else
            {
                const absoluteRepoPath = path.join(GIT.ROOT, username, repo);
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
        const {username, repo, command} = ctx.params;
        if (typeof username !== 'string' || typeof repo !== 'string' || typeof command !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const absoluteRepoPath = path.join(GIT.ROOT, username, repo);
            // 越过 koa 直接操纵请求和响应流
            await commandService(absoluteRepoPath, command, ctx.req, ctx.res);
        }
    });

    router.get(STATIC, async (ctx) =>
    {
        const {username, repo, file} = ctx.params;
        if (typeof username !== 'string' || typeof repo !== 'string' || typeof file !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const absoluteFilePath = path.join(GIT.ROOT, username, repo, file);
            await staticService(absoluteFilePath, ctx.res);
        }
    });
};