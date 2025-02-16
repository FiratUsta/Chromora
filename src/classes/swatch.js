import * as Elements from "../modules/elements.js";

class Swatch{
    constructor(parent, color){
        this.parent = parent;
        this.focused = false;
        this.locked = false;
        this.edited = false;
        this.customName = "";
        
        this.color = color;
        this.tempColor;
        this.textColor;
        this.labels = [];

        this.previousSwatch = null;
        this.nextSwatch = null;

        this.element = document.createElement("div");
        this.element.classList.add("swatch");
        this.element.addEventListener("contextmenu", (event) => {
            const colorBeingEdited = !(Array.from(Elements.SWATCH_DISPLAY.querySelectorAll(".editMode")).length === 0);
            if(this.focused){
                event.preventDefault();
                if(this.element.classList.contains("editMode")){
                    this.element.classList.remove("editMode");
                    Elements.SWATCH_DISPLAY.classList.remove("editMode");
                }else if(!colorBeingEdited){
                    this.element.classList.add("editMode");
                    this.tempColor = this.color.clone();
                    Elements.SWATCH_DISPLAY.classList.add("editMode");
                }
            }
        })
        this.element.onmouseover = () => this.parent.focus(this);
        this.parent.display.appendChild(this.element);

        this.editPanel = this.createEditPanel();
        
        this.update(this.color);
    }

    _copyInformation(info){
        if(this.focused){
            const notifier = this.parent.getNotificationManager();
            const information = this.element.querySelector("." + info + "Label").innerText;
            navigator.clipboard.writeText(information);
            notifier.push("<b>Copied to clipboard: </b>" + information);
        }
    }

    _toggleLock(){
        this.element.querySelector(".lockLabel").classList.toggle("locked");
        this.locked = !this.locked;
    }

    _delete(){
        this.dismiss();
        const index = this.parent.swatches.indexOf(this);
        if (index !== -1) {
            this.parent.swatches.splice(index, 1);
        };
        if(this.previousSwatch != null){
            this.previousSwatch.nextSwatch = this.nextSwatch;
        };
        if(this.nextSwatch != null){
            this.nextSwatch.previousSwatch = this.previousSwatch;
        };
        this.parent.toggleGradient();
    }

    _calculateColorMixMidpoint(color1, color2){
        const differenceR = Math.abs(color1.red - color2.red);
        const differenceG = Math.abs(color1.green - color2.green);
        const differenceB = Math.abs(color1.blue - color2.blue);

        const newR = color1.red < color2.red ? color1.red + (differenceR / 2) : color2.red + (differenceR / 2);
        const newG = color1.green < color2.green ? color1.green + (differenceG / 2) : color2.green + (differenceG / 2);
        const newB = color1.blue < color2.blue ? color1.blue + (differenceB / 2) : color2.blue + (differenceB / 2);

        return `${newR},${newG},${newB}`;
    }

    _calculateGradient(){
        let returnString;
        let prevColorMidpoint;
        let nextColorMidpoint;


        if(this.previousSwatch !== null){
            prevColorMidpoint = this._calculateColorMixMidpoint(this.color, this.previousSwatch.color);
        }
        if(this.nextSwatch !== null){
            nextColorMidpoint = this._calculateColorMixMidpoint(this.color, this.nextSwatch.color);
        }

        if(this.previousSwatch === null && this.nextSwatch !== null){
            returnString = `linear-gradient(180deg, rgb(${this.color.asString("rgb")}) 0%, rgb(${nextColorMidpoint}) 100%)`;
        }else if(this.previousSwatch !== null && this.nextSwatch !== null){
            returnString = `linear-gradient(180deg, rgb(${prevColorMidpoint}) 0%, rgb(${this.color.asString("rgb")})  50%, rgb(${nextColorMidpoint}) 100%)`;
        }else if(this.previousSwatch !== null && this.nextSwatch === null){
            returnString = `linear-gradient(180deg, rgb(${prevColorMidpoint}) 0%, rgb(${this.color.asString("rgb")}) 100%)`;
        }
        return returnString;
    }

