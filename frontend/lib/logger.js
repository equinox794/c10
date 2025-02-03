const DEBUG = process.env.NODE_ENV !== 'production';

const logger = {
    info: (...args) => {
        console.log(new Date().toISOString(), '[INFO]', ...args);
    },
    error: (...args) => {
        console.error(new Date().toISOString(), '[ERROR]', ...args);
    },
    debug: (...args) => {
        if (DEBUG) {
            console.debug(new Date().toISOString(), '[DEBUG]', ...args);
        }
    },
    warn: (...args) => {
        console.warn(new Date().toISOString(), '[WARN]', ...args);
    }
};

export default logger;
