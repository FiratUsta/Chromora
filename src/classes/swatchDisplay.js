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

    _linkSwatches(){
        for(let i = 0; i < this.swatches.length; i++){
            if(i !== 0){
                const previousSwatch = this.swatches[i - 1];
                this.swatches[i].previousSwatch = previousSwatch;
                previousSwatch.nextSwatch = this.swatches[i];
            };
        }
    }

    async createSwatches(colors){
        for(let i = 0; i < colors.length; i++){
            const swatch = new Swatch(this, colors[i]);
            swatch.createLabels();
            this.swatches.push(swatch);
        };
    }

    async updateDisplay(colors){
        const start = Date.now();

        this._clear();

        await this.createSwatches(colors);
        this.toggleGradient();

        Debugger.log("Swatches generated in " + (Date.now() - start) + "ms.");
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

    getPalette(){
        const colors = [];
        this.swatches.forEach(swatch => {
            colors.push(swatch.color);
        });
        return colors;
    }

    hasLocked(){
        let check = false;

        this.swatches.every(swatch => {
            if(swatch.locked){
                check = true;
                return false;
            }
            return true;
        })

        return check;
    }

    toggleGradient(){
        this._linkSwatches();
        this.swatches.forEach(swatch => {
            swatch.toggleGradient();
        });
    }
}

export{SwatchDisplay}