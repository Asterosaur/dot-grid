let gridCanvasList = document.querySelectorAll(".grid_canvas");

gridCanvasList.forEach(element => {
    const ctx = element.getContext("2d");
    element.gridSize = parseInt(element.getAttribute("grid_size"));
    element.fps = parseInt(element.getAttribute("fps"));
    element.speed = parseInt(element.getAttribute("speed"));
    element.currentFrame = parseInt(element.getAttribute("start"));
    element.autoplay = element.hasAttribute("autoplay");
    let angle = parseFloat(element.getAttribute("angle"));



    //Здесь инициализируем значения для анимации

    if (isNaN(element.gridSize)) { element.gridSize = 50 };
    if (isNaN(element.fps)) { element.fps = 60 };
    if (isNaN(element.speed)) { element.speed = 1 };
    if (isNaN(element.currentFrame)) { element.currentFrame = 0 };
    if (isNaN(angle)) { angle = 180 };

    let theta = (180 - angle) * (Math.PI / 180);
    element.cosTheta = Math.cos(theta);
    element.sinTheta = Math.sin(theta);

    console.log(angle, theta, element.cosTheta, element.sinTheta)

    element.cols = element.width / element.gridSize;
    element.rows = element.height / element.gridSize;

    element.offset = element.gridSize / 2;

    let sample = new Image();
    let sampleCanvas = document.createElement("canvas");

    let sampleCtx = sampleCanvas.getContext("2d");
    sampleCtx.willReadFrequently = true;
    element.sampleGrid = [];


    //здесь грузим и анализируем картинку
    sample.src = element.getAttribute("data-sample");
    sample.addEventListener("load", () => {

        let cell_width = sample.width / element.cols;
        let cell_height = sample.height / element.rows;

        let offset_x = cell_width / 2;
        let offset_y = cell_height / 2;

        sampleCanvas.width = sample.width;
        sampleCanvas.height = sample.height;

        sampleCtx.drawImage(sample, 0, 0);


        for (let i = 0; i < element.rows; i++) {
            let row = [];

            for (let j = 0; j < element.cols; j++) {
                let data = sampleCtx.getImageData(j * cell_width + offset_x, i * cell_height + offset_y, 1, 1).data;


                let r = data[0].toString(16);
                let g = data[1].toString(16);
                let b = data[2].toString(16);

                if (r.length == 1)
                    r = "0" + r;
                if (g.length == 1)
                    g = "0" + g;
                if (b.length == 1)
                    b = "0" + b;

                row.push(["#" + r + g + b, data[3] / 255]);

            }

            element.sampleGrid.push(row);
        }

        drawGrid();
        animate();
    });


    const drawCircle = (x, y, radius, color = "#ffffff") => {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }

    const drawGrid = () => {

        let x, y = 0;

        for (let i = 0; i < element.rows; i++) {
            for (let j = 0; j < element.cols; j++) {

                let phase = j / element.cols * element.cosTheta + i / element.rows * element.sinTheta;

                y = i * element.gridSize + element.offset;
                x = j * element.gridSize + element.offset;

                let radius = Math.abs(Math.sin((element.currentFrame % 628) / 100 + phase)) * element.offset * (element.sampleGrid[i][j][1] ?? 0);

                if (element.sampleGrid[i][j][1] > 0.1) {
                    drawCircle(x, y, radius, element.sampleGrid[i][j][0]);
                }
            }
        }
    }


    const loop = () => {

        ctx.clearRect(0, 0, element.width, element.height);
        drawGrid();
        element.currentFrame += element.speed;

    }

    const animate = () => {

        loop();
        setTimeout(() => {
            if (element.animating || element.autoplay) { requestAnimationFrame(animate) };
        }, 1000 / element.fps);

    }

    if (!element.autoplay) {

        element.addEventListener("pointerenter", (event) => {

            element.animating = true;
            animate();
        });

        element.addEventListener("pointerout", (event) => {

            element.animating = false;

        });

    }

});



