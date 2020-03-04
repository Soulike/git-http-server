/**
 * @description 生成 refs 请求返回的正确格式
 * */
export function generateRefsServiceResponse(service: string, RPCCallOutput: string): string
{
    const serverAdvert = `# service=${service}`;
    const length = serverAdvert.length + 4;
    return `${length.toString(16).padStart(4, '0')}${serverAdvert}0000${RPCCallOutput}`;
}