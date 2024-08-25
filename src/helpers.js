
function extendMethod(object, methodName, extension) {
    const originalMethod = object[methodName];
    object[methodName] = function(...args) {
        const result = originalMethod.apply(this, args);
        extension.apply(this, args);
        return result;
    };
}