    dismiss(){
        this.parent.display.removeChild(this.element);
    }

    // This entire thing is very hacky and ugly, I should rework this at some point.
    createEditPanel(){
        // Create
        const editPanel = document.createElement("div");
        editPanel.classList.add("swatchEditPanel");
        editPanel.innerHTML = `
        <div class="swatchInput">
            <p>Name</p>
            <p>:</p>
            <input type="text" class="swatchNameInput">
        </div>
        <div class="swatchInput">
            <p>HEX</p>
            <p>:</p>
            <input type="text" class="swatchHexInput">
        </div>
        <div class="swatchInput">
            <p>RGB</p>
            <p>:</p>
            <div class="swatchInputsContainer">
                <input type="number" class="swatchRedInput">
                <input type="number" class="swatchGreenInput">
                <input type="number" class="swatchBlueInput">
            </div>
        </div>
        <div class="swatchInput">
            <p>HSV</p>
            <p>:</p>
            <div class="swatchInputsContainer">
                <input type="number" class="swatchHueInput">
                <input type="number" class="swatchSaturationInput">
                <input type="number" class="swatchValueInput">
            </div>
        </div>
        <div class="swatchButtons">
            <img src="./assets/duplicate.svg" class="swatchButton duplicateButton">
            <img src="./assets/revert.svg" class="swatchButton revertButton">
            <img src="./assets/delete.svg" class="swatchButton deleteButton">
        </div>
        `
        this.element.appendChild(editPanel);

        const indexer = this.parent.parent.parent.indexer;
        const exporter = this.parent.parent.parent.exporter;

        const inputRed = editPanel.querySelector(".swatchRedInput");
        const inputGreen = editPanel.querySelector(".swatchGreenInput");
        const inputBlue = editPanel.querySelector(".swatchBlueInput");
        [inputRed, inputGreen, inputBlue].forEach((input) => {
            input.onchange = () => {
                this.color.fromRGB(inputRed.value, inputGreen.value, inputBlue.value);
                this.color.name = indexer.findName(this.color);
                this.update(this.color);
                this.updateLabels();
                exporter.checkRestrictions();
            };
        })

        const inputHue = editPanel.querySelector(".swatchHueInput");
        const inputSaturation = editPanel.querySelector(".swatchSaturationInput");
        const inputValue = editPanel.querySelector(".swatchValueInput");
        [inputHue, inputSaturation, inputValue].forEach((input) => {
            input.onchange = () => {
                this.color.fromHSV(inputHue.value, inputSaturation.value / 100.0, inputValue.value / 100.0);
                this.color.name = indexer.findName(this.color);
                this.update(this.color);
                this.updateLabels();
                exporter.checkRestrictions();
            };
        })

        const inputHex = editPanel.querySelector(".swatchHexInput");
        inputHex.onchange = () => {
            let hexValue = inputHex.value;
            if(hexValue[0] !== "#"){
                hexValue = "#" + hexValue;
            }
            this.color.fromHEX(hexValue);
            this.color.name = indexer.findName(this.color);
            this.update(this.color);
            this.updateLabels();
            exporter.checkRestrictions();
        };
        inputHex.oninput = () => {
            if(inputHex.value === ""){
                inputHex.value = "#";
            };
        };

        const inputName = editPanel.querySelector(".swatchNameInput");
        inputName.onchange = () => {
            if(inputName.value === ""){
                if(this.color.customName !== undefined){
                    delete this.color.customName;
                };
            }else if(this.color.customName === undefined){
                this.color.customName = inputName.value;
            }else if(inputName.value !== this.color.customName){
                this.color.customName = inputName.value;
            };
            this.updateLabels();
            exporter.checkRestrictions();
        };

        const duplicateButton = editPanel.querySelector(".duplicateButton");
        const revertButton = editPanel.querySelector(".revertButton");
        const deleteButton = editPanel.querySelector(".deleteButton");

        duplicateButton.onclick = () => {
            const color = this.color.clone();
            color.name = indexer.findName(color);
            const dupe = new Swatch(this.parent, color);
            const lastSwatch = this.parent.swatches[this.parent.swatches.length - 1];
            dupe.previousSwatch = lastSwatch
            lastSwatch.nextSwatch = dupe;
            dupe.createLabels();
            this.parent.swatches.push(dupe);
            exporter.checkRestrictions();
            this.parent.toggleGradient();
        }

        revertButton.onclick = () => {
            this.color = this.tempColor;
            this.color.name = indexer.findName(this.color);
            this.update(this.color);
            this.updateLabels();
            exporter.checkRestrictions();
        }

        deleteButton.onclick = () => {
            this._delete();
            Elements.SWATCH_DISPLAY.classList.remove("editMode");
            exporter.checkRestrictions();
        }

        return editPanel;
    }

