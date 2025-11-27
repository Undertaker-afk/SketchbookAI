require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs',
    }
});

var codeEditor;

window.editorApp = new Vue({
    el: '#editorApp',
    data: {
        showEditor: true,
        currentFileIndex: 0,
        editorModels: [], // Store Monaco models for each file
    },
    computed: {
        files() {
            return chat?.variant?.files || [];
        }
    },
    mounted() {
        this.initializeEditor();
        // Add event listener for window resize
        window.addEventListener('resize', this.resizeEditor);
    },
    methods: {
        async initializeEditor() {
            await new Promise(resolve => requestAnimationFrame(resolve));
            require(['vs/editor/editor.main'], async  ()=> {
                let classNames = await (fetch('paths.txt').then(r => r.text()));
                classNames = classNames.replaceAll("\\", "/").replaceAll("\r", "");
                classNames = classNames.split('\n');
                classNames.push("src/main/helpers/helpers.js");
                classNames.push("src/utils.js");                    
                const LoadClass = async (className) => {

                    let three = className.includes("node_modules/@types/three/");
                    if (!className.includes("build/types/") && !three && !className.includes("peerjs/dist") && !className.startsWith("src/") &&
                     //!className.includes("tween.d.ts") && 
                     !className.includes("sweetalert2.d.ts")) return;
                    const text = await fetch(className).then(response => response.text()).catch(e => {
                        originalConsoleError("update paths.txt", className, e);                        
                        return "";
                    });
                    
                    let code = text.replace(/export |import .*?;/gs, "");
                    //code = code.replaceAll("interface","class");
                    //let code = text.match(/export (?:declare )?(class [\s\S]*)/)?.[1] || text;
                    // if(className.includes("GLTFLoader"))debugger;
                    if (three && !className.includes("examples"))
                        code = "declare namespace THREE {" + code + "} "

                    if(className.includes("FunctionLibrary"))
                        code = "declare namespace Utils {" + code + "} "

                    await monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file:///${className}`);
                };

                await Promise.all(classNames.map(LoadClass));

                codeEditor = monaco.editor.create(document.getElementById('editorElement'), {
                    language: 'typescript',
                    theme: 'vs-dark',
                    //readOnly: globalThis.isMobile, // Make editor readonly if on mobile
                    // Add the following line to disable the F12 key override
                   // contextmenu: false,
                });
                
                // Add keyboard shortcut for running code (Ctrl+Enter)
                codeEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                    this.runCode();
                });
                

                monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ESNext,
                    module: monaco.languages.typescript.ModuleKind.ESNext,
                    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    allowNonTsExtensions: true,
                });

                // Add Vue component for editor controls important
                this.toggleEditor();

            });
        },
        toggleEditor() {
            this.showEditor = !this.showEditor;
            if (this.showEditor) {
                this.syncModelsToFiles();
            }
        },
        syncModelsToFiles() {
            // Sync editor models with current files
            if (!codeEditor || !this.files.length) return;
            
            // Create or update models for each file
            this.files.forEach((file, index) => {
                const uri = monaco.Uri.parse(`file:///script${index}.ts`);
                let model = monaco.editor.getModel(uri);
                if (!model) {
                    model = monaco.editor.createModel(
                        "export {};" + replaceImports(file.content || ''),
                        'typescript',
                        uri
                    );
                    this.editorModels[index] = model;
                }
            });
            
            // Switch to current file
            this.switchFile(this.currentFileIndex);
        },
        switchFile(index) {
            if (!codeEditor || !this.files[index]) return;
            
            // Save current file content before switching
            if (this.files[this.currentFileIndex]) {
                this.files[this.currentFileIndex].content = codeEditor.getValue().replaceAll("export {}", "");
            }
            
            this.currentFileIndex = index;
            const file = this.files[index];
            
            // Get or create model for this file
            const uri = monaco.Uri.parse(`file:///script${index}.ts`);
            let model = monaco.editor.getModel(uri);
            if (!model) {
                model = monaco.editor.createModel(
                    "export {};" + replaceImports(file.content || ''),
                    'typescript',
                    uri
                );
                this.editorModels[index] = model;
            }
            
            codeEditor.setModel(model);
        },
        addNewFile() {
            const newFileName = `script${this.files.length}.ts`;
            const newFile = new VariantFile(newFileName, '// New script file\n');
            this.files.push(newFile);
            this.syncModelsToFiles();
            this.switchFile(this.files.length - 1);
        },
        removeFile(index) {
            if (this.files.length <= 1) return; // Keep at least one file
            
            // Dispose the model
            const uri = monaco.Uri.parse(`file:///script${index}.ts`);
            const model = monaco.editor.getModel(uri);
            if (model) {
                model.dispose();
            }
            
            this.files.splice(index, 1);
            this.editorModels.splice(index, 1);
            
            // Adjust current file index if needed
            if (this.currentFileIndex >= this.files.length) {
                this.currentFileIndex = this.files.length - 1;
            }
            
            this.syncModelsToFiles();
        },
        runCode() {
            // Save current file content
            if (this.files[this.currentFileIndex]) {
                this.files[this.currentFileIndex].content = codeEditor.getValue().replaceAll("export {}", "");
            }
            
            ResetState();            
            // Run all files, with main file (index 0) being primary
            const allCode = this.files.map(f => replaceImports(f.content)).join('\n\n');
            chat.variant.files = this.files;
            setTimeout(() => Eval(allCode), 100);
            this.toggleEditor();            
        },
        resizeEditor() {
            if (codeEditor && this.showEditor) {
                codeEditor.layout();
            }
        },
        getFileName(file, index) {
            return file.name || `script${index}.ts`;
        }
    }
});

function SetCode(code) {
    codeEditor.setValue("export {};" + replaceImports(code));
}
function replaceImports(code)
{
    return code.replaceAll("export {};","").replace(/import .*?;/gs, "")
}
