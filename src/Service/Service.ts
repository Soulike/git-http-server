import {SERVER} from '../CONFIG';
import {Response} from '../Class';
import fs from 'fs';
import {spawn} from 'child_process';
import http from 'http';
import {waitForEvent} from '../Function';

// 直接操纵 res 流
export async function staticService(absoluteRepoPath: string, res: http.ServerResponse): Promise<void>
{
    return new Promise<void>(resolve =>
    {
        const readStream = fs.createReadStream(absoluteRepoPath);

        readStream.on('error', e =>
        {
            res.statusCode = 404;
            SERVER.WARNING_LOGGER(e);
            return resolve();
        });

        res.statusCode = 200;
        readStream.pipe(res);
        readStream.on('end', () =>
        {
            return resolve();
        });
    });
}

export async function infoService(absoluteRepoPath: string, service: string): Promise<Response<string | void>>
{
    // 检查文件夹是否可读
    try
    {
        await fs.promises.access(absoluteRepoPath, fs.constants.R_OK);
    }
    catch (e)
    {
        return new Response<string | void>(404);
    }

    const childProcess = spawn(`LANG=en_US git ${service.slice(4)} --stateless-rpc --advertise-refs ${absoluteRepoPath}`, {
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
export async function commandService(absoluteRepoPath: string, command: string, req: http.IncomingMessage, res: http.ServerResponse): Promise<void>
{
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

    const childProcess = spawn(`LANG=en_US git ${command} --stateless-rpc ${absoluteRepoPath}`, {
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

export async function createRepoService(absoluteRepoPath: string): Promise<Response<void | string>>
{
    await fs.promises.mkdir(absoluteRepoPath, {recursive: true});
    const folderContent = await fs.promises.readdir(absoluteRepoPath);
    if (folderContent.length !== 0) // 如果文件夹不为空，那么不允许创建
    {
        return new Response<void | string>(403, {}, 'Repository has existed');
    }

    // 调用 git 初始化存储库
    const childProcess = spawn('git init --bare', {
        shell: true,
        cwd: absoluteRepoPath,
    });
    await waitForEvent(childProcess, 'close');  // 等待子进程结束
    return new Response<void>(204);
}

export async function deleteRepoService(absoluteRepoPath: string): Promise<Response<void | string>>
{
    try
    {
        await fs.promises.rmdir(absoluteRepoPath);
        return new Response<void | string>(204);
    }
    catch (e)
    {
        SERVER.WARNING_LOGGER(e);
        return new Response<void | string>(403, {}, 'Deleting repository failed.');
    }
}