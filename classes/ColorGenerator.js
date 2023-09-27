import { Color } from "./Color.js";
import { Indexer } from "./Indexer.js";
import * as Elements from "../modules/Elements.js";
import { wrapAngle, wrap } from "../modules/Tools.js";
import { Debugger } from "../modules/Debugger.js";

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

    async _generateColors(){
        const colors = [];
        
        if(Elements.CHECK_RANDOM.checked){
            for(let i = 0; i < Elements.HUES.value; i++){
                const color = new Color().random();
                colors.push(color);
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
                    colors.push(color);
                }
            };
        };

        return colors;
    }

    async _tint(){
        const tintColor     = new Color().fromHSV(Elements.TINT_COLOR.value, 1, 1);
        const tintAmount    = Elements.TINT_AMOUNT.value / 100;

        Elements.TINT_COLOR.style.accentColor = tintColor.hex();
        
        tintColor.red   = parseInt(tintColor.red * tintAmount);
        tintColor.green = parseInt(tintColor.green * tintAmount);
        tintColor.blue  = parseInt(tintColor.blue * tintAmount);

        this.modifiedPalette = [];

        this.palette.forEach(swatch => {
            this.modifiedPalette.push(swatch.clone());
        });

        this.modifiedPalette.forEach(async function(swatch){
            swatch.tint(tintColor);
        });

        return this.modifiedPalette;
    }

    async namePalette(){
        const self = this;

        return new Promise(async function(resolve){
            
            const names = await(self.indexer.findMultiple(self.modifiedPalette));

            for(let i = 0; i < self.modifiedPalette.length; i++){
                self.modifiedPalette[i].name = names[i][0]["name"];
            };
            
            resolve();
        });
    }

    async generatePalette(){
        const start = Date.now();

        this.palette = await this._generateColors();

        await this._tint();

        if(Elements.CHECK_NAMING.checked){
            await this.namePalette();
        }

        Debugger.log("Palette generated in " + (Date.now() - start) + "ms.");
    }

    getPalette(modified){
        if(modified){
            return modifiedPalette;
        }else{
            return palette;
        };
    }

    async init(){
        await this.indexer.init();

        Elements.TINT_COLOR.oninput = this._tint;
        Elements.TINT_AMOUNT.onchange = this._tint;

        Elements.BUTTON_GENERATE.onclick = () => this.generatePalette();
    }
}

export{ColorGenerator}