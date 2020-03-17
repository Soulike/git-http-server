import fs from 'fs';
import mime from 'mime-types';
import {ServiceResponse} from '../Class';
import path from 'path';
import {Readable} from 'stream';
import {doAdvertiseRPCCall, doRPCCall, doUpdateServerInfo} from '../Git';
import {generateRefsServiceResponse} from '../Function';

export async function file(repositoryPath: string, filePath: string): Promise<ServiceResponse<Readable | string>>
{
    return new Promise(resolve =>
    {
        const absoluteFilePath = path.join(repositoryPath, filePath);
        const readStream = fs.createReadStream(absoluteFilePath);

        readStream.on('error', () =>
        {
            resolve(new ServiceResponse<string>(404, {}, '请求的文件不存在'));
        });

        readStream.on('ready', () =>
        {
            const type = mime.lookup(absoluteFilePath) || 'application/octet-stream';
            resolve(new ServiceResponse<Readable>(200, {
                'Content-Type': mime.contentType(type) || 'application/octet-stream',
            }, readStream));
        });
    });
}

export async function advertise(repositoryPath: string, service: string): Promise<ServiceResponse<string>>
{
    const RPCCallOutput = await doAdvertiseRPCCall(repositoryPath, service);

    return new ServiceResponse(200, {
        'Content-Type': `application/x-${service}-advertisement`,
    }, generateRefsServiceResponse(service, RPCCallOutput));
}

export async function rpc(repositoryPath: string, command: string, parameterStream: Readable): Promise<ServiceResponse<Readable | string>>
{
    const RPCCallOutputStream = await doRPCCall(repositoryPath, command, parameterStream);
    RPCCallOutputStream.on('close', async () =>
    {
        if (command === 'receive-pack')
        {
            await doUpdateServerInfo(repositoryPath);
        }
    });
    return new ServiceResponse<Readable>(200, {
        'Content-Type': `application/x-git-${command}-result`,
    }, RPCCallOutputStream);
}