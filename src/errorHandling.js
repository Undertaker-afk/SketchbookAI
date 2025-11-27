

let lastEvalCode = '';
async function Eval(content) 
{   
    
    if(!content?.trim())
    {
        throw "empty code";
    }
    chat.variant.lastError = '';
    if(codeEditor)
        SetCode(content);
    content = replaceImports(content); 

    let compiledCode = compileTypeScript("var Math = new SeededRandom();"+content+(settings.enableBreakpoints ? "\n;debugger;" : ";console.log('executed');"));


    var code = compiledCode
        .replace(/^.*(?:new World\().*$\n?/gm, '\n')
        .replace(/^.*(?:world\.initialize).*$\n?/gm, '\n')
        .replace(/world\.render\(world\);/g, '\n')
        .replace(/\b(let|const)\s+(\w+)\s*=/g, 'let $2 = globalThis.$2 =')       

      
        
            
    
    //if (chat.currentVariant!=0)
      //  console.log(content);
    if(content.includes("world.update = "))
        throw "direct assign world.update = function(){} is not allowed, use addMethodListener";
    lastEvalCode = code;
    try
    {
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = code;
        document.body.appendChild(script);
        //(0, eval)(code);    
    }
    catch(e)
    {
        console.error(e);
    }
}

var originalConsoleError = console.error;
console.error = (...args) => {
    // Ignore pointer lock errors
    if (args[0].message === "The user has exited the lock before this request was completed." || 
        args[0].message === "If you see this error we have a bug. Please report this bug to chromium.")
        return;
    // Ignore physics engine errors
    if(args[0]?.message?.includes("Cannot read properties of undefined (reading '_wakeUpAfterNarrowphase')"))
        return;
    // Ignore webpack-dev-server errors
    if (args[0]?.message?.includes('webpack-dev-server') || 
        args[0]?.type === 'error' && args[0]?.target?.constructor?.name === 'WebSocket' ||
        (typeof args[0] === 'object' && args[0]?.isTrusted === true && !args[0]?.message)) {
        originalConsoleError('[Webpack] Connection issue - ignoring');
        return;
    }

    if (globalThis.chat) {
     //   if (settings?.enableBreakpoints)
         //   debugger;
     if(chat.variant)
        chat.variant.lastError = {
            args: args,
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
        ResetState();
        /*
        if (chat.currentVariant != 0) {
            chat.switchVariant(0).then(() => {
                chat.lastError = error;
            });

        }
        */
    }
    originalConsoleError(...args);
    
};
function ParseCodeLineFromError(code, error) {
    const lineWithInfo = error.stack.split('\n').find(line => line.includes('at eval'));
    const match = lineWithInfo?.match(/:(\d+):\d+/);
    return match ? code.split('\n')[parseInt(match[1], 10) - 1] : null;
}

window.addEventListener('unhandledrejection', function(event) {
    // Ignore webpack-related rejections
    if (event.reason?.message?.includes('webpack') || 
        event.reason?.target?.constructor?.name === 'WebSocket') {
        event.preventDefault();
        return;
    }
    console.error(event.reason);
    event.preventDefault();
});
window.addEventListener('error', function (event) {
    // Ignore webpack-dev-server errors
    if (event.message?.includes('webpack-dev-server') ||
        event.target?.constructor?.name === 'WebSocket' ||
        (event.isTrusted && !event.message && event.type === 'error')) {
        event.preventDefault();
        return;
    }
    console.error(event);
});

