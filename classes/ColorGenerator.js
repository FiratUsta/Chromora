import { Color } from "./Color.js";
import { Indexer } from "./Indexer.js";
import * as Elements from "../modules/Elements.js";
import { wrapAngle, wrap } from "../modules/Tools.js";

class ColorGenerator{
    constructor(){
        this.palette = [];
        this.modifiedPalette = [];

        this.indexer = new Indexer;
    }

    _calculateValues(value, amount){
        let values = [];

        const increment = 1 / amount;
        for(let i = 0; i < amount; i++){
            values.push(wrap(value, increment * i, 0, 1));
        };

        values.sort();

        return values;
    }

    generateColors(){
        const palette = [];
        if(Elements.CHECK_RANDOM.checked){
            for(let i = 0; i < amount; i++){
                const color = new Color().random();
                palette.push(color);
            };
        }else{
            const base = new Color(Elements.R_INPUT.value, Elements.G_INPUT.value, Elements.B_INPUT.value);

            const hsv = base.hsv();
            const values = this._calculateValues(hsv.value, Elements.TONES.value);
            
            let shift;
            let mod = 1;
            if(!Elements.CHECK_ANALOGOUS.checked){
                shift = 360 / Elements.HUES.value;
            }else{
                shift = Elements.ANALOGOUS_ANGLE.value;
            };
            
            for(let i = 0; i < Elements.HUES.value; i++){
                for(let j = 0; j < Elements.TONES.value; j++){
                    if(Elements.CHECK_ANALOGOUS.checked){
                        mod = (i % 2 === 0 ? -1 : 1);
                    }
                    const angle = wrapAngle(hsv.hue, shift * i * mod);
                    const color = new Color().fromHSV(angle, hsv.saturation, values[j]);
                    palette.push(color);
                }
            };
        };
        return palette;
    }

    getPalette(modified){
        if(modified){
            return modifiedPalette;
        }else{
            return palette;
        };
    }

    tint(color){
        modifiedPalette = [];

        palette.forEach(swatch => {
            modifiedPalette.push(swatch.clone());
        });

        modifiedPalette.forEach(async function(swatch){
            swatch.tint(color);
        });

        return modifiedPalette;
    }

    async namePalette(){
        return new Promise(async function(resolve){
            
            const names = await(this.indexer.findMultiple(modifiedPalette));

            for(let i = 0; i < modifiedPalette.length; i++){
                modifiedPalette[i].name = names[i][0]["name"];
            };
            
            resolve();
        });
    }

    async init(){
        await this.indexer.init();
    }
}

export{ColorGenerator}