import { Swatch } from "./swatch.js";
import * as Elements from "../modules/elements.js";

class SwatchDisplay{
    constructor(){
        this.display = Elements.SWATCH_DISPLAY;
    }

    updateDisplay(colors){
        this.display.innerHTML = "";

        for(let i = 0; i < colors.length; i++){
            const swatch = new Swatch(this.display, colors[i]);
            swatch.createLabels();
        };
    }
}

export{SwatchDisplay}