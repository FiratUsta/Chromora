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

    _setGeneratorParameters(hues, tones, analogousAngle, random){
        Elements.HUES.value = hues;
        Elements.TONES.value = tones;

        if(analogousAngle !== -1){
            Elements.CHECK_ANALOGOUS.checked = true;
            Elements.ANALOGOUS_ANGLE.value = analogousAngle;
        }else{
            Elements.CHECK_ANALOGOUS.checked = false;
        }

        if(random !== -1){
            Elements.CHECK_RANDOM.checked = true;
        }else{
            Elements.CHECK_RANDOM.checked = false;
        }
    }

    _quickSettings(buttonID){
        Elements.QUICK_BUTTONS.forEach(button => {
            button.classList.remove("selected")
        });
        document.getElementById(buttonID).classList.add("selected");
        switch(buttonID){
            case "quick_complement":
                this._setGeneratorParameters( 2, 3, -1, -1);
                break;
            case "quick_triadic":
                this._setGeneratorParameters( 3, 2, -1, -1);
                break;
            case "quick_tetradic":
                this._setGeneratorParameters( 4, 2, -1, -1);
                break;
            case "quick_monochrome":
                this._setGeneratorParameters( 1, 6, -1, -1);
                break;
            case "quick_analogous":
                this._setGeneratorParameters( 3, 2, 30, -1);
                break;
            case "quick_random":
                this._setGeneratorParameters( 6, 1, -1, 1);
                break;
        }
    }

    init(){
        // Document INIT
        this.themer.init();
        this.colorWheel.init();

        // STEP 1
        [Elements.H_INPUT, Elements.S_INPUT, Elements.V_INPUT].forEach(element => {
            element.onchange = () => {this._colorInput("hsv")};
        });

        [Elements.R_INPUT, Elements.G_INPUT, Elements.B_INPUT].forEach(element => {
            element.onchange = () => {this._colorInput("rgb")};
        });

        Elements.HEX_INPUT.onchange = () => {this._colorInput("hex")};
        Elements.BUTTON_RANDOM.onclick = () => this._randomColor();

        // STEP 2
        Elements.QUICK_BUTTONS.forEach(button => {
            button.onclick = () => {this._quickSettings(button.id)}
        });

        this._quickSettings(Elements.QUICK_COMPLEMENT.id);
    }
}

export{DomManager}