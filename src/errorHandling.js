async function EvalWithDebug(...content) {
    try {
        Reset();
        await new Promise(resolve => setTimeout(resolve, 0));
        await Eval(content.join('\n'));
        if (chat.variant.lastError)
            throw chat.variant.lastError;
    } catch (e) {        
        console.error(e);        
        return {error: e};
    }
    return {};
}

let lastEvalCode = '';
async function Eval(content) 
{   
    chat.variant.lastError = '';
    
    var removedPlayer = content.includes("let playerModel = globalThis.playerModel = await loader.loadAsync('build/assets/boxman.glb')");

    var code = "(async () => {\n" + content
        .replace(/^.*(?:new World\(|world\.initialize).*$\n?/gm, '')
        .replace(/\b(let|const)\s+(\w+)\s*=/g, 'var $2 = globalThis.$2 =')        
        + "\n})();"
        //+ ";debugger;"
        
    if(removedPlayer)
        code = code.replace(/^.*(?:let playerModel = globalThis\.playerModel = await loader\.loadAsync\('build\/assets\/boxman\.glb'\);|var player = globalThis\.player = new Character\(playerModel\);|world\.add\(player\);).*$\n?/gm, '')
//    else
  //      world.remove(player);

    
    if (code != chat.variant.files[0].content)
        console.log(code);
    if(content.includes("world.update = "))
        throw new Error("direct assign world.update = function(){} is not allowed, use extendMethod");
    lastEvalCode = code;
    (0, eval)(code);
    let startTime = Date.now();
    while (!chat.variant.lastError && Date.now() - startTime < 500) {
        await new Promise(requestAnimationFrame);
    }
    console.log(chat.variant.lastError ? "Execution failed" : "Execution success");
    if(chat.variant.lastError) throw chat.variant.lastError;
}

var originalConsoleError = console.error;
console.error = (...args) => {
    if (args[0].message === "The user has exited the lock before this request was completed.")
        return;
    chat.variant.lastError = {
        url: args.map(arg => arg.target?.responseURL).find(a => a),
        message: args.map(arg => {
            return arg.target?.responseURL && `Not Found: ${arg.target.responseURL}. ` 
                || arg.stack && arg.message + " at " + ParseCodeLineFromError(lastEvalCode, arg)
                || arg.message
                || typeof arg === 'object' && JSON.stringify(arg)
                || String(arg);
        }).join(' '),
        toString() {
            return this.message;
        }
    }
    if (chat.currentVariant != 0)
    {
        chat.switchVariant(0, false).then(() => {
            chat.variants[0].lastError = e;
        });
        
    }
    originalConsoleError(...args);
};
function ParseCodeLineFromError(code, error) {
    const lineWithInfo = error.stack.split('\n').find(line => line.includes('at eval'));
    const match = lineWithInfo?.match(/:(\d+):\d+/);
    return match ? code.split('\n')[parseInt(match[1], 10) - 1] : null;
}

window.addEventListener('unhandledrejection', function(event) {
    console.error(event.reason);
    event.preventDefault();
});
window.addEventListener('error', function (event) {
    console.error(event);
});