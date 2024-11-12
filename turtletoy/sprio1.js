// https://turtletoy.net/turtle/2a892789a4#stepMul=256,offset=0.7,length=52,mulX=0.9,mulY=1.0,zfreq=1.86,h=4.6,rs=1.41
// https://turtletoy.net/turtle/2a892789a4#stepMul=256,offset=1.2,length=20,mulX=0.7,mulY=0.7,zfreq=0.39,h=0.1,rs=2.15
// https://turtletoy.net/turtle/2a892789a4#stepMul=256,offset=1.2,length=20,mulX=0.7,mulY=0.7,zfreq=0.39,h=0.1,rs=2.45
// https://turtletoy.net/turtle/2a892789a4#stepMul=256,offset=1.2,length=99,mulX=0.7,mulY=0.7,zfreq=0.39,h=0.1,rs=2.63
// https://turtletoy.net/turtle/2a892789a4#stepMul=256,offset=1.2,length=52,mulX=0.7,mulY=0.7,zfreq=0.39,h=0.1,rs=2.7
// https://turtletoy.net/turtle/2a892789a4#stepMul=256,offset=1.2,length=52,mulX=0.7,mulY=0.7,zfreq=0.39,h=0.1,rs=2.67
// https://turtletoy.net/turtle/2a892789a4#stepMul=299,offset=2,length=130,mulX=0.6,mulY=0.5,zfreq=8.93,h=19.6,rs=4.9
// https://turtletoy.net/turtle/2a892789a4#stepMul=700,offset=1.4,length=197,mulX=0.6,mulY=0.6,zfreq=4.82,h=2,rs=0.95,lift=0
// https://turtletoy.net/turtle/2a892789a4#stepMul=700,offset=0,length=31,extraRot=-105,mulX=0.6,mulY=0.4,zfreq=10,h=11.6,rs=7.74,lift=0
// https://turtletoy.net/turtle/2a892789a4#stepMul=220,offset=-0.6,length=83,extraRot=-155,mulX=0.7,mulY=0.6,zfreq=4,h=106,rs=1.17,lift=0

// You can find the Turtle API reference here: https://turtletoy.net/syntax
Canvas.setpenopacity(1);

let stepMul=100;// min=2 max=512 step=1
let offset=1; // min=-2 max=2 step=0.1
let length=1; // min=1 max=200 step=1
let extraRot=0; // min=-360 max=360 step=5
let mulX=1; // min=0.1 max=3 step=0.1
let mulY=1;// min=0.1 max=3 step=0.1
let zfreq=0.51; // min=0.1 max=10 step=0.01
let h=1; // min=0.1 max=200 step=0.1
let rs=1; // min=0.1 max=10 step=0.01
let lift=0; // min=0, max=1, step=1 (No, Yes)

// Global code will be evaluated once.
const turtle = new Turtle();
turtle.penup();


function f(i, down) {
    let x = Math.cos(2 * Math.PI * i / stepMul) + offset;
    let y = Math.sin(2 * Math.PI  * i / stepMul);
    
    
    let rotk = Math.PI * 2 * (Math.floor((i + (down ? 0 : -1)) / stepMul) * rs);
    let xt=x;
    let yt=y;
    x = Math.cos(rotk)*xt-Math.sin(rotk)*yt; // buggy implementation of rotation but it makes interesting effect
    y = Math.sin(rotk)*xt-Math.cos(rotk)*yt;
    xt=x;
    yt=y;
    let realRot = 2 * Math.PI * extraRot/360;
    x = Math.cos(realRot)*xt-Math.sin(realRot)*yt;
    y = Math.sin(realRot)*xt+Math.cos(realRot)*yt;
    
    
    let t = (1+Math.cos(zfreq * 2 * Math.PI * i / stepMul))*0.5;
    let w = 1;//t;
    let z = (1-Math.cos(t * Math.PI*0.5))*0.5;
    
    x *= w * 50 * mulX;
    y *= w * 50 * mulY;
    y += (-z * h);
    
    turtle.goto(x, y);
}
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