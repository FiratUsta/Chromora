const DOMHandler = (() => {

    const swatchDisplay = document.getElementById("display");
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
    // Notification
    const notificationContainer = document.getElementById("notification");
    const notificationButton = document.getElementById("notifClose");
    const notificationText = document.getElementById("notifText");

    function _updateDisplay(colors){
        swatchDisplay.innerHTML = "";

        for(let i = 0; i < colors.length; i++){
            const swatch = new Swatch(swatchDisplay, colors[i]);
            swatch.createLabels();
        };
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

    function init(){
        document.getElementById("exportButton").onclick = _export;

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
    }

    return{
        init
    }
})();