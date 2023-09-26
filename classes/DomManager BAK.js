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