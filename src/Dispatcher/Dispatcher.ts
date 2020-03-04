import Router from '@koa/router';
import {ADVERTISE, FILE, RPC} from './ROUTE';
import path from 'path';
import {GIT} from '../CONFIG';
import * as Service from '../Service';
import {Readable} from 'stream';
import zlib from 'zlib';

export default (router: Router) =>
{
    router.get(ADVERTISE, async ctx =>
    {
        const {service} = ctx.request.query;
        if (typeof service !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const {0: repositoryName} = ctx.params;
            const repositoryPath = path.join(GIT.ROOT, repositoryName);
            const {statusCode, body, headers} = await Service.advertise(repositoryPath, service);
            ctx.response.set(headers);
            ctx.response.body = body;
            ctx.response.status = statusCode;
        }
    });

    router.post(RPC, async ctx =>
    {
        const {0: repositoryName, 1: command} = ctx.params;
        let readableStream: Readable = ctx.req;
        const {'content-encoding': contentEncoding} = ctx.request.headers;
        if (contentEncoding === 'gzip')  // git 在大仓库可能会进行压缩
        {
            const gunzip = zlib.createGunzip();
            readableStream = ctx.req.pipe(gunzip);
        }
        const repositoryPath = path.join(GIT.ROOT, repositoryName);
        const {statusCode, body, headers} = await Service.rpc(repositoryPath, command, readableStream);
        ctx.response.set(headers);
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });

    router.get(FILE, async ctx =>
    {
        const {0: repositoryName, 1: filePath} = ctx.params;
        const repositoryPath = path.join(GIT.ROOT, repositoryName);
        const {statusCode, body, headers} = await Service.file(repositoryPath, filePath);
        ctx.response.set(headers);
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });
}