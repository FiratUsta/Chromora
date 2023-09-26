import { clamp } from "../modules/Tools.js"
import { Color } from "./Color.js";

class ColorWheel{
    constructor(){
        this.wheel = document.getElementById("colorWheel");
        this.picker = document.getElementById("picker");
        this.valueInput = document.getElementById("value");

        this.tracking = false;
    }

    _calculatePositions(){
        const rect = this.wheel.getBoundingClientRect();
        const center = {
            "x": rect.left + ((rect.right - rect.left) / 2),
            "y": rect.top + ((rect.bottom - rect.top) / 2)
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
        const positions = _calculatePositions();
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
        const positions = _calculatePositions();
        const offsets = _calculateMouseOffset(x, y, positions);

        const hs = _calculateHS(offsets.center, positions);
        const value = this.valueInput.value / 100;

        const color = new Color().fromHSV(hs.hue, hs.saturation, value);

        const radius = (positions.rect.right - positions.rect.left) / 2;
        if(Math.sqrt((offsets.center.x * offsets.center.x) + (offsets.center.y * offsets.center.y)) > radius){
            positionFromHSV(color);
        }else{
            _movePicker(offsets.rect.x, offsets.rect.y);
        }

        return color;
    };

    positionFromHSV(color){
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
        this.valueInput.value = hsv.value * 100;
    }

    init(domManager){
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
                const color = _track(event.pageX, event.pageY);
                domManager.updateColors(color);
            }
        });

        this.wheel.addEventListener("touchstart", (event) => {
            if(!this.tracking){
                this.tracking = true;
                this.wheel.classList.add("noCursor");
                const color = _track(event.touches[0].pageX, event.touches[0].pageY);
                domManager.updateColors(color);
            };
        });

        this.wheel.addEventListener("mouseup", (event) => {
            if(this.tracking){
                this.tracking = false;
                wheel.classList.remove("noCursor");
            };
        });

        this.wheel.addEventListener("touchend", (event) => {
            if(this.tracking){
                this.tracking = false;
                wheel.classList.remove("noCursor");
            };
        });

        this.wheel.addEventListener("mousemove", (event) => {
            if(this.tracking){
                const color = _track(event.pageX, event.pageY);
                domManager.updateColors(color);
            };
        });

        this.wheel.addEventListener("touchmove", (event) => {
            if(this.tracking){
                const color = _track(event.touches[0].pageX, event.touches[0].pageY);
                domManager.updateColors(color);
            };
        });
        
        this.valueInput.oninput = () => {
            const pos = _getPickerPosition();
            const color = _track(pos.x, pos.y);
            domManager.updateColors(color);
        }
    }
}

export{ColorWheel}