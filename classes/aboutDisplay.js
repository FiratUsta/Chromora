import * as Elements from "../modules/elements.js";

class AboutDisplay{
    constructor(parent){
        this.parent = parent;
    }

    _updateChangelog(changelog){
        changelog.forEach(change => {
            const el = document.createElement("li");
            el.innerText = change;
            Elements.ABOUT_CHANGELOG.appendChild(el);
        });
    }

    init(changelog){
        this._updateChangelog(changelog);
        Elements.ABOUT_BUTTON_C.onclick = () => {
            Elements.ABOUT_DISPLAY.classList.remove("show");
            Elements.DIMMER.classList.remove("show");
        };
        Elements.ABOUT_BUTTON_O.onclick = () => {
            Elements.ABOUT_DISPLAY.classList.add("show");
            Elements.DIMMER.classList.add("show");
        }
    }
}

export{AboutDisplay}