const DOMHandler = (() => {
    // Import
    const codeCheck = document.getElementById("inputCodeCheck");
    const codeInput = document.getElementById("inputCodeText");

    function _parseCode(code){
        const params = code.split("-");

        updateColors(new Color().fromHEX(params[0]));
        points.value = parseInt(params[1]);
        amount.value = parseInt(params[2]);

        if (params.length > 3){
            for(let i = 3; i < params.length; i++){
                const param = params[i].split(";");
                if(param.length > 1){
                    tintAlpha.value = parseInt(param[0]);
                    tintColor.value = parseInt(param[1]);
                }else{
                    analogous.checked = true;
                    angle.value = parseInt(param[0]);
                };
            }
        }
    }

})();