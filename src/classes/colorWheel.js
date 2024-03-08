import { clamp } from "../modules/tools.js"
import { Color } from "./color.js";
import * as Elements from "../modules/elements.js"

class ColorWheel{
    constructor(parent){
        this.parent = parent;

        this.wheel = Elements.WHEEL;
        this.picker = Elements.PICKER;
        this.valueInput = Elements.VALUE_SLIDER;
        this.yScroll = 0;

        this.tracking = false;
    }

    _calculatePositions(){
        const rect = this.wheel.getBoundingClientRect();
        const center = {
            "x": rect.left + ((rect.right - rect.left) / 2),
            "y": (rect.top + ((rect.bottom - rect.top) / 2)) + this.yScroll
        }

        return {
            rect,
            center
        };
    }

    _getPickerPosition(){
        const rect = this.picker.getBoundingClientRect();
        const x = rect.left + 10;
        const y = rect.top + 10;

        return {x, y};   
    }

    _calculateMouseOffset(x, y, positions){
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

    _movePicker(x, y){
        const positions = this._calculatePositions();
        const diameter = (positions.rect.right - positions.rect.left);
        const posX = ((x - 10) / diameter) * 100;
        const posY = ((y - 10) / diameter) * 100;

        this.picker.style.top = posY + "%";
        this.picker.style.left = posX + "%";
    }
    
    _calculateHS(centerOffset, positions){
        const x = centerOffset.x;
        const y = centerOffset.y;
        
        // Hue calculation
        let hue = Math.atan2(y, x) * 57.3;
        if(hue < 0){hue *= -1;}
        else{hue = Math.abs(hue - 180) + 180};
        
        // Saturation calculation
        const magnitude = Math.sqrt((x * x) + (y * y));
        const radius = (positions.rect.right - positions.rect.left) / 2;
        const saturation = clamp(magnitude / radius, 0, 1);

        return{hue, saturation}
    }

    _track(x, y){
        const positions = this._calculatePositions();
        const offsets = this._calculateMouseOffset(x, y, positions);

        const hs = this._calculateHS(offsets.center, positions);
        const value = this.valueInput.value / 100;

        const color = new Color().fromHSV(hs.hue, hs.saturation, value);

        const radius = (positions.rect.right - positions.rect.left) / 2;
        if(Math.sqrt((offsets.center.x * offsets.center.x) + (offsets.center.y * offsets.center.y)) > radius){
            this.positionFromColor(color);
        }else{
            this._movePicker(offsets.rect.x, offsets.rect.y);
        }

        return color;
    };

    positionFromHSV(hue, saturation, value){
        // Calculate radius, (radius, radius) is the (0,0) point on the circle offsetted from the top-left.
        const positions = this._calculatePositions();
        const radius = (positions.rect.right - positions.rect.left) / 2;
        // Initiate the coordinates at (1,0) unit vector, scaled by the saturation.
        let x = saturation;
        let y = 0;
        // Rotate the vector by hue. 
        const cos = Math.cos(hue / 57.3) // Math.cos() takes radians!
        const sin = Math.sin(hue / 57.3) // Math.sin() takes radians!
        const rotX = (cos * x) - (sin * y);
        const rotY = (sin * x) + (cos * y);
        // Scale and offset the vector by radius to get the position
        const posX = radius + (rotX * radius);
        const posY = radius + (rotY * radius);

        this._movePicker(posX, posY);
    }

    positionFromColor(color){
        const hsv = color.hsv();
        this.positionFromHSV(hsv.hue, hsv.saturation, hsv.value);
    }

    init(){
        window.addEventListener("scroll", () => {
            this.yScroll = window.scrollY;
        })

        this.wheel.addEventListener("mouseleave", (event) => {
            if(this.tracking){
                this.tracking = false;
                this.wheel.classList.remove("noCursor");
            };
        });

        this.wheel.addEventListener("mousedown", (event) => {
            if(!this.tracking){
                this.tracking = true;
                this.wheel.classList.add("noCursor");
                const color = this._track(event.pageX, event.pageY);
                this.parent.updateColors(color);
            }
        });

        this.wheel.addEventListener("touchstart", (event) => {
            if(!this.tracking){
                this.tracking = true;
                this.wheel.classList.add("noCursor");
                const color = this._track(event.touches[0].pageX, event.touches[0].pageY);
                this.parent.updateColors(color);
            };
        });

        this.wheel.addEventListener("mouseup", (event) => {
            if(this.tracking){
                this.tracking = false;
                this.wheel.classList.remove("noCursor");
            };
        });

        this.wheel.addEventListener("touchend", (event) => {
            if(this.tracking){
                this.tracking = false;
                this.wheel.classList.remove("noCursor");
            };
        });

        this.wheel.addEventListener("mousemove", (event) => {
            if(this.tracking){
                const color = this._track(event.pageX, event.pageY);
                this.parent.updateColors(color);
            };
        });

        this.wheel.addEventListener("touchmove", (event) => {
            if(this.tracking){
                const color = this._track(event.touches[0].pageX, event.touches[0].pageY);
                this.parent.updateColors(color);
            };
        });
    }
}

export{ColorWheel}