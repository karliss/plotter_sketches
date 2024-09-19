// You can find the Turtle API reference here: https://turtletoy.net/syntax
// https://turtletoy.net/turtle/5c7899fc39

Canvas.setpenopacity(1);

// Global code will be evaluated once.
const turtle = new Turtle();
turtle.penup();


const SIZE = 200;
const SIZE_HALF = 100;

class V2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(b) { return new V2(this.x + b.x, this.y + b.y); }
    sub(b) { return new V2(this.x - b.x, this.y - b.y); }
    mul(b) { return new V2(this.x  * b, this.y * b); }
    flipx() { return new V2(-this.x, this.y); }
    flipy() { return new V2(this.x, -this.y); }
}
function deg2rad(a) { return a / 180 * Math.PI; }
const v1 = new V2(Math.sin(deg2rad(60)), Math.cos(deg2rad(60)));

let dimension_mode = 1; // min=1 max=2 step=1 (rows_columns, width_height)
let rows = 11; // min=1 max=100 step=2
let cols = 10; // min=1 max=100 step=1
let width = 210; // min = 10 max=500 step=1
let height = 297; // min = 10 max=500 step=1
let edge_length = 10; // min=1 max=100 step=1
let l = edge_length;

const v1s = v1.mul(l);

if (dimension_mode == 2) {
    rows = Math.floor((height - v1s.y) / (l + v1s.y));
    if (rows % 2 == 0) {
        rows -= 1;
    }
    cols = Math.floor(width  / (2 * v1s.x));
}


const vert = new V2(0, -l);


let p = (new V2(Math.floor(0) * v1s.x * 2, 0)).add(new V2(-SIZE_HALF + v1s.x, SIZE_HALF - 0 - v1s.y));
turtle.goto(p.x, p.y);
turtle.pendown();
// The walk function will be called until it returns false.
function walk(i) {
    if (i < cols) {
        for (let d=0; d<2; d++) {
            let v = v1s.mul(-1);
            let down = vert;
            if (d % 2) {
                v = v.mul(-1);
                down = down.mul(-1);
            }
            for (let j=0; j<rows; j++) {
                if (j % 2 == 0) {
                    if (!(d==0 && j==0)) {
                        p = p.add(v);
                        turtle.goto(p.x, p.y);
                    }
                    p = p.add(down);    
                    turtle.goto(p.x, p.y);
                    if (!(d==1 && j==rows-1)){
                      p = p.add(v.flipx());
                      turtle.goto(p.x, p.y);
                    }
                } else {
                    p = p.add(down);    
                    turtle.goto(p.x, p.y);
                }
            }
        }
        return true;
    } else {
        for (let j=0; j<cols; j++) {
            console.log(j);
            p = p.add(v1s.flipx());
            turtle.goto(p.x, p.y);
            p = p.add(v1s.mul(-1));
            turtle.goto(p.x, p.y);
        }
        turtle.penup();
        return false;
    }
}


