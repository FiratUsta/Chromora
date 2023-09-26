const ColorGenerator = (() => {
    let palette = [];
    let modifiedPalette = [];

    function _calculateValues(value, amount){
        let values = [];

        const increment = 1 / amount;
        for(let i = 0; i < amount; i++){
            values.push(Tools.wrap(value, increment * i, 0, 1));
        };

        values.sort();

        return values;
    }

    function generateColors(base, points, amount, analogous = false, analogousAngle = 0){
        palette = [];
        const display = document.getElementById("display");
        display.innerHTML = "";
        const hsv = base.hsv();
        const values = _calculateValues(hsv.value, amount);
        
        let shift;
        let mod = 1;
        if(!analogous){
            shift = 360 / points;
        }else{
            shift = analogousAngle;
        };
        
        for(let i = 0; i < points; i++){
            for(let j = 0; j < amount; j++){
                if(analogous){
                    mod = (i % 2 === 0 ? -1 : 1);
                }
                const angle = Tools.wrapAngle(hsv.hue, shift * i * mod);
                const color = new Color().fromHSV(angle, hsv.saturation, values[j]);
                palette.push(color);
            }
        };

        return palette;
    }

    function getPalette(modified){
        if(modified){
            return modifiedPalette;
        }else{
            return palette;
        };
    }

    function random(_color, amount){
            palette = [];

            for(let i = 0; i < amount; i++){
                const color = new Color().random();
                palette.push(color);
            };
    
            return palette;
    }

    function tint(color){
        modifiedPalette = [];

        palette.forEach(swatch => {
            modifiedPalette.push(swatch.clone());
        });

        modifiedPalette.forEach(async function(swatch){
            swatch.tint(color);
        });

        return modifiedPalette;
    }

    async function namePalette(){
        return new Promise(async function(resolve){
            
            const names = await(Indexer.findMultiple(modifiedPalette));

            for(let i = 0; i < modifiedPalette.length; i++){
                modifiedPalette[i].name = names[i][0]["name"];
            };
            
            resolve();
        });
    }

    return{
        generateColors,
        getPalette,
        random,
        tint,
        namePalette
    }

})();