import { Color } from "./color.js";
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

    _calculateShadesAndTones(hsv, amount){
        const shades = [];
        const tones  = [];

        const shadeA = Math.floor((amount - 1) / 2);
        const toneA  = Math.ceil((amount - 1) / 2);

        const shadeI = hsv.value / (shadeA + 1);
        for(let i = 0; i < shadeA; i++){
            const value = wrap(hsv.value, shadeI * (i + 1) * -1, 0, 1)

            shades.push({"hue": hsv.hue, "saturation": hsv.saturation, "value": value});
        }

        shades.sort((a, b) => {return a.value - b.value});

        const toneI = hsv.saturation / (toneA + 1);
        for(let i = 0; i < toneA; i++){
            const saturation = wrap(hsv.saturation, toneI * (i + 1) * -1, 0, 1);

            tones.push({"hue": hsv.hue, "saturation": saturation, "value": hsv.value});
        }

        tones.sort((a, b) => {return b.saturation - a.saturation});

        return{shades, tones};
    }

    _generateMonochrome(hsv, amount, insert = null){
        const colors = [];
        const shadesAndTones = this._calculateShadesAndTones(hsv, amount);
        const shades = shadesAndTones.shades;
        const tones = shadesAndTones.tones;

        for(let i = 0; i < shades.length; i++){
            const hsv = shades[i];
            colors.push(new Color().fromHSV(hsv.hue, hsv.saturation, hsv.value));
        };

        if(insert === null){
            colors.push(new Color().fromHSV(hsv.hue, hsv.saturation, hsv.value));
        }else{
            colors.push(insert);
        }
        

        for(let i = 0; i < tones.length; i++){
            const hsv = tones[i];
            colors.push(new Color().fromHSV(hsv.hue, hsv.saturation, hsv.value));
        };

        return colors;
    }

    _generateHues(hsv, amount){
        const hues = [];
        let shift;

        if(!Elements.CHECK_ANALOGOUS.checked){
            shift = 360 / Elements.HUES.value;
        }else{
            shift = Elements.ANALOGOUS_ANGLE.value;
        };

        for(let i = 0; i < amount; i++){
            let mod = 1;
            if(Elements.CHECK_ANALOGOUS.checked){
                mod = (i % 2 === 0 ? -1 : 1);
            };
            const angle = wrapAngle(hsv.hue, shift * i * mod);
            hues.push({"hue": angle, "saturation": hsv.saturation, "value": hsv.value});
        }

        return hues
    }

    _generateRandom(amount){
        const colors = [];

        for(let i = 0; i < amount; i++){
            const color = new Color().random();
            colors.push(color);
        };

        return colors;
    }

    async _generateColors(){
        let palette = [];
        const base = new Color().fromHEX(Elements.HEX_INPUT.value).hsv();
        const amount = Elements.HUES.value;

        if(Elements.CHECK_RANDOM.checked){
            palette = this._generateRandom(amount);
        }else{
            const hues = this._generateHues(base, amount);

            for(let i = 0; i < hues.length; i++){
                const generated = this._generateMonochrome(hues[i], Elements.TONES.value, (i === 0 ? new Color().fromHEX(Elements.HEX_INPUT.value) : null));
                for(let j = 0; j < generated.length; j++){
                    palette.push(generated[j]);
                };
            };
        };
        return palette;
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
            Elements.CHECK_IMPORT.checked = false;
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

        Elements.CHECK_RANDOM.onclick = () => this.parent.exporter.checkRestrictions();
    }
}

export{ColorGenerator}
