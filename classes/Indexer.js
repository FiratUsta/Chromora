class Indexer{
    constructor(){
        this.nameArray;
    }

    _calculateSimilarity(rgb, color){
        const r = rgb[0] - color.red;
        const g = rgb[1] - color.green;
        const b = rgb[2] - color.blue;

        return (0.3 * (r * r)) + (0.59 * (g * g)) + (0.11 * (b *b));
    }

    async findMultiple(colors){
        const self = this;

        return new Promise(function(resolve){
            let similars = [];

            colors.forEach(color => {
              similars.push([null, 999]);      
            });

            self.nameArray.forEach(name => {
                for(let i = 0; i < colors.length; i++){
                    const simIndex = self._calculateSimilarity(name["rgb"], colors[i]);
                    if(simIndex < similars[i][1]){
                        similars[i] = [name, simIndex]
                    };
                };
            });

            resolve(similars);
        });
    }

    async init(){
        const self = this;

        return new Promise(function(resolve){
            fetch('./data/colors.json')
            .then((response) => response.json())
            .then((json) => {
                self.nameArray = json["colors"];
                resolve();
            });
        })
    }
}

export{Indexer}