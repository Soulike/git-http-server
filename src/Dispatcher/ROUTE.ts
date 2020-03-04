export const ADVERTISE = /\/(.+\.git)\/info\/refs/;   // repositoryName.git/info/refs
export const RPC = /\/(.+\.git)\/git-([\w\-]+)/;  // /repositoryName.git/git-xxx
export const FILE = /\/(.+\.git)\/((?:.+)\/?)+/;  // /repositoryName.git/xxx