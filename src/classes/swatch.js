class Swatch{
    constructor(parent, color, textColor){
        this.parent = parent;
        this.focused = false;
        this.locked = false;
        this.edited = false;

        this.element = document.createElement("div");
        this.element.classList.add("swatch");
        this.element.onmouseover = () => this.parent.focus(this);
        this.parent.display.appendChild(this.element);
        
        this.color = color;
        this.textColor = textColor;
        this.labels = [];
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