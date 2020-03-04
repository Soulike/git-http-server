import {exec, ExecOptions} from 'child_process';
import {EventEmitter} from 'events';

export async function execPromise(command: string, options?: ExecOptions): Promise<string>
{
    return new Promise<string>((resolve, reject) =>
    {
        exec(command, {...options, encoding: 'utf-8'}, (error, stdout) =>
        {
            if (error)
            {
                return reject(error);
            }
            return resolve(stdout);
        });
    });
}

export async function waitForEvent(eventEmitter: EventEmitter, event: string | symbol): Promise<any[]>
{
    return new Promise((resolve, reject) =>
    {
        eventEmitter.on(event, (...param) =>
        {
            resolve(param);
        });

        eventEmitter.on('error', e =>
        {
            reject(e);
        });
    });
}