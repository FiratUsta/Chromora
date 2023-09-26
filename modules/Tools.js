function numToHex(num){
    const letters = ["A", "B", "C", "D", "E", "F"];

    const x = (Math.floor(num / 16) < 10 ? Math.floor(num / 16) : letters[Math.floor(num / 16) - 10]);
    const y = (num % 16 < 10 ? num % 16 : letters[num % 16 - 10]);

    return String(x) + String(y);
}

function hexToNum(hex){
    const letters = {"A": 10, "B": 11, "C": 12, "D": 13, "E": 14, "F": 15};
    let num = 0;

    for(let i = 0; i < hex.length; i++){
        const char = hex.charAt(i).toUpperCase();
        let base;
        const power =  hex.length - 1 - i;
        if(char in letters){
            base = letters[char];
        }else{
            base = parseInt(char);
        }
        num += base * (16 ** power);
    }

    return num;
}

function round(float){
    return Math.round(float * 100) / 100;
}

function randomBetween(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function wrap(left, right, min, max){
    let result = left + right;
    if(result > max || result < min){result += -max * Math.sign(left + right)};
    return result;
}

function wrapAngle(left, right){
    return wrap(left, right, 0, 360);
}

function clamp(value, min, max){
    return Math.max(min, Math.min(value, max));
}

function isBetween(value, min, max){
    return (min <= value && value <= max);
};

function changelog(){
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

export {
    numToHex,
    hexToNum,
    round,
    randomBetween,
    wrap,
    wrapAngle,
    clamp,
    isBetween,
    changelog
}