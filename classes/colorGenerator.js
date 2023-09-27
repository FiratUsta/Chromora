import { Color } from "./color.js";
import { Indexer } from "./indexer.js";
import * as Elements from "../modules/elements.js";
import { wrapAngle, wrap } from "../modules/tools.js";
import { Debugger } from "../modules/debugger.js";

class ColorGenerator{
    constructor(parent){
        this.parent = parent;

        this.palette = [];
        this.modifiedPalette = [];
    }

    _parseCode(code){
        const params = code.split("-");

        this.parent.domManager.updateColors(new Color().fromHEX(params[0]));
        Elements.HUES.value = parseInt(params[1]);
        Elements.TONES.value = parseInt(params[2]);

        if (params.length > 3){
            for(let i = 3; i < params.length; i++){
                const param = params[i].split(";");
                if(param.length > 1){
                    Elements.TINT_AMOUNT.value = parseInt(param[0]);
                    Elements.TINT_COLOR.value = parseInt(param[1]);
                }else{
                    Elements.CHECK_ANALOGOUS.checked = true;
                    Elements.ANALOGOUS_ANGLE.value = parseInt(param[0]);
                };
            }
        }
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
        const tintColor = new Color().fromHSV(Elements.TINT_COLOR.value, 1, 1);
        const tintAmount = Elements.TINT_AMOUNT.value / 100;

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
            
            const names = await(self.parent.indexer.findMultiple(self.modifiedPalette));

            for(let i = 0; i < self.modifiedPalette.length; i++){
                self.modifiedPalette[i].name = names[i][0]["name"];
            };
            
            resolve();
        });
    }

    async generatePalette(){
        const start = Date.now();

        if(Elements.CHECK_IMPORT.checked){
            this._parseCode(Elements.IMPORT_CODE.value);
        }

        this.palette = await this._generateColors();

        await this._tint();

        if(Elements.CHECK_NAMING.checked){
            await this.namePalette();
        }

        Debugger.log("Palette generated in " + (Date.now() - start) + "ms.");

        await this.parent.domManager.updateDisplay(this.modifiedPalette);

        Debugger.log("Generation complete in " + (Date.now() - start) + "ms.");
    }

    getPalette(modified){
        if(modified){
            return this.modifiedPalette;
        }else{
            return this.palette;
        };
    }

    async init(){
        Elements.TINT_COLOR.oninput = () => this.generatePalette();
        Elements.TINT_AMOUNT.onchange = () => this.generatePalette();

        Elements.BUTTON_GENERATE.onclick = () => this.generatePalette();
    }
}

export{ColorGenerator}