import { Themer } from "./Themer.js";
import { ColorWheel } from "./ColorWheel.js";
import { Color } from "./Color.js";
import * as Elements from "../modules/Elements.js";

class DomManager{
    constructor(){
        this.colorWheel = new ColorWheel(this);
        this.themer = new Themer;
    }

    _randomColor(){
        const color = new Color().random();
        this.colorWheel.positionFromHSV(color);
        this.themer.updateColors(color);
    }

    _colorInput(mode){
        let color;
        switch(mode){
            case "hsv":
                color = new Color().fromHSV(Elements.H_INPUT.value, Elements.S_INPUT.value / 100, Elements.V_INPUT.value / 100);
                break;
            case "rgb":
                color = new Color(Elements.R_INPUT.value, Elements.G_INPUT.value, Elements.B_INPUT.value);
                break;
            case "hex":
                color = new Color().fromHEX(Elements.HEX_INPUT.value);
                break;
            default:
                break;
        }
        this.colorWheel.positionFromHSV(color);
        this.themer.updateColors(color);
    }

    init(){
        this.themer.init();
        this.colorWheel.init();

        [Elements.H_INPUT, Elements.S_INPUT, Elements.V_INPUT].forEach(element => {
            element.onchange = () => {this._colorInput("hsv")};
        });

        [Elements.R_INPUT, Elements.G_INPUT, Elements.B_INPUT].forEach(element => {
            element.onchange = () => {this._colorInput("rgb")};
        });

        Elements.HEX_INPUT.onchange = () => {this._colorInput("hex")};
        Elements.BUTTON_RANDOM.onclick = () => this._randomColor();
    }
}

export{DomManager}