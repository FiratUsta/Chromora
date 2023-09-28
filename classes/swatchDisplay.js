import { Swatch } from "./swatch.js";
import * as Elements from "../modules/elements.js";
import { Debugger } from "../modules/debugger.js";

class SwatchDisplay{
    constructor(parent){
        this.parent = parent;
        this.display = Elements.SWATCH_DISPLAY;
        this.swatches = [];
        this.focused = null;
    }

    _clear(){
        const newSwatches = [];
        this.swatches.forEach(swatch => {
            if(swatch.locked === true){
                newSwatches.push(swatch);
            }else{
                swatch.dismiss();
            };
        });
        this.swatches = newSwatches;
    }

    async createSwatches(colors){
        for(let i = 0; i < colors.length; i++){
            const swatch = new Swatch(this, colors[i], this.parent.themer.textColorFromColor(colors[i]));
            swatch.createLabels();
            this.swatches.push(swatch);
        };
    }

    async updateDisplay(colors){
        const start = Date.now();

        this._clear();

        await this.createSwatches(colors)

        Debugger.log("Swatches generated in " + (Date.now() - start) + "ms.")
    }

    focus(swatch){
        setTimeout(() => {
            if(this.focused !== null){
                this.focused.focused = false;
            }
            this.focused = swatch;
            this.focused.focused = true;
        }, 100);
    }

    getNotificationManager(){
        return this.parent.parent.notifier;
    }
}

export{SwatchDisplay}