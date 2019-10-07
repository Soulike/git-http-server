import Router from '@koa/router';
import {COMMAND, INFO, STATIC} from './ROUTE';
import {commandService, infoService, staticService} from '../Service';
import path from 'path';
import {GIT} from '../CONFIG';

export default (router: Router) =>
{
    router.get(STATIC, async (ctx, next) =>
    {
        try
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
        }
        finally
        {
            await next();
        }
    });

    router.get(INFO, async (ctx, next) =>
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
        }
        finally
        {
            await next();
        }
    });

    router.post(COMMAND, async (ctx, next) =>
    {
        try
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
        }
        finally
        {
            await next();
        }
    });
};