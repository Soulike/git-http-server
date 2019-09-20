// git 内置的命令
export const STATIC = '/:username/:repo/:file+';
export const INFO = '/:username/:repo/info/refs';
export const COMMAND = '/:username/:repo/git-:command';

// 建库命令
export const CREATE_REPO = '/createRepo';
export const DELETE_REPO = '/deleteRepo';