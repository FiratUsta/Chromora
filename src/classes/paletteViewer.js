import * as Elements from "../modules/elements.js";

class PaletteViewer{
    constructor(parent){
        this.parent  = parent;
    }

    _createSwatch(color){
        const swatch = document.createElement("div");
        swatch.classList.add("viewerSwatch");
        swatch.style.backgroundColor = "" + color.hex();
        Elements.VIEWER_DISPLAY.appendChild(swatch);

        const hexLabel = document.createElement("p");
        hexLabel.classList.add("hexLabel");
        hexLabel.innerText = color.hex();

        const rgbLabel = document.createElement("p");
        rgbLabel.classList.add("rgbLabel");
        rgbLabel.innerText = `rgb(${color.red}, ${color.green}, ${color.blue})`;

        const hsvLabel = document.createElement("p");
        const hsv = color.hsv();
        hsvLabel.classList.add("hsvLabel");
        hsvLabel.innerText = `hsv(${parseInt(hsv.hue)}°, ${parseInt(hsv.saturation * 100)}%, ${parseInt(hsv.value * 100)}%)`;

        const labels = [hexLabel, rgbLabel, hsvLabel];

        if(color.name !== undefined){
            const nameLabel = document.createElement("p");
            nameLabel.classList.add("nameLabel");
            nameLabel.innerText = color.name;
            labels.push(nameLabel);
        };

        labels.forEach(label => {
            label.classList.add("swatchLabel");
            label.style.color = "" + this.parent.domManager.themer.textColorFromColor(color);
            swatch.appendChild(label);
        })
    }

    async _createSwatches(){
        const self = this;

        return new Promise(function(resolve){
            const palette = self.parent.domManager.swatchDisplay.getPalette(true);
            const buttonColor = self.parent.domManager.themer.textColorFromColor(palette[0]);
            const theme = ((buttonColor === "#363636") ? "light" : "dark");
            Elements.VIEWER_TOGGLE.setAttribute("src", "assets/" + theme + "Edit.png");
            palette.forEach(color => {
                self._createSwatch(color);
            });
            resolve();
        });
    }

    async _prepare(){
        const self = this;

        return new Promise(async function(resolve){
            Elements.VIEWER_DISPLAY.innerHTML = "";
            await self._createSwatches();
            Elements.VIEWER_MAIN.classList.add("show");
            resolve();
        });
    }

    async _show(){
        await this._prepare();
        Elements.VIEWER_MAIN.classList.add("show");
    }

    init(){
        Elements.VIEWER_BUTTON.onclick = () => {this._show()};
        Elements.VIEWER_TOGGLE.onclick = () => {Elements.VIEWER_MAIN.classList.remove("show")};
    }
}

export{PaletteViewer}