import { Swatch } from "./swatch.js";
import * as Elements from "../modules/elements.js";
import { Debugger } from "../modules/debugger.js";

class SwatchDisplay{
    constructor(parent){
        this.parent = parent;
        this.display = Elements.SWATCH_DISPLAY;
    }

    async createSwatches(colors){
        for(let i = 0; i < colors.length; i++){
            const swatch = new Swatch(this.display, colors[i], this.parent.themer.textColorFromColor(colors[i]));
            swatch.createLabels();
        };
    }

    async updateDisplay(colors){
        const start = Date.now();

        this.display.innerHTML = "";

        await this.createSwatches(colors)

        Debugger.log("Swatches generated in " + (Date.now() - start) + "ms.")
    }
}

export{SwatchDisplay}