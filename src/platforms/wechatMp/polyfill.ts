// getRandomValues在不同环境下的实现
async function getRandomValues(length: number) {
    if (length > 65536) {
        throw new Error('Can only request a maximum of 65536 bytes')
    }

    const { randomValues } = await wx.getRandomValues({
        length,
    });
    return new Uint8Array(randomValues);
}

Object.assign(global, {
    Array: Array,
    Date: Date,
    Error: Error,
    Function: Function,
    Math: Math,
    Object: Object,
    RegExp: RegExp,
    String: String,
    TypeError: TypeError,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    getRandomValues,
    process: {},
});
