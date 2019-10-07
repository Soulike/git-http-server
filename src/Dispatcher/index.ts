import router from './Router';
import compose from 'koa-compose';
import errorProcessor from './Middleware/ErrorProcessor';

export default () =>
{
    return compose([
        errorProcessor(),
        router.routes(),
        router.allowedMethods(),
    ]);
};