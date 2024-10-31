import * as Elements from "../modules/elements.js";

class Swatch{
    constructor(parent, color, textColor){
        this.parent = parent;
        this.focused = false;
        this.locked = false;
        this.edited = false;
        this.customName = "";

        this.element = document.createElement("div");
        this.element.classList.add("swatch");
        this.element.addEventListener("contextmenu", (event) => {
            const colorBeingEdited = !(Array.from(Elements.SWATCH_DISPLAY.querySelectorAll(".editMode")).length === 0);
            if(this.focused){
                if(this.element.classList.contains("editMode")){
                    event.preventDefault();
                    this.element.classList.remove("editMode");
                    Elements.SWATCH_DISPLAY.classList.remove("editMode");
                }else if(!colorBeingEdited){
                    event.preventDefault();
                    this.element.classList.add("editMode");
                    Elements.SWATCH_DISPLAY.classList.add("editMode");
                }
            }
        })
        this.element.onmouseover = () => this.parent.focus(this);
        this.parent.display.appendChild(this.element);
        
        this.color = color;
        this.textColor = textColor;
        this.labels = [];
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
        this.parent.parent.parent.exporter.checkRestrictions();
    }

    dismiss(){
        this.parent.display.removeChild(this.element);
    }

    createEditPanel(){
        const editPanel = document.createElement("div");
        editPanel.classList.add("swatchEditPanel");
        editPanel.innerHTML = `
        <div class="swatchInput">
            <p>Name</p>
            <p>:</p>
            <input type="text">
        </div>
        <div class="swatchInput">
            <p>HEX</p>
            <p>:</p>
            <input type="text">
        </div>
        <div class="swatchInput">
            <p>RGB</p>
            <p>:</p>
            <div class="swatchInputsContainer">
                <input type="number">
                <input type="number">
                <input type="number">
            </div>
        </div>
        <div class="swatchInput">
            <p>HSV</p>
            <p>:</p>
            <div class="swatchInputsContainer">
                <input type="number">
                <input type="number">
                <input type="number">
            </div>
        </div>
        `
        this.element.appendChild(editPanel);

        return editPanel;
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
            label.style.color = this.textColor;
            this.element.appendChild(label);
        })

        this.updateLabels();
    }

    updateLabels(){
        const hsv = this.color.hsv();

        this.labels[0].innerText = this.color.hex();
        this.labels[1].innerText = `rgb(${this.color.red}, ${this.color.green}, ${this.color.blue})`;
        this.labels[2].innerText = `hsv(${parseInt(hsv.hue)}°, ${parseInt(hsv.saturation * 100)}%, ${parseInt(hsv.value * 100)}%)`;
        if(this.color.name !== undefined){
            this.labels[4].innerText = this.color.name;
        };
    }

    update(color){
        this.color = color;
        this.element.style.backgroundColor = this.color.hex();
    }
}

export{Swatch}