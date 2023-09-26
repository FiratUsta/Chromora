if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./app/serviceWorker.js");
};

const DEBUG = true;

async function init(){
    await Indexer.init();
    DOMHandler.init();
    ColorWheel.init();
    document.getElementById("loader").classList.add("hide");
    fetch('./data/version.json')
    .then((response) => response.json())
    .then((json) => {document.getElementById("versionText").innerText = "v" + json["version"];});
};

addEventListener("DOMContentLoaded", () => {
    init();
    if(DEBUG){
        Tools.changelog();
    };
})