    updateEditInputs(){
        const inputRed = this.editPanel.querySelector(".swatchRedInput");
        inputRed.value = this.color.red;
        const inputGreen = this.editPanel.querySelector(".swatchGreenInput");
        inputGreen.value = this.color.green;
        const inputBlue = this.editPanel.querySelector(".swatchBlueInput");
        inputBlue.value = this.color.blue;

        const{hue, saturation, value} = this.color.hsv();

        const inputHue = this.editPanel.querySelector(".swatchHueInput");
        inputHue.value = parseInt(hue);
        const inputSaturation = this.editPanel.querySelector(".swatchSaturationInput");
        inputSaturation.value = parseInt(saturation * 100);
        const inputValue = this.editPanel.querySelector(".swatchValueInput");
        inputValue.value = parseInt(value * 100);

        const inputHex = this.editPanel.querySelector(".swatchHexInput");
        inputHex.value = this.color.hex();

        const inputName = this.editPanel.querySelector(".swatchNameInput");
        if(this.color.customName !== undefined){
            inputName.value = this.color.customName;
        }else if(this.color.name !== undefined){
            inputName.value = this.color.name;
        }
    }

    createLabels(){
        const hexLabel = document.createElement("p");
        hexLabel.classList.add("hexLabel");
        hexLabel.onclick = () => this._copyInformation("hex");

        const rgbLabel = document.createElement("p");
        rgbLabel.classList.add("rgbLabel");
        rgbLabel.onclick = () => this._copyInformation("rgb");

        const hsvLabel = document.createElement("p");
        hsvLabel.classList.add("hsvLabel");
        hsvLabel.onclick = () => this._copyInformation("hsv");

        const nameLabel = document.createElement("p");
        nameLabel.classList.add("nameLabel");
        nameLabel.onclick = () => this._copyInformation("name");

        const lockLabel = document.createElement("p");
        lockLabel.classList.add("lockLabel");
        lockLabel.onclick = () => {
            if(this.focused){
                this._toggleLock();
            }
        };

        this.labels = [hexLabel, rgbLabel, hsvLabel, lockLabel, nameLabel];

        this.labels.forEach(label => {
            label.classList.add("swatchLabel");
            this.element.appendChild(label);
        })

        this.updateLabels();
    }

    updateLabels(){
        const hsv = this.color.hsv();

        this.labels[0].innerText = this.color.hex();
        this.labels[1].innerText = `rgb(${this.color.red}, ${this.color.green}, ${this.color.blue})`;
        this.labels[2].innerText = `hsv(${parseInt(hsv.hue)}°, ${parseInt(hsv.saturation * 100)}%, ${parseInt(hsv.value * 100)}%)`;
        if(this.color.customName !== undefined){
            this.labels[4].innerText = this.color.customName;
        }else if(this.color.name !== undefined){
            this.labels[4].innerText = this.color.name;
        };

        this.labels.forEach(label => {
            label.style.color = this.textColor;
        })

        this.updateEditInputs();
    }

    toggleGradient(){
        if(Elements.GRADIENT_CHECKBOX.checked){
            this.element.style.background = this._calculateGradient();
        }else{
            this.element.style.background = this.color.hex();
        };
    }

    update(color){
        this.color = color;
        this.element.style.background = this.color.hex();
        this.textColor = this.parent.parent.themer.textColorFromColor(this.color);
        this.parent.toggleGradient();
    }
}

export{Swatch}