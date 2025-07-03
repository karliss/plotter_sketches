import fs from 'fs';

export class TestTurtle
{
    constructor(outputname="output.svg") {
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.pen = false;
        this.started = false;
        this.log = (outputname == "-");
        this.outputname = outputname;
        this.buffer = "";


        this.startSVG();
    }
    print(x){
        if (this.log) {
            console.log(x);
        } else {
            this.buffer += x;
        }
    }
    startSVG() {
        this.print(String.raw`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="180mm"
   height="180mm"
   viewBox="-90 -90 180 180"
   version="1.1"
   id="svg1"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
    <rect id="bg" x="-90" y="-90" width="180" height="180" style="fill:#ffffff;stroke:none"/>
    <path style="fill: none;stroke: #000000;stroke-width: 0.3;stroke-linecap: round;stroke-linejoin: round;"
       d="`);
    }
    finishSVG() {
        this.print(String.raw`"
       id="path1" />
</svg>`);
        if (!this.log && this.outputname) {
            let fd = fs.openSync(this.outputname, "w");
            fs.writeFileSync(fd, this.buffer);
            this.buffer = "";
            fs.closeSync(fd);
        }
    }
    jump(x, y=undefined) {
        if (y === undefined) {
            y = x[1];
            x = x[0];
        }
        this.x = x;
        this.y = y;
        this.started = false;
    }
    pendown(){
        this.pen = true;
    }
    penup() {
        this.pen = false;
    }
    forward(x) {
        this.goto(this.x + Math.sin(this.angle)*x, this.y + Math.cos(this.angle)*x);
    }
    backward(x) {
        this.goto(this.x - Math.sin(this.angle)*x, this.y - Math.cos(this.angle)*x);
    }
    right(x) {
        this.angle -= x;
    }
    left(x) {
        this.angle += x;
    }
    setheading(x) {
        this.angle = x;
    }
    goto(x, y=undefined){
        if (y === undefined) {
            y = x[1];
            x = x[0];
        }
        //this.print(` (${this.x};${this.y}) => (${x};${y})`);
        if (this.pen) {
            if (!this.started) {
                this.print(`M${this.x},${this.y}L`);
                this.started = true;
            }
            this.print(`${x},${y}\n`)
        } else {
            this.started = false;
        }
        this.x = x;
        this.y = y;
    }
}