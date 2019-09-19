import Koa from 'koa';
import path from 'path';
import send from 'koa-send';
import {GIT} from '../CONFIG';
import {HttpError} from 'http-errors';
import {Response} from '../Class';
import fs, {constants, promises as fsPromise} from 'fs';
import {exec} from 'child_process';
import {promisify} from 'util';
import http from 'http';

export async function staticService(ctx: Koa.ParameterizedContext, repoPath: string, file: string): Promise<Response<void>>
{
    const filePath = path.join(repoPath, file);
    try
    {
        await send(ctx, filePath, {
            immutable: true,
            hidden: true,
            root: GIT.ROOT,
        });
        return new Response<void>(200);
    }
    catch (e)
    {
        if (e instanceof HttpError)
        {
            return new Response<void>(e.statusCode, e.headers);
        }
        else
        {
            throw e;
        }
    }
}

export async function infoService(repoPath: string, service: string): Promise<Response<string | void>>
{
    const absoluteRepoPath = path.join(GIT.ROOT, repoPath);
    // 检查文件夹是否可读
    try
    {
        await fsPromise.access(absoluteRepoPath, constants.R_OK);
    }
    catch (e)
    {
        return new Response<string | void>(404);
    }
    const execPromise = promisify(exec);
    const {stdout} = await execPromise(`git ${service} --stateless-rpc --advertise-refs`, {
        cwd: absoluteRepoPath,
    });
    const header = {
        'content-type': `application/x-${service}-advertisement`,
    };
    const serverAdvert = `# service=${service}`;
    const length = serverAdvert.length + 4;
    const body = `${length.toString(16).padStart(4, '0')}${serverAdvert}0000${stdout}`;
    return new Response<string | void>(200, header, body);
}

// 由于需要处理可能的大量输入输出，因此需要直接手动操纵原始 req 对象，用流来实现
export async function commandService(repoPath: string, command: string, req: http.IncomingMessage): Promise<Response<string | void>>
{
    return new Promise<Response<string | void>>((resolve, reject) =>
    {
        const absoluteRepoPath = path.join(GIT.ROOT, repoPath);
        // 检查文件夹是否可读
        fs.access(absoluteRepoPath, constants.R_OK, err =>
        {
            if (err)
            {
                return resolve(new Response<string | void>(404));   // return 是为了让当前 Promise 结束运行
            }
        });

        const child = exec(`git ${command} --stateless-rpc`, {
            cwd: absoluteRepoPath,
        });
        req.pipe(child.stdin!); // 把所有请求里的信息都以流的形式传送到 stdin

        // 输出以流的形式读取，并存储为字符串
        let out = '';
        child.stdout!.on('data', chunk =>
        {
            out += chunk;
        });

        child.stdout!.on('end', () =>
        {
            if (command === 'receive-pack')
            {
                exec(`git --git-dir ${absoluteRepoPath} update-server-info`);
            }

            return resolve(
                new Response<string | void>(200,
                    {
                        'content-type': `application/x-git-${command}-result`,
                    }, out),
            );
        });

        child.stdout!.on('error', err =>
        {
            return reject(err);
        });
    });
}