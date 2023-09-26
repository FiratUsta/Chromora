import { ColorGenerator } from "./classes/ColorGenerator.js";
import { DomManager } from "./classes/DomManager.js";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./app/serviceWorker.js");
};

const DEBUG = true;

const app = (() => {
    const colorGenerator    = new ColorGenerator();
    const domManager        = new DomManager();

    async function init(){
        // Initialize the modules
        await colorGenerator.init();

        domManager.init();

        console.log(colorGenerator.generateColors())

        // Hide loading screen
        document.getElementById("loader").classList.add("hide");

        // Display version
        fetch('./data/version.json')
        .then((response) => response.json())
        .then((json) => {document.getElementById("versionText").innerText = "v" + json["version"];});
    };

    return{
        init
    }
})();

addEventListener("DOMContentLoaded", () => {
    app.init();
    
    if(DEBUG){
        fetch('./data/version.json')
        .then((response) => response.json())
        .then((json) => {
            const version = json["version"];
            const changes = json["changelog"];
            let msg = "Color Thing by Fırat Usta v" + version + "\nChangelog:";
            changes.forEach(change => {
                msg += "\n    -" + change;
            })
            console.log(msg);
    
            const debugText = document.createElement("p");
            debugText.classList.add("debugLabel");
            debugText.innerText = "DEBUG BUILD VERSION v" + version;
            document.body.appendChild(debugText);
        });
    };
})