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
            if(char in letters){
                num += letters[char] * 16;
            }else{
                num += parseInt(char) * 16;
            }
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
        if(result > max || result < min){result += -max * Math.sign(left, right)};
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

    return{
        numToHex,
        hexToNum,
        round,
        randomBetween,
        wrap,
        wrapAngle,
        clamp,
        isBetween
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
        const hexRed = hex.substring(1, 2);
        const hexGreen = hex.substring(3, 4);
        const hexBlue = hex.substring(5, 6);

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
        const sorted = [...ranges].sort((a, b) => {return a < b});
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
}

class Swatch{
    constructor(parent, color){
        this.element = document.createElement("div");
        this.element.classList.add("swatch");
        parent.appendChild(this.element);

        this.color = color;
        this.update(this.color);
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

        _movePicker(offsets.rect.x, offsets.rect.y);

        return new Color().fromHSV(hs.hue, hs.saturation, value);
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
        wheel.addEventListener("mouseup", (event) => {
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

const ColorGenerator = (() => {

    function _calculateValues(value, amount){
        let values = [];

        const increment = 1 / amount;
        for(let i = 0; i < amount; i++){
            values.push(Tools.wrap(value, increment * i, 0, 1));
        }

        values.sort();

        return values;
    }

    function generateColors(base, points, amount){
        const display = document.getElementById("display");
        display.innerHTML = "";
        const hsv = base.hsv();
        const values = _calculateValues(hsv.value, amount);
        const shift = 360 / points;

        const colors = [];

        for(let i = 0; i < points; i++){
            for(let j = 0; j < amount; j++){
                const color = new Color().fromHSV(Tools.wrapAngle(hsv.hue, shift * i), hsv.saturation, values[j]);
                colors.push(color);
            }
        }

        colors.forEach(color => {
            new Swatch(display, color);
        });

        // return colors;
    }

    function random(_color, amount){
        const colors = []

        for(let i = 0; i < amount; i++){
            const color = new Color().random();
            colors.push(color);
        }

        return colors;
    }

    function init(){

    }

    return{
        init,
        generateColors,
        random
    }

})();

const DOMHandler = (() => {

    const swatchDisplay = document.getElementById("display");
    const base = document.getElementById("hexval");
    const points = document.getElementById("points");
    const amount = document.getElementById("amount");
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

    function _generate(){
        swatchDisplay.innerHTML = "";

        const baseColor = new Color().fromHEX(base.value);
        const colors = ColorGenerator.generateColors(baseColor, points.value, amount.value);

        for(let i = 0; i < colors.length; i++){
            const swatch = new Swatch(swatchDisplay, colors[i]);
        };
    }

    function _randomColor(){
        const color = new Color().random();
        ColorWheel.positionFromHSV(color);
        updateColors(color);
    }

    function updateColors(color){
        const hexCode = color.hex();
        hexInput.value = hexCode;
        
        rInput.value = color.red;
        gInput.value = color.green;
        bInput.value = color.blue;

        const hsv = color.hsv();
        hInput.value = Math.round(hsv.hue);
        sInput.value = hsv.saturation * 100;
        vInput.value = hsv.value * 100;
        document.documentElement.style.setProperty('--accent-two', hexCode);
        if(Tools.isBetween(hsv.hue, 50, 200)){
            if(hsv.value < 0.7){
                document.documentElement.style.setProperty('--accent-three', "#FEFEFE");
            }else{
                document.documentElement.style.setProperty('--accent-three', "#363636");
            };
        }else{
            if(hsv.saturation > 0.6 || hsv.value < 0.7){
                document.documentElement.style.setProperty('--accent-three', "#FEFEFE");
            }else{
                document.documentElement.style.setProperty('--accent-three', "#363636");
            };
        }
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

    function init(){
        // document.getElementById("generate").onclick = _generate;
        rInput.onchange = () => _colorInput("rgb");
        gInput.onchange = () => _colorInput("rgb");
        bInput.onchange = () => _colorInput("rgb");
        hInput.onchange = () => _colorInput("hsv");
        sInput.onchange = () => _colorInput("hsv");
        vInput.onchange = () => _colorInput("hsv");
        hexInput.onchange = () => _colorInput("hex");
        document.getElementById("randomButton").onclick = () => _randomColor();
    }

    return{
        init,
        updateColors
    }
})();

addEventListener("DOMContentLoaded", () => {
    DOMHandler.init();
    ColorWheel.init();
})