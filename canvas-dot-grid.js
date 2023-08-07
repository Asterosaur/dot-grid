

//БРАТЬ СПИСОК ПО КЛАССУ И ЗАПУСКАТЬ ДЛЯ КАЖДОГО КАНВАСА
const canvas = document.getElementById("canvas")



const ctx = canvas.getContext("2d");
let gridSize = parseInt(canvas.getAttribute("grid_size"));
let fps = parseInt(canvas.getAttribute("fps"));

if (isNaN(gridSize)) { gridSize = 50 };
if (isNaN(fps)) { fps = 60 };

let cols = canvas.width / gridSize;
let rows = canvas.height / gridSize;

let offset = gridSize / 2;

let currentFrame = 0;

let sample = new Image();
let sampleCanvas = document.createElement("canvas");

let sampleCtx = sampleCanvas.getContext("2d");
let sampleGrid = [];



//берем картинку для подсчета радиусов точек
sample.src = canvas.getAttribute("data-sample");
sample.addEventListener("load", () => {

    let cell_width = sample.width/cols;
    let cell_height = sample.height/rows;
    
    let offset_x = cell_width/2;
    let offset_y = cell_height/2;

    sampleCanvas.width = sample.width;
    sampleCanvas.height = sample.height;

    sampleCtx.drawImage(sample, 0, 0);

    let red = 0;

    for (let i = 0; i < rows; i++) {
        let row = [];

        for (let j = 0; j < cols; j++) {

            red = sampleCtx.getImageData(j*cell_width+offset_x,i*cell_height+offset_y,1,1).data[0]/255;
            row.push(red);

        }

        sampleGrid.push(row)
    }

    console.log(sampleGrid);
    animate();
});

//переделать под разные канвасы
const drawCircle = (x, y, radius, color = "#ffffff") => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
}


const drawGrid = () => {
    let x, y = 0;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {

            y = i * gridSize + offset;
            x = j * gridSize + offset;

            let radius = Math.abs(Math.sin((currentFrame % 628) / 100)) * offset * (sampleGrid[i][j] ?? 0);

            if (sampleGrid[i][j] > 0.1) {
                drawCircle(x, y, radius);
            }
        }
    }
}

const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    currentFrame++;

}

function animate() {
    loop();
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000 / fps);
}

