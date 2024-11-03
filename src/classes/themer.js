import { Debugger } from "../modules/debugger.js";
import * as Elements from "../modules/elements.js"
import { isBetween } from "../modules/tools.js";
import { Color } from "./color.js";

class Themer{
    constructor(parent){
        this.parent = parent;

        this.theme = this._checkColorPreference();
    }

    _checkColorPreference(){
        if (window.matchMedia) {
            if(window.matchMedia('(prefers-color-scheme: dark)').matches){
                return "dark";
            } else {
                return "light";
            }
        } else {
            return "light";
        };
    }

    _setDocumentTheme(theme){
        const themeVectors = Array.from(document.querySelectorAll(".themeVector"));
        switch(theme){
            case "light":
                document.documentElement.style.setProperty('--background', "#F5F5F5");
                document.documentElement.style.setProperty('--foreground', "#363636");
                document.documentElement.style.setProperty('--shadow-light', "rgba(0, 0, 0, 0.2)");
                document.documentElement.style.setProperty('--shadow-dark', "rgba(0, 0, 0, 0.5)");
                document.documentElement.style.setProperty('--accent-one', "#868686");
                themeVectors.forEach(button => {
                    button.classList.remove("dark");
                });
                break;
            case "dark":
                document.documentElement.style.setProperty('--background', "#363636");
                document.documentElement.style.setProperty('--foreground', "#F5F5F5");
                document.documentElement.style.setProperty('--shadow-light', "rgba(0, 0, 0, 0.5)");
                document.documentElement.style.setProperty('--shadow-dark', "rgba(0, 0, 0, 0.8)");
                document.documentElement.style.setProperty('--accent-one', "#AFAFAF");
                themeVectors.forEach(button => {
                    button.classList.add("dark");
                });
                break;
        }
    }

    _toggleDocumentTheme(){
        if(this.theme === "dark"){
            this.theme = "light";
        }else{
            this.theme = "dark";
        };

        this._setDocumentTheme(this.theme);
    }

    textColorFromColor(color){
        const hsv = color.hsv();
        if(hsv.value < 0.4){
            return "#FEFEFE";
        }else if(isBetween(hsv.hue, 30, 200)){
            if(hsv.value < 0.7 && hsv.saturation > 0.25){
                return "#FEFEFE";
            }else{
                return "#363636";
            };
        }else{
            if(hsv.saturation > 0.6 || hsv.value < 0.7){
                return "#FEFEFE";
            }else{
                return "#363636";
            };
        }
    }

    accentColor(color, fromHSV = false){
        Debugger.log("Setting accent color.");
        const hexCode = color.hex();
        Elements.HEX_INPUT.value = hexCode;
        
        Elements.R_INPUT.value = color.red;
        Elements.G_INPUT.value = color.green;
        Elements.B_INPUT.value = color.blue;

        const hsv = color.hsv();
        Elements.H_INPUT.value = Math.round(hsv.hue);
        Elements.S_INPUT.value = parseInt(hsv.saturation * 100);
        Elements.V_INPUT.value = parseInt(hsv.value * 100);
        Elements.VALUE_SLIDER.value = parseInt(hsv.value * 100);
        
        Elements.SHADER.style.opacity = 1 - hsv.value;

        document.documentElement.style.setProperty('--accent-two', hexCode);
        document.documentElement.style.setProperty('--accent-three', this.textColorFromColor(color));
    }

    init(){
        this._setDocumentTheme(this.theme);

        this.parent.updateColors(new Color().fromHEX("#8A00FF"));

        Elements.THEME_TOGGLE.onclick = () => {this._toggleDocumentTheme();}
    }
}

export{Themer}