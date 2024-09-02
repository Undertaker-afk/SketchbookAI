
// Extend CANNON.Body to include default material
CANNON.Body = (function(Body) {
    function ExtendedBody(options) {
        // Call the original constructor
        Body.call(this, options);
        
        // Set default material if not provided
        if (!this.material) {            
            this.material = defaultMaterial;
        }
    }
    
    // Inherit prototype methods
    ExtendedBody.prototype = Object.create(Body.prototype);
    ExtendedBody.prototype.constructor = ExtendedBody;

    return ExtendedBody;
})(CANNON.Body);

// Ensure prototype chain is maintained
CANNON.Body.prototype = Object.create(CANNON.Body.prototype);
CANNON.Body.prototype.constructor = CANNON.Body;


(function GLTFLoader_LoadCache() {
    const gltfCache = new Map();
    const originalLoad = GLTFLoader.prototype.load;
    GLTFLoader.prototype.load = function (url, onLoad, onProgress, onError) {
        if (gltfCache.has(url)) {
            const cachedModel = gltfCache.get(url);
            const clonedModel = {...cachedModel,original:cachedModel, scene: SkeletonUtils.SkeletonUtils.clone(cachedModel.scene)};
            if (onLoad) onLoad(clonedModel);
            return;
        }

        originalLoad.call(this, url,
            (gltf) => {
                gltfCache.set(url, gltf);
                if (onLoad) onLoad({...gltf,original:gltf, scene: SkeletonUtils.SkeletonUtils.clone(gltf.scene)});
            },
            onProgress,
            onError
        );
    };
})();

THREE.Cache.enabled=true;

(function GLTFLoader_LoadNotFound() {
    const originalLoad = GLTFLoader.prototype.load;
    GLTFLoader.prototype.load = function (url, onLoad, onProgress, onError) {
        originalLoad.call(this, url, onLoad, onProgress, (error) => {            
            originalLoad.call(this, 'notfound.glb', onLoad, onProgress, onError);
            let variant = chat.currentVariant;
            const fileName = url.split('/').pop().split('.')[0];
            picker.openModelPicker(fileName, async (downloadUrl) => {
                const response = await fetch(downloadUrl);
                const arrayBuffer = await response.arrayBuffer();
                navigator.serviceWorker.controller.postMessage({
                    action: 'uploadFiles',
                    files: [{ name: url, buffer: arrayBuffer }]
                });
                await new Promise(resolve => setTimeout(resolve, 100));
                chat.switchVariant(variant);
            });
        });
    };
})();
