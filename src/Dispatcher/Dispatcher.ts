import Router from '@koa/router';

export const dispatcher = (router: Router) =>
{
    router.get('/', async () => null);
};