require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs',
    }
});

var codeEditor;
var fileCounter = 0; // Counter for unique file names

window.editorApp = new Vue({
    el: '#editorApp',
    data: {
        showEditor: false,
        currentFileIndex: 0,
        // AI Chat
        aiInput: '',
        aiMessages: [],
        aiLoading: false,
        showAiPanel: true,
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
                let classNames = [];
                try {
                    classNames = await (fetch('paths.txt').then(r => r.text()));
                    classNames = classNames.replaceAll("\\", "/").replaceAll("\r", "");
                    classNames = classNames.split('\n');
                } catch(e) {
                    console.warn('Could not load paths.txt:', e);
                }
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

                // Editor is hidden by default, user can open it via toggle button

            });
        },
        toggleEditor() {
            this.showEditor = !this.showEditor;
            if (this.showEditor) {
                this.syncModelsToFiles();
                // Resize editor after it becomes visible
                this.$nextTick(() => {
                    if (codeEditor) {
                        codeEditor.layout();
                    }
                });
            }
        },
        // Helper method to get or create a Monaco model for a file
        getOrCreateModel(file) {
            const fileName = file.name || 'script.ts';
            const uri = monaco.Uri.parse(`file:///${fileName}`);
            let model = monaco.editor.getModel(uri);
            if (!model) {
                model = monaco.editor.createModel(
                    "export {};" + replaceImports(file.content || ''),
                    'typescript',
                    uri
                );
            }
            return model;
        },
        syncModelsToFiles() {
            // Sync editor models with current files
            if (!codeEditor || !this.files.length) return;
            
            // Create models for each file if they don't exist
            this.files.forEach(file => this.getOrCreateModel(file));
            
            // Switch to current file
            this.switchFile(this.currentFileIndex);
        },
        // Helper method to get the current editor content without export statement
        getCurrentEditorContent() {
            return codeEditor.getValue().replaceAll("export {}", "");
        },
        switchFile(index) {
            if (!codeEditor || !this.files[index]) return;
            
            // Save current file content before switching
            if (this.files[this.currentFileIndex]) {
                this.files[this.currentFileIndex].content = this.getCurrentEditorContent();
            }
            
            this.currentFileIndex = index;
            const file = this.files[index];
            
            // Get or create model for this file
            const model = this.getOrCreateModel(file);
            codeEditor.setModel(model);
        },
        addNewFile() {
            fileCounter++;
            const newFileName = `script${fileCounter}.ts`;
            const newFile = new VariantFile(newFileName, '// New TypeScript script file\n');
            this.files.push(newFile);
            this.syncModelsToFiles();
            this.switchFile(this.files.length - 1);
        },
        removeFile(index) {
            if (this.files.length <= 1) return; // Keep at least one file
            
            const file = this.files[index];
            const fileName = file.name || 'script.ts';
            const uri = monaco.Uri.parse(`file:///${fileName}`);
            const model = monaco.editor.getModel(uri);
            if (model) {
                model.dispose();
            }
            
            this.files.splice(index, 1);
            
            // Adjust current file index if needed
            if (this.currentFileIndex >= this.files.length) {
                this.currentFileIndex = this.files.length - 1;
            }
            
            // Switch to a valid file
            this.switchFile(this.currentFileIndex);
        },
        runCode() {
            // Save current file content
            if (this.files[this.currentFileIndex]) {
                this.files[this.currentFileIndex].content = this.getCurrentEditorContent();
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
        },
        toggleAiPanel() {
            this.showAiPanel = !this.showAiPanel;
            // Resize editor when AI panel is toggled
            this.$nextTick(() => {
                const editorEl = document.getElementById('editorElement');
                if (editorEl) {
                    editorEl.style.width = this.showAiPanel ? 'calc(100% - 350px)' : 'calc(100% - 40px)';
                }
                if (codeEditor) {
                    codeEditor.layout();
                }
            });
        },
        async sendAiMessage() {
            if (!this.aiInput.trim() || this.aiLoading) return;
            
            const userMessage = this.aiInput.trim();
            this.aiMessages.push({ role: 'user', content: userMessage });
            this.aiInput = '';
            this.aiLoading = true;
            
            try {
                const currentCode = codeEditor ? codeEditor.getValue() : '';
                const fileName = this.files[this.currentFileIndex]?.name || 'script.ts';
                
                const systemPrompt = `You are a helpful coding assistant integrated into a TypeScript code editor. 
The user is editing a file called "${fileName}" in a 3D game engine (Sketchbook) using Three.js and Cannon.js.
Current code in the editor:
\`\`\`typescript
${currentCode}
\`\`\`

Help the user with their request. If they ask you to modify the code, provide the complete updated code wrapped in \`\`\`typescript code blocks.
Be concise and helpful.`;

                const messages = [
                    { role: 'system', content: systemPrompt },
                    ...this.aiMessages.map(m => ({ role: m.role, content: m.content }))
                ];
                
                let fullResponse = '';
                for await (const chunk of getChatGPTResponse({ messages, model: settings.model || 'grok-code' })) {
                    if (chunk.message?.content) {
                        fullResponse = chunk.message.content;
                    }
                }
                
                this.aiMessages.push({ role: 'assistant', content: fullResponse });
                
                // Extract code from response and apply it
                const codeMatch = fullResponse.match(/```(?:typescript|ts|javascript|js)?\s*([\s\S]*?)```/);
                if (codeMatch && codeMatch[1]) {
                    const newCode = codeMatch[1].trim();
                    if (confirm('AI suggested code changes. Apply them?')) {
                        codeEditor.setValue(newCode);
                    }
                }
            } catch (error) {
                this.aiMessages.push({ role: 'assistant', content: `Error: ${error.message}` });
            } finally {
                this.aiLoading = false;
            }
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
