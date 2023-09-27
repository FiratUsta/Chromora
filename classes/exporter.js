const ImageGenerator = (() => {
    const canvas = document.getElementById("saveCanvas");

    function _download(){
        const dataUrl = canvas.toDataURL();
        const anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = "palette.png";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    function _fillCanvas(){
        const colors = ColorGenerator.getPalette(true);
        const ctx = canvas.getContext("2d");

        ctx.canvas.width = 900;
        ctx.canvas.height = 150 * (Math.ceil(colors.length / 6));
        
        let x = 0;
        let y = 0;
        colors.forEach(color => {
            ctx.fillStyle = color.hex();
            ctx.fillRect(x, y, 150, 150);
            x += 150;
            if(x >= 900){
                x = 0;
                y += 150;
            }
        });
    }

    function generate(){
        _fillCanvas();
        _download();
    }

    return{
        generate
    }
})();