import EventEmitter from 'events';

export async function waitForEvent(emitter: EventEmitter, event: string | symbol): Promise<any[]>
{
    return new Promise((resolve, reject) =>
    {
        emitter.on(event, (...args) =>
        {
            resolve(args);
        });

        emitter.on('error', err =>
        {
            reject(err);
        });
    });
}