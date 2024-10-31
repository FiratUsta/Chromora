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

    _toBigEndianFloat32Array(floats) {
        const buffer = new ArrayBuffer(floats.length * 4);
        const view = new DataView(buffer);
    
        floats.forEach((float, index) => {
            view.setFloat32(index * 4, float, false);
        });
    
        return new Float32Array(buffer);
    }

    _floatTo32bitHex(float){
        const getHex = i => ('00' + i.toString(16)).slice(-2);
    
        var view = new DataView(new ArrayBuffer(4)),
            result;
    
        view.setFloat32(0, float);
    
        result = Array
            .apply(null, { length: 4 })
            .map((_, i) => getHex(view.getUint8(i)))
            .join('');
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

    // ACO and ASE exports have a restricted amount of colors supported compared to the actual spec, should fix.
    _exportToACO(palette){
        // Start with v1 Header
        // FORMAT: [version number (1 or 2), number of colors]
        let aco = [0x00, 0x01, 0x00, palette.length];
    
        palette.forEach(color => {
            // Format: [color space, color data (wyxz)]
            // Colorspace: 0 = RGB, 1 = HSB, 2 = CMYK, 7 = LAB, 8 = GRAYSCALE
            // Z Variable is 0 for all colorspaces except CMYK, where it's K.
            const colorBlock = [0x00, 0x00, color.red, color.red, color.green, color.green, color.blue, color.blue, 0x00, 0x00];
    
            // Concat color block into palette array
            aco = aco.concat(colorBlock);
        });
    
        // Add v2 header
        aco.push(0x00, 0x02, 0x00, palette.length);
    
        palette.forEach((color, index) => {
            let name = `Color ${index + 1}`;
            if(color.name !== undefined){
                name = color.name;
            }
            // We do the same thing as v1 first, but this time add a constant 0 at the end of color data before the name.
            const colorBlock = [0x00, 0x00, color.red, color.red, color.green, color.green, color.blue, color.blue, 0x00, 0x00, 0x00, 0x00];
    
            // Create the name block
            // Format: [String length + 1 (chars), UTF-16 encoded string, 0x00 0x00 terminator]
            const nameBlock = [0x00, name.length + 1, ...this._stringToUTF16(name), 0x00, 0x00];
    
            // Concat color block into palette array
            aco = aco.concat(colorBlock, nameBlock);
        });
    
        const acoBytes = new Uint8Array(aco);
    
        return URL.createObjectURL(new Blob([aco], {type: 'application/octet-stream'}));;
    }

    _exportToASE(palette){
        // Start with the header
        // Format: [Signature (ASEF), Version (1), Number of Blocks (palette size)]
        let ase = new Uint8Array([0x41, 0x53, 0x45, 0x46, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, palette.length]);
    
        // Add color blocks
        palette.forEach((color, index) => {
            let name = `Color ${index + 1}`;
            if(color.name !== undefined){
                name = color.name;
            }
    
            const colorNameArray = this._stringToUTF16(name);
            
            // Format: [Block type: 01 = Color Block, Block Length (After this), Name Length, UTF-16 Encoded String, Color Space, Color Values, Color Mode]
            const colorBlockHeader = new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x00, (11 + name.length) * 2, 0x00, name.length + 1, ...colorNameArray, 0x00, 0x00, 0x52, 0x47, 0x42, 0x20]);
            // For some ungodly reason everything else is little endian while the RGB values are expected to be big endian. Wowza.
            // I decided I wanted to learn web because I didn't want to deal with this stuff!
            const colorRGBData = new Uint8Array(this._toBigEndianFloat32Array([color.red / 255, color.green / 255, color.blue / 255]).buffer);
            const colorMode = new Uint8Array([0x00, 0x00]);
    
            const mergedArray = new Uint8Array(ase.length + colorBlockHeader.length + colorRGBData.length + colorMode.length);
            mergedArray.set(ase);
            mergedArray.set(colorBlockHeader, ase.length);
            mergedArray.set(colorRGBData, ase.length + colorBlockHeader.length);
            mergedArray.set(colorMode, ase.length + colorBlockHeader.length + colorRGBData.length);
            ase = mergedArray;
        });
    
        return URL.createObjectURL(new Blob([ase], {type: 'application/octet-stream'}));;
    }

    // GIMP palettes are pretty self explanatory, so no comments here. Thank you GIMP.
    _exportToGPL(palette){
        let gpl = "GIMP Palette\n";
        gpl += "Name: Chromora Exported Palette\n";
        gpl += "Columns: 0\n";

        palette.forEach((color, index) => {
            let name = `Color ${index + 1}`;
            if(color.name !== undefined){
                name = color.name;
            }

            gpl += `${color.red} ${color.green} ${color.blue} ${name}\n`;
        });

        return URL.createObjectURL(new Blob([gpl], {type:"text/plain"}));
    }

    _exportToPrint(palette){
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

    _exportToCode(){
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

    _exportToImage(palette){
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

    _exportToURL(){
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