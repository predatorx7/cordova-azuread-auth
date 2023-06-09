import queue from 'async/queue';

const _exec = cordova.exec;
const q = queue(({ methodName, args }, cb) => {
    // Delay the resolution and rejection callbacks because
    // the Spotify SDKs do not like being reinvoked from inside
    // of an event handler function.
    _exec(
        val => setTimeout(() => cb(null, val)),
        err => setTimeout(() => cb(err)),
        'AzureADAuth',
        methodName,
        args || []
    )
});

/**
 * Cordova's exec with Promise and error handling support.
 * 
 * @param methodName the native method to execute
 * @param args method arguments
 * @hidden
 */
export default function<T>(methodName: string, args: any[] = []) {
    if (!methodName) {
        throw new Error("Missing method or class name argument (1st).");
    }

    return new Promise((res, rej) => q.push(
        { methodName, args }, 
        (err, val) => err ? rej(err) : res(val)
    ))
        .catch(({ type, msg }) => {
            const e = new Error(msg);
            e.name = type;
            return Promise.reject(e);
        });
}
