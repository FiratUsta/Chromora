import { Themer } from "./themer.js";
import { ColorWheel } from "./colorWheel.js";
import { Color } from "./color.js";
import * as Elements from "../modules/elements.js";
import { SwatchDisplay } from "./swatchDisplay.js";

class DomManager{
    constructor(parent){
        this.parent = parent;

        this.colorWheel = new ColorWheel(this);
        this.themer = new Themer();
        this.swatchDisplay = new SwatchDisplay(this);
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

    _switchTab(selected){
        [[Elements.TAB_ADVANCED, Elements.OPTIONS_ADVANCED], [Elements.TAB_QUICK, Elements.OPTIONS_QUICK]].forEach(couple => {
            if(couple[0] === selected){
                couple[0].classList.add("selected");
                couple[1].classList.remove("hidden");
            }else{
                couple[0].classList.remove("selected");
                couple[1].classList.add("hidden");
            };
        })
    }

    _quickSettings(buttonID){
        Elements.QUICK_BUTTONS.forEach(button => {
            button.classList.remove("selected")
        });
        document.getElementById(buttonID).classList.add("selected");
        switch(buttonID){
            case "quickComplement":
                this._setGeneratorParameters( 2, 3, -1, -1);
                break;
            case "quickTriadic":
                this._setGeneratorParameters( 3, 2, -1, -1);
                break;
            case "quickTetradic":
                this._setGeneratorParameters( 4, 2, -1, -1);
                break;
            case "quickMonochrome":
                this._setGeneratorParameters( 1, 6, -1, -1);
                break;
            case "quickAnalogous":
                this._setGeneratorParameters( 3, 2, 30, -1);
                break;
            case "quickRandom":
                this._setGeneratorParameters( 6, 1, -1, 1);
                break;
        }
    }

    async update(colors){
        this.swatchDisplay.updateDisplay(colors);
    }

    init(){
        // Document INIT
        this.themer.init();
        this.colorWheel.init();

        // COMMON
        const helpers = [...document.getElementsByClassName("helpButton")];
        helpers.forEach(button => {
            button.addEventListener("touchstart", () => {
                button.classList.add("hover");
            })
            button.addEventListener("touchend", () => {
                button.classList.remove("hover");
            })
        });

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
        [Elements.TAB_ADVANCED, Elements.TAB_QUICK].forEach(tab => {
            tab.onclick = () => this._switchTab(tab);
        })

        Elements.QUICK_BUTTONS.forEach(button => {
            button.onclick = () => this._quickSettings(button.id);
        });

        this._quickSettings(Elements.QUICK_COMPLEMENT.id);

        // STEP 3
        Elements.NOTIF_BUTTON.onclick = () => {Elements.NOTIF_CONTAINER.classList.remove("show")};
    }
}

export{DomManager}