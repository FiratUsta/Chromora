import { hexToNum, randomBetween, round, wrapAngle, numToHex, clamp } from "../modules/tools.js"

class Color{
    constructor(r = 0, g = 0, b = 0){
        this.red = r;
        this.green = g;
        this.blue = b;
        // 0 for main, 1 for generated hues, 2 for generated tones
        this.type = 0;
    }

    fromRGB(r, g, b){
        this.red = r;
        this.green = g;
        this.blue = b;

        return this;
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

        this.red = hexToNum(hexRed);
        this.green = hexToNum(hexGreen);
        this.blue = hexToNum(hexBlue);

        return this;
    }

    random(){
        this.red = randomBetween(0, 255);
        this.green = randomBetween(0, 255);
        this.blue = randomBetween(0, 255);

        return this;
    }

    hsv(){
        const ranges = [round(this.red/255), round(this.green/255), round(this.blue/255)];
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
            hue = wrapAngle(hue, 0);
        }else if(sorted[0] === ranges[1]){
            hue = 60 * (((ranges[2] - ranges[0]) / delta) + 2);
        }else if(sorted[0] === ranges[2]){
            hue = 60 * (((ranges[0] - ranges[1]) / delta) + 4);
        };

        // Saturation calculation
        let saturation;

        if(cMax === round(0)){
            saturation = 0;
        }else{
            saturation = round(delta / cMax);
        };

        // Value is same as cMax
        const value = cMax;

        return{hue, saturation, value}
    }

    hex(){
        return "#" + numToHex(this.red) + numToHex(this.green) + numToHex(this.blue);
    }

    tint(color){
        this.red = clamp(this.red + color.red, 0, 255);
        this.green = clamp(this.green + color.green, 0, 255);
        this.blue = clamp(this.blue + color.blue, 0, 255);
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

export{Color}