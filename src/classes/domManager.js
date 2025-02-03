import { Themer } from "./themer.js";
import { ColorWheel } from "./colorWheel.js";
import { Color } from "./color.js";
import * as Elements from "../modules/elements.js";
import { SwatchDisplay } from "./swatchDisplay.js";
import { Debugger } from "../modules/debugger.js";

class DomManager{
    constructor(parent){
        this.parent = parent;

        this.colorWheel = new ColorWheel(this);
        this.themer = new Themer(this);
        this.swatchDisplay = new SwatchDisplay(this);
    }

    _randomColor(){
        const color = new Color().random();
        this.colorWheel.positionFromColor(color);
        this.themer.accentColor(color);
        this.parent.colorGenerator.generatePalette();
        this.colorWheel.updatePickers(color);
    }

    _colorInput(mode){
        Debugger.log("Color input fired.");
        let color;
        switch(mode){
            case "hsv":
            case "value":
                // Get the values
                const hue = Elements.H_INPUT.value;
                const saturation = Elements.S_INPUT.value;
                const value = Elements.V_INPUT.value;

                // Apply color
                color = new Color().fromHSV(hue, saturation / 100, value / 100);
                this.themer.accentColor(color);
                if(mode === "hsv"){
                    this.colorWheel.updatePickers(color);
                }

                // Set values
                Elements.H_INPUT.value = hue;
                Elements.S_INPUT.value = saturation;
                Elements.V_INPUT.value = value;

                break;
            case "rgb":
                color = new Color(Elements.R_INPUT.value, Elements.G_INPUT.value, Elements.B_INPUT.value);
                this.themer.accentColor(color);
                this.colorWheel.updatePickers(color);
                break;
            case "hex":
                color = new Color().fromHEX(Elements.HEX_INPUT.value);
                this.themer.accentColor(color);
                this.colorWheel.updatePickers(color);
                break;
            default:
                break;
        }
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

        this.parent.exporter.checkRestrictions();
        this.colorWheel.updatePickers(new Color().fromHEX(Elements.HEX_INPUT.value));
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
                this._setGeneratorParameters( 3, 1, -1, -1);
                break;
            case "quickTetradic":
                this._setGeneratorParameters( 4, 1, -1, -1);
                break;
            case "quickMonochrome":
                this._setGeneratorParameters( 1, 5, -1, -1);
                break;
            case "quickAnalogous":
                this._setGeneratorParameters( 3, 1, 30, -1);
                break;
            case "quickRandom":
                this._setGeneratorParameters( 1, 1, -1, 1);
                break;
        }
        this.parent.colorGenerator.generatePalette();
        this.colorWheel.updatePickers(new Color().fromHEX(Elements.HEX_INPUT.value));
    }

    _toggleMenu(){
        Elements.BUTTON_MENU.classList.toggle("open");
        const menuButtons = [Elements.THEME_TOGGLE.parentNode, Elements.VIEWER_BUTTON.parentNode, Elements.ABOUT_BUTTON_O.parentNode];

        menuButtons.forEach(button => {
            button.classList.toggle("open");
        })
    }

    async updateDisplay(colors){
        this.swatchDisplay.updateDisplay(colors);
    }

    updateColors(color){
        this.themer.accentColor(color);
        this.colorWheel.positionFromColor(color);
        this.colorWheel.updatePickers(color);
    }

    init(){
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
            element.onchange = () => {this._colorInput("hsv");};
        });

        Elements.VALUE_SLIDER.oninput = () => {
            Elements.V_INPUT.value = Elements.VALUE_SLIDER.value;
            this._colorInput("value");
        };

        [Elements.R_INPUT, Elements.G_INPUT, Elements.B_INPUT].forEach(element => {
            element.onchange = () => {this._colorInput("rgb")};
        });

        Elements.HEX_INPUT.onchange = () => {this._colorInput("hex")};
        Elements.BUTTON_RANDOM.onclick = () => this._randomColor();
        Elements.GRADIENT_CHECKBOX.onchange = () => this.swatchDisplay.toggleGradient();

        // STEP 2
        [Elements.TAB_ADVANCED, Elements.TAB_QUICK].forEach(tab => {
            tab.onclick = () => this._switchTab(tab);
        })

        Elements.QUICK_BUTTONS.forEach(button => {
            button.onclick = () => this._quickSettings(button.id);
        });

        Elements.SETTINGS_BUTTONS.forEach(button => {
            button.onchange = () => this.colorWheel.updatePickers(new Color().fromHEX(Elements.HEX_INPUT.value));
        })

        Elements.BUTTON_MENU.onclick = () => this._toggleMenu();

        this._quickSettings(Elements.QUICK_MONOCHROME.id);
        this.themer.init();
    }
}

export{DomManager}