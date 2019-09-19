import signale from 'signale';

export const SERVER = {
    PORT: 4005,
    INFO_LOGGER: signale.info,
    WARNING_LOGGER: signale.warn,
    ERROR_LOGGER: signale.error,
};
