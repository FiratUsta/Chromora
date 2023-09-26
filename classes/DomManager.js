import { Themer } from "./Themer.js";
import { ColorWheel } from "./ColorWheel.js";

class DomManager{
    constructor(){
        this.colorWheel = new ColorWheel(this);
        this.themer = new Themer;
    }

    bindElements(){

    }

    init(){
        this.colorWheel.init();
    }
}

export{DomManager}