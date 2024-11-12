// Forked from "Spiro 1" by kabacis
// https://turtletoy.net/turtle/2a892789a4

// You can find the Turtle API reference here: https://turtletoy.net/syntax
Canvas.setpenopacity(1);
let stepMul=256;// min=2 max=512 step=1
let offset=-0.7; // min=-1 max=1 step=0.1
let length=57; // min=1 max=200 step=1
let extraRot=-100; // min=-360 max=360 step=5
let a2 = 68; // min=0 max=90 step=1
let scaleX=0.4; // min=0.3 max=1.3 step=0.1
let zfreq=1; // min=0.1 max=10 step=0.01
let z_phase_offset=-0.5; // min=-1 max=1 step=0.05
let h=191; // min=0.0 max=200 step=0.1
let rs=5.65; // min=0.1 max=10 step=0.01
let rVarF = 2.77; //  min=0.01 max=10 step=0.01
let rVar = 0.337; //  min=0.0 max=4 step=0.001
let lift=0; // min=0, max=1, step=1 (No, Yes)
let verticalOffset = -20; // min=-50, max=50, step=1
let stemL  = 81; // min=0, max=100, step=1
let stemB = 3; // min = 0, max=100, step=1

// Global code will be evaluated once.
const turtle = new Turtle();
turtle.penup();


function f(i, down) {
    let x = Math.cos(2 * Math.PI * i / stepMul) + offset;
    let y = Math.sin(2 * Math.PI  * i / stepMul);
    
    
    let rotk = Math.PI * 2 * (Math.floor((i + (down ? 0 : -1)) / stepMul) * rs);
    let xt=x;
    let yt=y;
    x = Math.cos(rotk)*xt-Math.sin(rotk)*yt;
    y = Math.sin(rotk)*xt+Math.cos(rotk)*yt;

    let rvarA = Math.PI * 2 * (Math.floor((i + (down ? 0 : -1)) / stepMul) * rVarF);
    let r2 = 1 + Math.sin(rvarA) * rVar;
    
    x *= r2;
    y *= r2;
    
    
    let realRot = 2 * Math.PI * extraRot/360;
    xt=x;
    yt=y;
    x = Math.cos(realRot)*xt-Math.sin(realRot)*yt;
    y = Math.sin(realRot)*xt+Math.cos(realRot)*yt;
    
    
    let t = (1+Math.cos(zfreq * 2 * Math.PI * i / stepMul))*0.5;
    let w = 1;//t;
    let z = (1-Math.cos(Math.PI*(t*0.5 + z_phase_offset)))*0.5;
    
    x *= scaleX * w;
    y *= scaleX * w;
    z *= h * scaleX;
    
    x *= 50;
    y = 50 * y * Math.cos(Math.PI * a2 / 180) - z * Math.sin(Math.PI * a2 / 180);
    
    y += verticalOffset;
    
    turtle.goto(x, y);
}

turtle.goto(0, verticalOffset);
turtle.pendown();
for (var j=0;j<stepMul; j++) {
   turtle.goto(stemB*Math.sin(j/stepMul*Math.PI), verticalOffset+stemL*j/stepMul);    
}
turtle.goto(0, verticalOffset+stemL);
turtle.penup();
// The walk function will be called until it returns false.
function walk(i) {
    let i2 = i-1;
   
    let first = ((i2 % stepMul) == 0);
    let last = (((i2+1) % stepMul) == 0);
    
    f(i2, true);
    if (first) { turtle.pendown(); } 
    if (last) {
        f(i2+1, false);
        if (lift) {
            turtle.penup();
        }
    }

    return i < length * stepMul;
}