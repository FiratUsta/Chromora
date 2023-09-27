import { Debugger } from "../modules/debugger.js";
import * as Elements from "../modules/elements.js";

class Exporter{
    constructor(parent){
        this.parent = parent;
    }

    _createPrintSwatch(color, index){
        // For color list
        const container = document.createElement("div");
        container.classList.add("printColor");

        const swatch = document.createElement("div");
        swatch.classList.add("printSwatch");
        swatch.style.backgroundColor = color.hex();
        container.appendChild(swatch);

        const infoContainer = document.createElement("div");
        infoContainer.classList.add("printInfo");
        container.appendChild(infoContainer);

        const title = document.createElement("h4");
        if(color.name !== undefined){
            title.innerText = color.name;
        }else{
            title.innerText = "Color " + index;
        };
        infoContainer.appendChild(title);

        const hex = document.createElement("p");
        hex.innerHTML = "<b>HEX:</b> " + color.hex();
        infoContainer.appendChild(hex);

        const rgb = document.createElement("p");
        rgb.innerHTML = "<b>RGB:</b> " + color.red + ", " + color.green + ", " + color.blue;
        infoContainer.appendChild(rgb);

        const HSV = color.hsv();
        const hsv = document.createElement("p");
        hsv.innerHTML = "<b>HSV:</b> " + Math.round(HSV.hue) + "°, " + Math.round(HSV.saturation * 100) + "%, " + Math.round(HSV.value * 100) + "%";
        infoContainer.appendChild(hsv);
        
        // For the display
        const displaySwatch = document.createElement("div");
        displaySwatch.classList.add("swatch");
        displaySwatch.style.backgroundColor = color.hex();
        
        return {displaySwatch, container};
    }

    _printExport(palette){
        // Clear Print Area
        Elements.PRINT_AREA.innerHTML = "";
        Elements.PRINT_COLORS.innerHTML = "";

        // Generate swatches
        for(let i = 0; i < palette.length; i++){
            const elems = this._createPrintSwatch(palette[i], i + 1);
            Elements.PRINT_AREA.appendChild(elems.displaySwatch);
            Elements.PRINT_COLORS.appendChild(elems.container);
        };

        // Print
        window.print();

        // Debug
        Debugger.log("Print export complete.")
    }

    _codeExport(){
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

        // Push Notification
        Elements.NOTIF_TEXT.innerHTML = '<b>Your code is: </b><span id="codeDisplay">' + code + '</span>';
        const codeDisplay = document.getElementById("codeDisplay");
        codeDisplay.onclick = () => {
            navigator.clipboard.writeText(codeDisplay.innerText);
            Elements.NOTIF_TEXT.innerHTML = "<b>Your code has been copied to your clipboard!</b>";
        };
        Elements.NOTIF_CONTAINER.classList.add("show");
        
        // Debug
        Debugger.log("Code export complete.")
    }

    _imageExport(palette){
        // Generate Image
        const ctx = Elements.EXPORT_CANVAS.getContext("2d");

        ctx.canvas.width = 900;
        ctx.canvas.height = 150 * (Math.ceil(palette.length / 6));
        
        let x = 0;
        let y = 0;
        palette.forEach(color => {
            ctx.fillStyle = color.hex();
            ctx.fillRect(x, y, 150, 150);
            x += 150;
            if(x >= 900){
                x = 0;
                y += 150;
            }
        });

        // Download Image
        const dataUrl = Elements.EXPORT_CANVAS.toDataURL();
        const anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = "palette.png";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        // Debug
        Debugger.log("Image export complete.")
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
        };
    }

    init(){
        Elements.BUTTON_EXPORT.onclick = () => this._export(this.parent.colorGenerator.getPalette(true));
    }
}

export{Exporter}