class Notification{
    constructor(content, clickable = false, method = null){
        this.content    = content;
        this.clickable  = clickable;
        this.method     = method;
        this.dismissed  = false;

        this._init();
    }

    _createElements(){
        this.container = document.createElement("div");
        this.container.classList.add("notifContainer");
        
        const notifContent = document.createElement("p");
        notifContent.classList.add("notifContent");
        if(this.clickable){
            notifContent.classList.add("clickable");
        }
        notifContent.innerHTML = this.content;
        this.container.appendChild(notifContent);

        const notifButton = document.createElement("p");
        notifButton.classList.add("notifButton");
        notifButton.innerText = "×";
        this.container.appendChild(notifButton);

        document.body.appendChild(this.container);

        return{
            "button": notifButton,
            "content": notifContent
        }
    }

    _bindMethods(elements){
        elements["button"].onclick = () => this.dismiss();
        if(this.clickable){
            elements["content"].onclick = () => this.method.call();
        };
    }

    _show(){
        this.container.classList.add("show");
    }

    _init(){
        const elements = this._createElements();
        this._bindMethods(elements);
        this._show();
    }

    dismiss(){
        this.container.classList.remove("show");
        this.dismissed = true;
        document.body.removeChild(this.container);
    }
}

class NotificationManager{
    constructor(parent){
        this.parent = parent;
        this.lastNotification = null;
    }

    push(content, clickable = false, method = null){
        if(this.lastNotification !== null && this.lastNotification.dismissed === false){
            this.lastNotification.dismiss();
        };

        const newNotification = new Notification(content, clickable, method);
        this.lastNotification = newNotification;

        return newNotification;
    }
}

export{NotificationManager}