import Koa from 'koa';
import path from 'path';
import send from 'koa-send';
import {GIT} from '../CONFIG';
import {HttpError} from 'http-errors';
import {Response} from '../Class';
import fs from 'fs';
import {spawn} from 'child_process';
import http from 'http';
import {waitForEvent} from '../Function';

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
        await fs.promises.access(absoluteRepoPath, fs.constants.R_OK);
    }
    catch (e)
    {
        return new Response<string | void>(404);
    }

    const childProcess = spawn(`git ${service.slice(4)} --stateless-rpc --advertise-refs ${absoluteRepoPath}`, {
        shell: true,
    });

    // 读取子进程输出
    let stdout = '';
    childProcess.stdout.on('data', chunk =>
    {
        stdout += chunk;
    });
    // 等待子进程输出完成再进行下一步操作
    await waitForEvent(childProcess.stdout, 'end');

    const header = {
        'content-type': `application/x-${service}-advertisement`,
    };
    const serverAdvert = `# service=${service}`;
    const length = serverAdvert.length + 4;
    const body = `${length.toString(16).padStart(4, '0')}${serverAdvert}0000${stdout}`;
    return new Response<string | void>(200, header, body);
}

// 由于需要处理可能的大量输入输出，因此需要直接手动操纵原始 req 对象，用流来实现
export async function commandService(repoPath: string, command: string, req: http.IncomingMessage, res: http.ServerResponse): Promise<void>
{
    const absoluteRepoPath = path.join(GIT.ROOT, repoPath);
    // 检查文件夹是否可读
    try
    {
        await fs.promises.access(absoluteRepoPath, fs.constants.R_OK);
    }
    catch (e)
    {
        res.statusCode = 404;   // 不可读就返回 404
        return;
    }

    const childProcess = spawn(`git ${command} --stateless-rpc ${absoluteRepoPath}`, {
        shell: true,
    });
    req.pipe(childProcess.stdin); // 把所有请求里的信息都以流的形式传送到 stdin
    // 这里不需要等待输入流结束，因为输入不完成不可能产生输出

    res.statusCode = 200;
    res.setHeader('content-type', `application/x-git-${command}-result`);
    // 输出以流的形式读取
    childProcess.stdout.pipe(res);
    await waitForEvent(childProcess.stdout, 'end'); // 等待子进程输出结束
    if (command === 'receive-pack')
    {
        spawn(`git --git-dir ${absoluteRepoPath} update-server-info`, {
            shell: true,
        });
    }
}