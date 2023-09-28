class Swatch{
    constructor(parent, color, textColor){
        this.parent = parent;
        this.focused = false;

        this.element = document.createElement("div");
        this.element.classList.add("swatch");
        this.element.onmouseover = () => this.parent.focus(this);
        this.parent.display.appendChild(this.element);
        
        this.color = color;
        this.textColor = textColor;
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

    dismiss(){
        this.parent.display.removeChild(this.element);
    }

    createLabels(){
        const hexLabel = document.createElement("p");
        hexLabel.classList.add("hexLabel");
        hexLabel.innerText = this.color.hex();
        hexLabel.onclick = () => this._copyInformation("hex");

        const rgbLabel = document.createElement("p");
        rgbLabel.classList.add("rgbLabel");
        rgbLabel.innerText = `rgb(${this.color.red}, ${this.color.green}, ${this.color.blue})`;
        rgbLabel.onclick = () => this._copyInformation("rgb");

        const hsvLabel = document.createElement("p");
        const hsv = this.color.hsv();
        hsvLabel.classList.add("hsvLabel");
        hsvLabel.innerText = `hsv(${parseInt(hsv.hue)}°, ${parseInt(hsv.saturation * 100)}%, ${parseInt(hsv.value * 100)}%)`;
        hsvLabel.onclick = () => this._copyInformation("hsv");

        const lockLabel = document.createElement("p");
        lockLabel.classList.add("lockLabel");
        lockLabel.onclick = () => {
            if(this.focused){
                this._toggleLock();
            }
        };

        const labels = [hexLabel, rgbLabel, hsvLabel, lockLabel];

        if(this.color.name !== undefined){
            const nameLabel = document.createElement("p");
            nameLabel.classList.add("nameLabel");
            nameLabel.innerText = this.color.name;
            nameLabel.onclick = () => this._copyInformation("name");
            labels.push(nameLabel);
        };

        labels.forEach(label => {
            label.classList.add("swatchLabel");
            label.style.color = this.textColor;
            this.element.appendChild(label);
        })
    }

    update(color){
        this.color = color;
        this.element.style.backgroundColor = this.color.hex();
    }
}

export{Swatch}