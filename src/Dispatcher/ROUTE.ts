export const ADVERTISE = /\/(.+\.git)\/info\/refs/;   // /[repository].git/info/refs
export const RPC = /\/(.+\.git)\/git-([\w\-]+)/;  // /[repository].git/git-[command]
export const FILE = /\/(.+\.git)\/((?:.+)\/?)+/;  // /[repository].git/[filePath]