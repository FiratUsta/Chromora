if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("serviceWorker.js");
};

const DEBUG = true;

const Tools = (() => {

    function numToHex(num){
        const letters = ["A", "B", "C", "D", "E", "F"];

        const x = (Math.floor(num / 16) < 10 ? Math.floor(num / 16) : letters[Math.floor(num / 16) - 10]);
        const y = (num % 16 < 10 ? num % 16 : letters[num % 16 - 10]);

        return String(x) + String(y);
    }

    function hexToNum(hex){
        const letters = {"A": 10, "B": 11, "C": 12, "D": 13, "E": 14, "F": 15};
        let num = 0;

        for(let i = 0; i < hex.length; i++){
            const char = hex.charAt(i).toUpperCase();
            let base;
            const power =  hex.length - 1 - i;
            if(char in letters){
                base = letters[char];
            }else{
                base = parseInt(char);
            }
            num += base * (16 ** power);
        }

        return num;
    }

    function round(float){
        return Math.round(float * 100) / 100;
    }

    function randomBetween(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function wrap(left, right, min, max){
        let result = left + right;
        if(result > max || result < min){result += -max * Math.sign(left + right)};
        return result;
    }

    function wrapAngle(left, right){
        return wrap(left, right, 0, 360);
    }

    function clamp(value, min, max){
        return Math.max(min, Math.min(value, max));
    }

    function isBetween(value, min, max){
        return (min <= value && value <= max);
    };

    function changelog(){
        fetch('../data/version.json')
        .then((response) => response.json())
        .then((json) => {
            const version = json["version"];
            const changes = json["changelog"];
            let msg = "Color Thing by Fırat Usta v" + version + "\nChangelog:";
            changes.forEach(change => {
                msg += "\n    -" + change;
            })
            console.log(msg);

            const debugText = document.createElement("p");
            debugText.classList.add("debugLabel");
            debugText.innerText = "DEBUG BUILD VERSION v" + version;
            document.body.appendChild(debugText);
        });
    };

    return{
        numToHex,
        hexToNum,
        round,
        randomBetween,
        wrap,
        wrapAngle,
        clamp,
        isBetween,
        changelog
    }
})();

class Color{
    constructor(r = 0, g = 0, b = 0){
        this.red = r;
        this.green = g;
        this.blue = b;
    }

    fromHSV(hue, saturation, value){
        const C = value * saturation;
        const X = C * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = value - C;

        let ranges;
        if(hue > 300){
            ranges = [C, 0, X];
        }else if(hue > 240){
            ranges = [X, 0, C];
        }else if(hue > 180){
            ranges = [0, X, C];
        }else if(hue > 120){
            ranges = [0, C, X];
        }else if(hue > 60){
            ranges = [X, C, 0];
        }else{
            ranges = [C, X, 0];
        };

        this.red = Math.floor((ranges[0] + m) * 255);
        this.green = Math.floor((ranges[1] + m) * 255);
        this.blue = Math.floor((ranges[2] + m) * 255);

        return this;
    }

    fromHEX(hex){
        const hexRed = hex.substring(1, 3);
        const hexGreen = hex.substring(3, 5);
        const hexBlue = hex.substring(5, 7);

        this.red = Tools.hexToNum(hexRed);
        this.green = Tools.hexToNum(hexGreen);
        this.blue = Tools.hexToNum(hexBlue);

        return this;
    }

    random(){
        this.red = Tools.randomBetween(0, 255);
        this.green = Tools.randomBetween(0, 255);
        this.blue = Tools.randomBetween(0, 255);

        return this;
    }

    hsv(){
        const ranges = [Tools.round(this.red/255), Tools.round(this.green/255), Tools.round(this.blue/255)];
        const sorted = [...ranges].sort().reverse();
        const cMax = sorted[0];
        const cMin = sorted[2];
        const delta = cMax - cMin;

        // Hue calculation
        let hue;

        if(delta === 0){
            hue = 0;
        }else if(sorted[0] === ranges[0]){
            hue = 60 * (((ranges[1] - ranges[2]) / delta) % 6);
            hue = Tools.wrapAngle(hue, 0);
        }else if(sorted[0] === ranges[1]){
            hue = 60 * (((ranges[2] - ranges[0]) / delta) + 2);
        }else if(sorted[0] === ranges[2]){
            hue = 60 * (((ranges[0] - ranges[1]) / delta) + 4);
        };

        // Saturation calculation
        let saturation;

        if(cMax === Tools.round(0)){
            saturation = 0;
        }else{
            saturation = Tools.round(delta / cMax);
        };

        // Value is same as cMax
        const value = cMax;

        return{hue, saturation, value}
    }

    hex(){
        return "#" + Tools.numToHex(this.red) + Tools.numToHex(this.green) + Tools.numToHex(this.blue);
    }

    tint(color){
        this.red = Tools.clamp(this.red + color.red, 0, 255);
        this.green = Tools.clamp(this.green + color.green, 0, 255);
        this.blue = Tools.clamp(this.blue + color.blue, 0, 255);
    }

    clone(){
        return new Color(this.red, this.green, this.blue);
    }

    async init(){
        const color = this;
        return new Promise(async function(resolve){
            const similar = await(Indexer.findSimilar(color));
            color.name = similar["name"];
            resolve();
        })
    };
}

class Swatch{
    constructor(parent, color){
        this.element = document.createElement("div");
        this.element.classList.add("swatch");
        parent.appendChild(this.element);

        this.color = color;
        this.update(this.color);
    }

    createLabels(){
        const textColor = DOMHandler.textColorFromColor(this.color);

        const hexLabel = document.createElement("p");
        hexLabel.classList.add("hexLabel");
        hexLabel.innerText = this.color.hex();

        const rgbLabel = document.createElement("p");
        rgbLabel.classList.add("rgbLabel");
        rgbLabel.innerText = `rgb(${this.color.red}, ${this.color.green}, ${this.color.blue})`;

        const hsvLabel = document.createElement("p");
        const hsv = this.color.hsv();
        hsvLabel.classList.add("hsvLabel");
        hsvLabel.innerText = `hsv(${parseInt(hsv.hue)}°, ${parseInt(hsv.saturation * 100)}%, ${parseInt(hsv.value * 100)}%)`;

        const labels = [hexLabel, rgbLabel, hsvLabel];

        if(this.color.name !== undefined){
            const nameLabel = document.createElement("p");
            nameLabel.classList.add("nameLabel");
            nameLabel.innerText = this.color.name;
            labels.push(nameLabel);
        };

        labels.forEach(label => {
            label.classList.add("swatchLabel");
            label.style.color = textColor;
            this.element.appendChild(label);
        })
    }

    update(color){
        this.color = color;
        this.element.style.backgroundColor = this.color.hex();
    }
}

const ColorWheel = (() => {
    const wheel = document.getElementById("colorWheel");
    const picker = document.getElementById("picker");
    const valueInput = document.getElementById("value");

    let tracking = false;

    function _calculatePositions(){
        const rect = wheel.getBoundingClientRect();
        const center = {
            "x": rect.left + ((rect.right - rect.left) / 2),
            "y": rect.top + ((rect.bottom - rect.top) / 2)
        }

        return {
            rect,
            center
        };
    }

    function _getPickerPosition(){
        const rect = picker.getBoundingClientRect();
        const x = rect.left + 10;
        const y = rect.top + 10;

        return {x, y};   
    }

    function _calculateMouseOffset(x, y, positions){
        const el = positions;

        return{
            "rect": {
                "x": x - el.rect.left,
                "y": y - el.rect.top
            },
            "center": {
                "x": x - el.center.x,
                "y": el.center.y - y
            }
        }
    }

    function _movePicker(x, y){
        const positions = _calculatePositions();
        const diameter = (positions.rect.right - positions.rect.left);
        const posX = ((x - 10) / diameter) * 100;
        const posY = ((y - 10) / diameter) * 100;

        picker.style.top = posY + "%";
        picker.style.left = posX + "%";
    }
    
    function _calculateHS(centerOffset, positions){
        const x = centerOffset.x;
        const y = centerOffset.y;
        
        // Hue calculation
        let hue = Math.atan2(y, x) * 57.3;
        if(hue < 0){hue *= -1;}
        else{hue = Math.abs(hue - 180) + 180};
        
        // Saturation calculation
        const magnitude = Math.sqrt((x * x) + (y * y));
        const radius = (positions.rect.right - positions.rect.left) / 2;
        const saturation = Tools.clamp(magnitude / radius, 0, 1);

        return{hue, saturation}
    }

    function _track(x, y){
        const positions = _calculatePositions();
        const offsets = _calculateMouseOffset(x, y, positions);

        const hs = _calculateHS(offsets.center, positions);
        const value = valueInput.value / 100;

        const color = new Color().fromHSV(hs.hue, hs.saturation, value);

        const radius = (positions.rect.right - positions.rect.left) / 2;
        if(Math.sqrt((offsets.center.x * offsets.center.x) + (offsets.center.y * offsets.center.y)) > radius){
            positionFromHSV(color);
        }else{
            _movePicker(offsets.rect.x, offsets.rect.y);
        }

        return color;
    };

    function positionFromHSV(color){
        const hsv = color.hsv();
        // Calculate radius, (radius, radius) is the (0,0) point on the circle offsetted from the top-left.
        const positions = _calculatePositions();
        const radius = (positions.rect.right - positions.rect.left) / 2;
        // Initiate the coordinates at (1,0) unit vector, scaled by the saturation.
        let x = hsv.saturation;
        let y = 0;
        // Rotate the vector by hue. 
        const cos = Math.cos(hsv. hue / 57.3) // Math.cos() takes radians!
        const sin = Math.sin(hsv. hue / 57.3) // Math.sin() takes radians!
        const rotX = (cos * x) - (sin * y);
        const rotY = (sin * x) + (cos * y);
        // Scale and offset the vector by radius to get the position
        const posX = radius + (rotX * radius);
        const posY = radius + (rotY * radius);

        _movePicker(posX, posY);
        valueInput.value = hsv.value * 100;
    }

    function init(){
        wheel.addEventListener("mouseleave", (event) => {
            if(tracking){
                tracking = false;
                wheel.classList.remove("noCursor");
            };
        });
        wheel.addEventListener("mousedown", (event) => {
            if(!tracking){
                tracking = true;
                wheel.classList.add("noCursor");
                const color = _track(event.pageX, event.pageY);
                DOMHandler.updateColors(color);
            }
        });
        wheel.addEventListener("touchstart", (event) => {
            if(!tracking){
                tracking = true;
                wheel.classList.add("noCursor");
                const color = _track(event.touches[0].pageX, event.touches[0].pageY);
                DOMHandler.updateColors(color);
            };
        });
        wheel.addEventListener("mouseup", (event) => {
            if(tracking){
                tracking = false;
                wheel.classList.remove("noCursor");
            };
        });
        wheel.addEventListener("touchend", (event) => {
            if(tracking){
                tracking = false;
                wheel.classList.remove("noCursor");
            };
        });
        wheel.addEventListener("mousemove", (event) => {
            if(tracking){
                const color = _track(event.pageX, event.pageY);
                DOMHandler.updateColors(color);
            };
        });
        wheel.addEventListener("touchmove", (event) => {
            if(tracking){
                const color = _track(event.touches[0].pageX, event.touches[0].pageY);
                DOMHandler.updateColors(color);
            };
        });
        valueInput.oninput = () => {
            const pos = _getPickerPosition();
            const color = _track(pos.x, pos.y);
            DOMHandler.updateColors(color);
        }
    }

    return{
        init,
        positionFromHSV
    }
})();

const Indexer = (() => {
    let nameArray;

    function _calculateSimilarity(rgb, color){
        const r = rgb[0] - color.red;
        const g = rgb[1] - color.green;
        const b = rgb[2] - color.blue;

        return (0.3 * (r * r)) + (0.59 * (g * g)) + (0.11 * (b *b));
    }

    async function findMultiple(colors){
        return new Promise(function(resolve){
            let similars = [];

            colors.forEach(color => {
              similars.push([null, 999]);      
            });

            nameArray.forEach(name => {
                for(let i = 0; i < colors.length; i++){
                    const simIndex = _calculateSimilarity(name["rgb"], colors[i]);
                    if(simIndex < similars[i][1]){
                        similars[i] = [name, simIndex]
                    };
                };
            });

            resolve(similars);
        });
    }

    async function init(){
        return new Promise(function(resolve){
            fetch('./data/colors.json')
            .then((response) => response.json())
            .then((json) => {
                nameArray = json["colors"];
                resolve();
            });
        })
    }

    return{
        findMultiple,
        init
    };
})();

const ColorGenerator = (() => {
    let palette = [];
    let modifiedPalette = [];

    function _calculateValues(value, amount){
        let values = [];

        const increment = 1 / amount;
        for(let i = 0; i < amount; i++){
            values.push(Tools.wrap(value, increment * i, 0, 1));
        };

        values.sort();

        return values;
    }

    function generateColors(base, points, amount, analogous = false, analogousAngle = 0){
        palette = [];
        const display = document.getElementById("display");
        display.innerHTML = "";
        const hsv = base.hsv();
        const values = _calculateValues(hsv.value, amount);
        
        let shift;
        let mod = 1;
        if(!analogous){
            shift = 360 / points;
        }else{
            shift = analogousAngle;
        };
        
        for(let i = 0; i < points; i++){
            for(let j = 0; j < amount; j++){
                if(analogous){
                    mod = (i % 2 === 0 ? -1 : 1);
                }
                const angle = Tools.wrapAngle(hsv.hue, shift * i * mod);
                const color = new Color().fromHSV(angle, hsv.saturation, values[j]);
                palette.push(color);
            }
        };

        return palette;
    }

    function getPalette(modified){
        if(modified){
            return modifiedPalette;
        }else{
            return palette;
        };
    }

    function random(_color, amount){
            palette = [];

            for(let i = 0; i < amount; i++){
                const color = new Color().random();
                palette.push(color);
            };
    
            return palette;
    }

    function tint(color){
        modifiedPalette = [];

        palette.forEach(swatch => {
            modifiedPalette.push(swatch.clone());
        });

        modifiedPalette.forEach(async function(swatch){
            swatch.tint(color);
        });

        return modifiedPalette;
    }

    async function namePalette(){
        return new Promise(async function(resolve){
            
            const names = await(Indexer.findMultiple(modifiedPalette));

            for(let i = 0; i < modifiedPalette.length; i++){
                modifiedPalette[i].name = names[i][0]["name"];
            };
            
            resolve();
        });
    }

    return{
        generateColors,
        getPalette,
        random,
        tint,
        namePalette
    }

})();

const ImageGenerator = (() => {
    const canvas = document.getElementById("saveCanvas");

    function _download(){
        const dataUrl = canvas.toDataURL();
        const anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = "palette.png";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    function _fillCanvas(){
        const colors = ColorGenerator.getPalette(true);
        const ctx = canvas.getContext("2d");

        ctx.canvas.width = 900;
        ctx.canvas.height = 150 * (Math.ceil(colors.length / 6));
        
        let x = 0;
        let y = 0;
        colors.forEach(color => {
            ctx.fillStyle = color.hex();
            ctx.fillRect(x, y, 150, 150);
            x += 150;
            if(x >= 900){
                x = 0;
                y += 150;
            }
        });
    }

    function generate(){
        _fillCanvas();
        _download();
    }

    return{
        generate
    }
})();

const DOMHandler = (() => {

    const swatchDisplay = document.getElementById("display");
    // Generator Parameters
    const base = document.getElementById("hex");
    const points = document.getElementById("hues");
    const amount = document.getElementById("tones");
    const random = document.getElementById("randomHues");
    const analogous = document.getElementById("analogous");
    const angle = document.getElementById("analogousAngle")
    // Tint options
    const tintAlpha = document.getElementById("tintAmount");
    const tintColor = document.getElementById("tintColor");
    // HEX input
    const hexInput = document.getElementById("hex");
    // RGB input
    const rInput = document.getElementById("r");
    const gInput = document.getElementById("g");
    const bInput = document.getElementById("b");
    // HSV input
    const hInput = document.getElementById("h");
    const sInput = document.getElementById("s");
    const vInput = document.getElementById("v");
    // Export types
    const exImage = document.getElementById("exportImage");
    const exPrint = document.getElementById("exportPrint");
    const exCode = document.getElementById("exportCode");
    // Import
    const codeCheck = document.getElementById("inputCodeCheck");
    const codeInput = document.getElementById("inputCodeText");
    // Print area
    const printDisplay = document.getElementById("printDisplay");
    const printColors = document.getElementById("printColors");
    // Color scheme
    const themeToggle = document.getElementById("themeToggle");
    let theme;
    // Notification
    const notificationContainer = document.getElementById("notification");
    const notificationButton = document.getElementById("notifClose");
    const notificationText = document.getElementById("notifText");
    // Settings
    const quickTab = document.getElementById("quickTab");
    const advancedTab = document.getElementById("advancedTab");
    const quickOptions = document.getElementById("quickOptions");
    const advancedOptions = document.getElementById("advancedOptions");
    const quickButtons = [...document.querySelectorAll(".quickButton")];

    function _updateDisplay(colors){
        swatchDisplay.innerHTML = "";

        for(let i = 0; i < colors.length; i++){
            const swatch = new Swatch(swatchDisplay, colors[i]);
            swatch.createLabels();
        };
    }

    async function _generate(){
        const start = Date.now();

        if(codeCheck.checked && codeInput.value != ""){
            _parseCode(codeInput.value);
        }
        const baseColor = new Color().fromHEX(base.value);
        
        if(random.checked){
            ColorGenerator.random(baseColor, points.value);
        }else{
            ColorGenerator.generateColors(baseColor, points.value, amount.value, analogous.checked, angle.value);
        };

        _applyTint();      

        const end = Date.now();
        if(DEBUG){
            console.log("Palette generated in " + (end - start) + "ms");
        };
    }

    function _randomColor(){
        const color = new Color().random();
        ColorWheel.positionFromHSV(color);
        updateColors(color);
    }

    function _colorInput(mode){
        let color;
        switch(mode){
            case "hsv":
                color = new Color().fromHSV(hInput.value, sInput.value / 100, vInput.value / 100);
                break;
            
            case "rgb":
                color = new Color(rInput.value, gInput.value, bInput.value);
                break;

            case "hex":
                color = new Color().fromHEX(hexInput.value);
                break

            default:
                break;
        }
        ColorWheel.positionFromHSV(color);
        updateColors(color);
    }

    function _createPrintSwatches(color, index){
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

    function _export(){
        if(exPrint.checked){
            printDisplay.innerHTML = "";
            printColors.innerHTML = "";

            const palette = ColorGenerator.getPalette(true);
            for(let i = 0; i < palette.length; i++){
                const elems= _createPrintSwatches(palette[i], i + 1);
                printDisplay.appendChild(elems.displaySwatch);
                printColors.appendChild(elems.container);
            };

            window.print();
        }else if(exCode.checked){
            const code = _createCode();
            
            notificationText.innerHTML = '<b>Your code is: </b><span id="codeDisplay">' + code + '</span>';
            const codeDisplay = document.getElementById("codeDisplay");
            codeDisplay.onclick = () => {
                navigator.clipboard.writeText(codeDisplay.innerText);
                notificationText.innerHTML = "<b>Your code has been copied to your clipboard!</b>";
            };
            notificationContainer.classList.add("show")
        }else if(exImage.checked){
            ImageGenerator.generate();
        };
    }

    function _checkColorPreference(){
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

    function _toggleTheme(){
        switch(theme){
            case "dark":
                theme = "light";
                document.documentElement.style.setProperty('--background', "#F5F5F5");
                document.documentElement.style.setProperty('--foreground', "#363636");
                document.documentElement.style.setProperty('--shadow-light', "rgba(0, 0, 0, 0.2)");
                document.documentElement.style.setProperty('--shadow-dark', "rgba(0, 0, 0, 0.5)");
                document.documentElement.style.setProperty('--accent-one', "#868686");
                break;
            case "light":
                theme = "dark";
                document.documentElement.style.setProperty('--background', "#363636");
                document.documentElement.style.setProperty('--foreground', "#F5F5F5");
                document.documentElement.style.setProperty('--shadow-light', "rgba(0, 0, 0, 0.5)");
                document.documentElement.style.setProperty('--shadow-dark', "rgba(0, 0, 0, 0.8)");
                document.documentElement.style.setProperty('--accent-one', "#AFAFAF");
                break;
            case _:
                break;
        }
        themeToggle.setAttribute("src", "assets/" + theme + "Mode.png");
    }

    async function _applyTint(){
        const tintBase = new Color().fromHSV(tintColor.value, 1, 1);
        const tintAmount = tintAlpha.value / 100;

        tintColor.style.accentColor = tintBase.hex();
        
        tintBase.red = parseInt(tintBase.red * tintAmount);
        tintBase.green = parseInt(tintBase.green * tintAmount);
        tintBase.blue = parseInt(tintBase.blue * tintAmount);
        
        ColorGenerator.tint(tintBase);

        if(document.getElementById("nameColors").checked){
            await ColorGenerator.namePalette();
        }

        _updateDisplay(ColorGenerator.getPalette(true));
    }

    function _createCode(){
        let code = "";
        const params = [hexInput.value, points.value, amount.value];

        if(tintAlpha.value !== "0"){
            params.push(tintAlpha.value + ";" + tintColor.value);
        };

        if(analogous.checked){
            params.push(angle.value);
        };

        for(let i = 0; i < params.length; i++){
            code += params[i];
            if(i !== params.length - 1){
                code += "-";
            };
        };

        return code;
    }

    function _parseCode(code){
        const params = code.split("-");

        updateColors(new Color().fromHEX(params[0]));
        points.value = parseInt(params[1]);
        amount.value = parseInt(params[2]);

        if (params.length > 3){
            for(let i = 3; i < params.length; i++){
                const param = params[i].split(";");
                if(param.length > 1){
                    tintAlpha.value = parseInt(param[0]);
                    tintColor.value = parseInt(param[1]);
                }else{
                    analogous.checked = true;
                    angle.value = parseInt(param[0]);
                };
            }
        }
    }

    function _changeQuickSettings(mode){
        quickButtons.forEach(button => {
            button.classList.remove("selected");
        });

        document.getElementById(mode).classList.add("selected");

        let hue = -1;
        let tone = -1;
        let quickAngle = -1;
        let randomBool = -1;

        switch(mode){
            case "complementary":
                hue = 2;
                tone = 3;
                break;
            case "triadic":
                hue = 3;
                tone = 2;
                break;
            case "tetradic":
                hue = 4;
                tone = 2;
                break;
            case "monochrome":
                hue = 1;
                tone = 6;
                break;
            case "randomQuick":
                hue = 6;
                tone = 1;
                randomBool = 1;
                break;
            case "analogousQuick":
                hue = 3;
                tone = 2;
                quickAngle = 30;
                break;
            case _:
                break;
        };

        if(hue != -1){
            points.value = hue;
        };
        if(tone != -1){
            amount.value = tone;
        };
        if(quickAngle != -1){
            analogous.checked = true;
            analogousAngle.value = quickAngle;
        }else{
            analogous.checked = false;
        };
        if(randomBool != -1){
            random.checked = true;
        }else{
            random.checked = false;
        };

        _generate();
    }

    function textColorFromColor(color){
        const hsv = color.hsv();
        if(hsv.value < 0.4){
            return "#FEFEFE";
        }else if(Tools.isBetween(hsv.hue, 30, 200)){
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

    function updateColors(color){
        const hexCode = color.hex();
        hexInput.value = hexCode;
        
        rInput.value = color.red;
        gInput.value = color.green;
        bInput.value = color.blue;

        const hsv = color.hsv();
        hInput.value = Math.round(hsv.hue);
        sInput.value = parseInt(hsv.saturation * 100);
        vInput.value = parseInt(hsv.value * 100);
        document.documentElement.style.setProperty('--accent-two', hexCode);
        document.documentElement.style.setProperty('--accent-three', textColorFromColor(color));
    }

    function init(){
        rInput.onchange = () => _colorInput("rgb");
        gInput.onchange = () => _colorInput("rgb");
        bInput.onchange = () => _colorInput("rgb");
        hInput.onchange = () => _colorInput("hsv");
        sInput.onchange = () => _colorInput("hsv");
        vInput.onchange = () => _colorInput("hsv");
        hexInput.onchange = () => _colorInput("hex");
        tintColor.oninput = _applyTint;
        tintAlpha.onchange = _applyTint;
        document.getElementById("randomButton").onclick = _randomColor;
        document.getElementById("generateButton").onclick = _generate;
        document.getElementById("exportButton").onclick = _export;
        themeToggle.onclick = _toggleTheme;

        const helpers = [...document.getElementsByClassName("helpButton")];
        helpers.forEach(button => {
            button.addEventListener("touchstart", () => {
                button.classList.add("hover");
            })
            button.addEventListener("touchend", () => {
                button.classList.remove("hover");
            })
        });

        notificationButton.onclick = () => {
            notificationContainer.classList.remove("show");
        }

        quickTab.onclick = () => {
            quickTab.classList.add("selected");
            advancedTab.classList.remove("selected");
            quickOptions.classList.remove("hidden");
            advancedOptions.classList.add("hidden");
        }
        
        advancedTab.onclick = () => {
            quickTab.classList.remove("selected");
            advancedTab.classList.add("selected");
            quickOptions.classList.add("hidden");
            advancedOptions.classList.remove("hidden");
        }

        quickButtons.forEach(button => {
            button.onclick = () => {_changeQuickSettings(button.id)};
        });

        theme = _checkColorPreference();
        themeToggle.setAttribute("src", "assets/" + theme + "Mode.png");
        
        let initColor;
        if(theme === "dark"){
            initColor = new Color().fromHEX("#E7B03A");
        }else{
            initColor = new Color().fromHEX("#2265A4");
        }
        updateColors(initColor);
        ColorWheel.positionFromHSV(initColor);
        _generate();
    }

    return{
        init,
        updateColors,
        textColorFromColor
    }
})();

async function init(){
    await Indexer.init();
    DOMHandler.init();
    ColorWheel.init();
    document.getElementById("loader").classList.add("hide");
    fetch('../data/version.json')
    .then((response) => response.json())
    .then((json) => {document.getElementById("versionText").innerText = "v" + json["version"];});
};

addEventListener("DOMContentLoaded", () => {
    init();
    if(DEBUG){
        Tools.changelog();
    };
})