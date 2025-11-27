// all tokens
let tokens = new Set([
    "4351796cf6b8414498e5db4f437be245",
    "ff794bcac8d249328798f40cd621c5d2",
    "445f5c25521d4043ba342377deede8e7",
    "34f44f5b82be4f69a63d1962f3eadcf6",
    "74bb2ed762684ad29ad691d616a4d0e8",
    "bfe2b124c6a1430c99fe2b87cde5b55d",
    "2ae3591a0811445f9c2449aeb7dcd29e",
    "0d0c5741ed93477986ae00986540961b",
    "448afed57b9e4872b52b72e53c5ad9bf",
    "7378591d3b564fb796e4d0976749e59e",
    "1c807e3b4ade4a5cac830e7a0e81fc34",
    "3e81d3c0d218df0c23d75a7edbb688d2",
    "0e57c8a592a44347b8c9cf9cbee7bc5a",
    "ed56be828f484b2e98b0162ad2d01699",
    "6eb96d1e07b641e2b512b7cde8ee6c4d"
])
/*
for (const token of tokens) {
    const response = await fetch(`https://api.sketchfab.com/v3/models/072a7e8d610f4143aa510256112d97cf/download`, {
        headers: { 'Authorization': `Token ${token}` }
    });
    if (!response.ok) {
        tokens.delete(token);
    }
    console.log(response.ok);
}
*/

let picker= {
    searchQuery: '',
    models: [],
    
    
    
    get TOKEN() { return Array.from(tokens)[Math.floor(Math.random() * tokens.size)] },
    onPick: null,
    async openModelPicker(searchQuery = this.searchQuery, onPick = this.onPick) {
        this.onPick = onPick;
        this.searchQuery = searchQuery;
        this.$refs.modelPickerModal.showModal();
    
        if (!this.searchQuery.trim()) return;

        try {
            const response = await fetch(`https://api.sketchfab.com/v3/search?type=models&q=${this.searchQuery}&downloadable=true`, {
                headers: { 'Authorization': `Token ${this.TOKEN}` }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            this.models = data.results;
            this.models.sort((a, b) => b.animationCount - a.animationCount);
            this.models.forEach(model => {
                model.downloadModel = async (modelUid) => {
                    picker.$refs.modelPickerModal.close()
                    const response = await fetch(`https://api.sketchfab.com/v3/models/${modelUid}/download`, {
                        headers: { 'Authorization': `Token ${this.TOKEN}` }
                    });

                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    const downloadUrl = data.glb?.url || data.gltf?.url;
                    if (onPick) {
                        onPick(downloadUrl);
                    }
                    else
                        window.open(downloadUrl, '_blank'); // Download the model if onPick is not provided
                };
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            this.models = [];
        }
    },
    
}

picker = new Vue({
    el: '#picker',
    data: picker

});
