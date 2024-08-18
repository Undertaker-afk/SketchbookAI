async function parseFilesFromMessage(message) {
    
    
    let files = [];
    let regexHtml = /(?:^|\n)(?:(?:[#*][^\r\n]*?([\w.\-_]+)[^\r\n]*?\n)?\n?```(\w+)\n?(.*?)(?:\n```|$(?!\n)))|(?:<html.*?>.*?(?:<\/html>|$(?!\n)))/gs;
    let match;
    let messageWithoutCodeBlocks = message;
    let correctFormat=false;
    while ((match = regexHtml.exec(message)) !== null) {
        let fileName;
        let content = '';
        if (match[0].startsWith('<html') && !correctFormat) {
            fileName = "index.html";
            content = match[0];
        }
        else if (match[1]) {
            fileName = match[1].trim();
            content = match[3];
            if(!correctFormat)
                files = [];
            correctFormat=true;
        }
        else if(!correctFormat) {
            fileName = match[2] === 'css' ? "styles.css" :
                match[2] === 'javascript' ? "script.js" :
                    match[2] === 'python' ? "script.py" : "index.html";
            content = match[3];
        }
        else 
            continue;
        messageWithoutCodeBlocks = messageWithoutCodeBlocks.replace(match[0],'\n');// "# "+fileName
        if (files.find(a => a.name == fileName)?.content.length > content.length)
            continue;

        files.push({ name: fileName, content,langauge:match[2]||"html" ,hidden:false});



    }

    return { messageWithoutCodeBlocks, files };
}