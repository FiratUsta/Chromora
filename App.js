import { ColorGenerator } from "./classes/ColorGenerator.js";
import { DomManager } from "./classes/DomManager.js";
import { Debugger } from "./modules/Debugger.js";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./app/serviceWorker.js");
};

const app = (() => {
    const colorGenerator    = new ColorGenerator();
    const domManager        = new DomManager();

    async function init(){
        // Initialize the modules
        await colorGenerator.init();

        domManager.init();

        await colorGenerator.generatePalette();

        // Hide loading screen
        document.getElementById("loader").classList.add("hide");

        // Display version
        fetch('./data/version.json')
        .then((response) => response.json())
        .then((json) => {document.getElementById("versionText").innerText = "v" + json["version"];});

        // Display DEBUG
        Debugger.debugMessage();
    };

    return{
        init
    }
})();

addEventListener("DOMContentLoaded", () => {
    app.init();
})