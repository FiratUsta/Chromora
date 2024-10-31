import { Debugger } from "../modules/debugger.js";
import * as Elements from "../modules/elements.js";

class Exporter{
    constructor(parent){
        this.parent = parent;
        this.restricted = false;
    }
    
    // JS strings are already UTF-16 encoded so we just need to make an array of char codes
    _stringToUTF16(string){
        const bytes = [];

        for(let i = 0; i < string.length; i++){
            bytes.push(0, string.charCodeAt(i));
        };

        return bytes;
    }

    _fileDownloader(url, extension){
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `palette.${extension}`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor); 
    }

    _setRestrictions(){
        const restrictees = [Elements.EXPORT_URL, Elements.EXPORT_CODE];
        if(this.restricted){
            restrictees.every(button => {
                if(button.checked){
                    Elements.EXPORT_PRINT.click();
                    return false;
                }
                return true;
            });

            restrictees.forEach(button => button.disabled = true);
        }else{
            restrictees.forEach(button => button.disabled = false);
        };
    }

    _createPrintSwatch(color, index){
        const swatch = document.createElement("div");
        swatch.classList.add("printSwatch");

        const colorArea = document.createElement("div");
        colorArea.classList.add("printSwatchColor");
        colorArea.style.backgroundColor = "" + color.hex();
        swatch.appendChild(colorArea);

        const title = document.createElement("h4");
        if(color.name !== undefined){
            title.innerText = color.name;
        }else{
            title.innerText = "Color " + index;
        };
        title.style.color = "" + ((this.parent.domManager.themer.textColorFromColor(color) === "#363636" ? "black" : "white"));
        colorArea.appendChild(title);

        const hex = document.createElement("p");
        hex.innerHTML = "<b>HEX:</b> " + color.hex();
        swatch.appendChild(hex);

        const rgb = document.createElement("p");
        rgb.innerHTML = "<b>RGB:</b> " + color.red + ", " + color.green + ", " + color.blue;
        swatch.appendChild(rgb);

        const HSV = color.hsv();
        const hsv = document.createElement("p");
        hsv.innerHTML = "<b>HSV:</b> " + Math.round(HSV.hue) + "°, " + Math.round(HSV.saturation * 100) + "%, " + Math.round(HSV.value * 100) + "%";
        swatch.appendChild(hsv);
        
        return swatch;
    }

    _printExport(palette){
        // Clear Print Area
        Elements.PRINT_AREA.innerHTML = "";

        // Generate swatches
        for(let i = 0; i < palette.length; i++){
            const elem = this._createPrintSwatch(palette[i], i + 1);
            Elements.PRINT_AREA.appendChild(elem);
        };

        // Print
        window.print();

        // Debug
        Debugger.log("Print export complete.")
    }

    _createCode(){
        // Create Code
        let code = "";
        const params = [Elements.HEX_INPUT.value, Elements.HUES.value, Elements.TONES.value];

        if(Elements.TINT_AMOUNT.value !== "0"){
            params.push(Elements.TINT_AMOUNT.value + ";" + Elements.TINT_COLOR.value);
        };

        if(Elements.CHECK_ANALOGOUS.checked){
            params.push(Elements.ANALOGOUS_ANGLE.value);
        };

        for(let i = 0; i < params.length; i++){
            code += params[i];
            if(i !== params.length - 1){
                code += "-";
            };
        };

        return code;
    }

    _codeExport(){
        const code = this._createCode();

        // Push Notification
        const notification = this.parent.notifier.push('<b>Click to copy your export code: </b>' + code, true, () => {
            notification.dismiss();
            navigator.clipboard.writeText(code);
            this.parent.notifier.push("Your code has been copied to your clipboard!");
        });

        // Debug
        Debugger.log("Code export complete.")
    }

    _imageExport(palette){
        // Generate Image
        const ctx = Elements.EXPORT_CANVAS.getContext("2d");

        ctx.canvas.width = 300;
        ctx.canvas.height = 450;

        const swatchHeight = 450 / palette.length;

        let writeText = true;
        let textMargin;
        if(swatchHeight > 20){
            textMargin = (swatchHeight / 2) + 5;
        }else{
            writeText = false;
        }
        
        let y = 0;
        palette.forEach(color => {
            ctx.fillStyle = color.hex();
            ctx.fillRect(0, y, 350, y + swatchHeight);
            if(writeText){
                ctx.fillStyle = ((this.parent.domManager.themer.textColorFromColor(color) === "#363636" ? "black" : "white"));
                ctx.font = "bold 10pt Noto Sans, sans-serif"
                ctx.fillText("" + color.hex(), 15, y + textMargin);
                if(swatchHeight > 60){
                    const rgbText = color.red + ", " + color.green + ", " + color.blue;
                    ctx.fillText(rgbText, 15, y + textMargin + 25);
                    const HSV = color.hsv();
                    const hsvText = Math.round(HSV.hue) + "°, " + Math.round(HSV.saturation * 100) + "%, " + Math.round(HSV.value * 100) + "%"
                    ctx.fillText(hsvText, 15, y + textMargin - 25);
                }
            }
            y += swatchHeight;
        });

        // Download Image
        const dataUrl = Elements.EXPORT_CANVAS.toDataURL();
        this._fileDownloader(dataUrl, "png");

        // Debug
        Debugger.log("Image export complete.")
    }

    _urlExport(){
        const code = this._createCode();
        const currentUrl = window.location.href;

        const url = new URL("?view="+code, currentUrl);

        // Push Notification
        const notification = this.parent.notifier.push('<b>Click to copy your url: </b>' + url, true, () => {
            notification.dismiss();
            navigator.clipboard.writeText(url);
            this.parent.notifier.push("Your url has been copied to your clipboard!");
        });

        // Debug
        Debugger.log("URL export complete." + url)
    }

    _export(palette){
        Debugger.log("Starting export...");
        if(Elements.EXPORT_PRINT.checked){
            Debugger.log("Export mode: Print");
            this._printExport(palette);
        }else if(Elements.EXPORT_CODE.checked){
            Debugger.log("Export mode: Code");
            this._codeExport();
        }else if(Elements.EXPORT_IMAGE.checked){
            Debugger.log("Export mode: Image");
            this._imageExport(palette);
        }else if(Elements.EXPORT_URL.checked){
            Debugger.log("Export mode: URL");
            this._urlExport();
        };
    }

    checkRestrictions(){
        let check = false;

        if(Elements.CHECK_RANDOM.checked){
            check = true;
        };

        if(this.parent.domManager.swatchDisplay.hasLocked()){
            check = true;
        };

        if(check !== this.restricted){
            this.restricted = check;
            this._setRestrictions();
        };
    }

    init(){
        Elements.BUTTON_EXPORT.onclick = () => this._export(this.parent.domManager.swatchDisplay.getPalette(true));
    }
}

export{Exporter}