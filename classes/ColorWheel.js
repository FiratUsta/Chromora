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