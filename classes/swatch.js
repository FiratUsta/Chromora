class Swatch{
    constructor(parent, color, textColor){
        this.element = document.createElement("div");
        this.element.classList.add("swatch");
        parent.appendChild(this.element);

        this.color = color;
        this.textColor = textColor;
        this.update(this.color);
    }

    createLabels(){
        const hexLabel = document.createElement("p");
        hexLabel.classList.add("hexLabel");
        hexLabel.innerText = this.color.hex();

        const rgbLabel = document.createElement("p");
        rgbLabel.classList.add("rgbLabel");
        rgbLabel.innerText = `rgb(${this.color.red}, ${this.color.green}, ${this.color.blue})`;

        const hsvLabel = document.createElement("p");
        const hsv = this.color.hsv();
        hsvLabel.classList.add("hsvLabel");
        hsvLabel.innerText = `hsv(${parseInt(hsv.hue)}°, ${parseInt(hsv.saturation * 100)}%, ${parseInt(hsv.value * 100)}%)`;

        const labels = [hexLabel, rgbLabel, hsvLabel];

        if(this.color.name !== undefined){
            const nameLabel = document.createElement("p");
            nameLabel.classList.add("nameLabel");
            nameLabel.innerText = this.color.name;
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