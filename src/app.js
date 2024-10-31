import { AboutDisplay } from "./classes/aboutDisplay.js";
import { ColorGenerator } from "./classes/colorGenerator.js";
import { DomManager } from "./classes/domManager.js";
import { Exporter } from "./classes/exporter.js";
import { Indexer } from "./classes/indexer.js";
import { NotificationManager } from "./classes/notificationManager.js";
import { PaletteViewer } from "./classes/paletteViewer.js";
import { Debugger } from "./modules/debugger.js";
import * as Elements from "./modules/elements.js";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistration()
    .then((registration) => {
        if(registration){
            registration.update();
        };
    });
    navigator.serviceWorker.register("./serviceWorker.js");
};

class App{
    constructor(){
        this.indexer        = new Indexer(this);
        this.colorGenerator = new ColorGenerator(this);
        this.domManager     = new DomManager(this);
        this.exporter       = new Exporter(this);
        this.notifier       = new NotificationManager(this);
        this.aboutDisplay   = new AboutDisplay(this);
        this.paletteViewer  = new PaletteViewer(this);
    }

    async init(){
        // Import code from the URL if it exists
        const location = window.location;
        if(location.search !== "" && location.hash !== ""){
            Elements.CHECK_IMPORT.checked = true;
            Elements.IMPORT_CODE.value = location.hash;
        }
        
        // Initialize the modules
        await this.indexer.init();
        this.colorGenerator.init();
        this.domManager.init();
        this.exporter.init();
        this.paletteViewer.init();

        // Generate initial palette
        await this.colorGenerator.generatePalette();

        // Hide loading screen
        Elements.LOADING_SCREEN.classList.add("hide");

        // Display version
        fetch('./data/version.json')
        .then((response) => response.json())
        .then((json) => {
            Elements.VERSION_TEXT.innerText = "v" + json["version"];
            this.aboutDisplay.init(json["changelog"]);
        });

        // Display DEBUG
        Debugger.debugMessage();
    }
}

addEventListener("DOMContentLoaded", () => {
    const app = new App();
    app.init();
})