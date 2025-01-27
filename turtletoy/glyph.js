//https://turtletoy.net/turtle/85de2a6339
// You can find the Turtle API reference here: https://turtletoy.net/syntax
Canvas.setpenopacity(1);

let scale = 2.19;//  min=0.1 max=20 step=0.01
let columns = 8;// min = 1 max=100 step=1
let rows = 9;// min = 1 max=100 step=1
let spacing = 18; // min = 1 max=200 step=1
let lines = 1; // min=0, max=1, step=1, (Main, All)
let distPow = 1.9; // min = 0.5 max=5 step=0.01
let bend = 3.42;// min=0 max=10 step=0.01
let bendLimit = 3.93;// min=0 max=10 step=0.01
let lineDist = 2.5; // min=0 max=10 step=0.01

// Global code will be evaluated once.
const turtle = new Turtle();
const positions = [[0, 0], [1, 0], [2, 0], 
[0, 1], [1, 1], [2, 1],
[0, 2], [1, 2], [2, 2], 
[1, 3]
];

// 0 1 2
// 3 4 5
// 6 7 8
//   9
const groups = [
    [3, 0, 4, 6],
    [4, 1, 5, 7, 3],
    [5, 2, 4, 8],
    [7, 4, 8, 9, 6]
];

const NB = [
  [[1, 3], [4]],
  [[2,4,0],[5,3]],
  [[5,1],[4]],
  [[0,4,6],[1, 7]],
  [[1,5,7,3],[2,8,0,6]],
  [[2,4,8],[1,7]],
  [[3,7],[4,9]],
  [[4,8,9,6],[3,5]],
  [[5,7],[4,9]],
  [[7],[6,8]],
];

function i_to_dpos(i, p0)
{
    const p = positions[i];
    return [(p[0]-1) * scale + p0[0], (p[1]-1) * scale + p0[1]];
}

function edge_id(a, b) {
    return a < b ? 10 * a + b : 10 * b + a;
}

function draw_shape(shape)
{
    const p = turtle.pos();
    for (var i=0; i<10; i++) {
        if (shape & (1<<i)) {
            let p1 = i_to_dpos(i, p);
            
            const nbi = NB[i];
            let used = [];
            let hasEdge = false;
            for (const i2 of nbi[0])  {
                let p2 = i_to_dpos(i2, p);
                
                if (shape & (1 << i2)) {
                    let edgeID = edge_id(i, i2);
                    if (edgeID in used) {
                        continue;
                    }
                    used[edgeID] = true;
                    
                    turtle.jump(p1);
                    turtle.pendown();
                    turtle.goto(p2);
                    hasEdge = true;
                }
            }
            if (!hasEdge) {
                for (const i2 of nbi[1])  {
                    let p2 = i_to_dpos(i2, p);
                    
                    if (shape & (1 << i2)) {
                        let edgeID = edge_id(i, i2);
                        if (edgeID in used) {
                            continue;
                        }
                        used[edgeID] = true;
                        
                        turtle.jump(p1);
                        turtle.pendown();
                        turtle.goto(p2);
                        hasEdge = true;
                    }
                }   
            }
            if(!hasEdge) {
                let r = scale * 0.2;
                turtle.setheading(0);
                turtle.jump(p1[0], p1[1]-r);
                turtle.pendown();
                turtle.circle(r);
                //turtle.forward(scale * 0.3);
                //turtle.circle(scale * 0.2);
            }
        }
        if (lines > 0 && ((shape & (1<<i)) == 0)) {
            let p1 = i_to_dpos(i, p);
            
            const nbi = NB[i];
            let used = [];
            let hasEdge = false;
            for (const i2 of nbi[0])  {
                let p2 = i_to_dpos(i2, p);
                
                if ((shape & (1 << i2)) == 0) {
                    let edgeID = edge_id(i, i2);
                    if (edgeID in used) {
                        continue;
                    }
                    used[edgeID] = true;
                    
                    turtle.jump(p1);
                    turtle.pendown();
                    turtle.goto(p2);
                    hasEdge = true;
                }
            }
            
        }
    }
}



function next_states(state) {
    let result = [];
    for (const action of groups) {
        if (state & (1 << action[0])) {
            let s2 = state;
            let tmpBits=[];
            for (let i=1; i<action.length; i++) {
                if (state & (1 << action[i])) {
                    tmpBits.push(1);
                } else {
                    tmpBits.push(0);
                }
                s2 &= ~(1<<action[i]);
            }
            tmpBits.push(tmpBits.shift());
            for (let i=1; i<action.length; i++) {
                if (tmpBits[i-1] > 0) {
                    s2 |= (1<<action[i]);
                }
            }
            result.push(s2);
        }
        
    }
    return Array.from(new Set(result));
}

let visited = [];
let q = [0x77];
let rc = [0, 0];

let states = [];
let states2 = [];

function dist(a, b, order) {
    let i1 = order.indexOf(a);   
    let i2 = order.indexOf(b);
    let x1 = i1 % columns;
    let y1 = Math.floor(i1 / columns);
    let x2 = i2 % columns;
    let y2 = Math.floor(i2 / columns);
    let dx = Math.abs(x1-x2);
    let dy = Math.abs(y1-y2);
    //return dx+dy;
    //return dx*dx+dy*dy;
    let d= Math.sqrt(dx*dx+dy*dy)
    return Math.pow(d, distPow);
}

function dist_v(a, order) {
    let res = 0;
    
    //
    for (const n of states[a]) {
        //console.log(`sd ${a} ${n}`)
        res += dist(a, n, order);
    }
    for (const n of states2[a]) {
        //console.log(`sd ${a} ${n}`)
        res += dist(a, n, order);
    }
    if (a == 0x77) {
     //   console.log(`zzzzzzdd 0x77 ${res} ${order.indexOf(a)}`);
    }
    //console.log(`tmp ${res}`);
    return res;
}

function slerp(a, b, t) {
    return t*b + (1-t)*a;
}

function xydist(a, b) {
    let dx = a[0]-b[0];
    let dy = a[1]-b[1];
    return Math.sqrt(dx*dx+dy*dy);
}

// The walk function will be called until it returns false.
function walk(i) {
    let order = [];
    visited[0x77] = true;
    while (q.length > 0) {
        let s1 = q.shift();
        let neighbours = next_states(s1);
        states[s1] = neighbours;
        for (const state of neighbours){
            if (!(state in states2)) {
                states2[state]=[];
            }
            states2[state].push(s1);
            if (visited[state]) {
                continue;
            }
            visited[state] = true;
            q.push(state);
        }
        order.push(s1);
    }
    let fillers = -1;
    while (order.length < rows*columns) {
        order.push(fillers);
        states[fillers] = [];
        states2[fillers] = [];
        fillers -= 1;
    }
    /*for (let i = order.length - 1; i >= 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        if (j >= i) {
            j = 0;
        }
        let temp = order[i];
        order[i] = order[j];
        order[j] = temp;
    }*/
    let dst =0;
    for (let i=0; i<order.length; i++) {
        //console.log(`wtf ${i} ${order[i]}`);
        dst += dist_v(order[i], order);
    }
    console.log("optimizing --------------")
    for (let x=0; x<15; x++) {
        //console.log(`>>>>>>>>> ${x}`);
        for (let i=0; i<order.length; i++) {
            for (let j=0; j<order.length; j++) {
                //console.log(`pos |${i} ${j}| v:${order[i]} ${order[j]}`);
                let d1 = dist_v(order[i], order) + dist_v(order[j], order);
                let temp = order[i];
                order[i] = order[j];
                order[j] = temp;
                let d2 = dist_v(order[i], order) + dist_v(order[j], order);
               // console.log(`d1: ${d1} d2:${d2}`);
                if (d2 >= d1) {
                    let temp = order[i];
                    order[i] = order[j];
                    order[j] = temp;
                } else {
                   // console.log(`tmpswpa ${d1}->${d2} ${i} ${j} ${order[i]} ${order[j]}`);
                }
            }
        }
        /*let dst2 =0;
        for (let i=0; i<order.length; i++) {
            dst2 += dist_v(order[i], order);
        }*/
        //console.log(`opt ${x} ${dst2}`);
    }
    console.log("AAAAAAAAAA optim")
    let index = 0;
    for (let r=0; r<rows; r++) {
        for (let c=0; c<columns; c++) {
            if (index >= order.length) {
                continue;
            }
            let p = [c * spacing - (columns-1)*spacing*0.5, 
                        r * spacing - (rows-1)*spacing*0.5];
            turtle.jump(p);
            if (order [index] > 0){
            draw_shape(order[index]);
            
            //console.log(`N: ${states[order[index]]}`);
            for (let j=0; j<order.length; j++) {
                if (states[order[index]].includes(order[j])) {
                    //console.log(`${order[index]} -> ${order[j]}`)
                    
                    if (index == j) {
                        continue;
                    }
                    let c2 = j % columns;
                    let r2 = Math.floor(j/ columns);
                    //console.log(`${order[j]} ${c2} ${r2}`);
                    
                    let p1 = p;
                    let p2 = [c2 * spacing - (columns-1)*spacing*0.5, 
                        r2 * spacing - (rows-1)*spacing*0.5];
                    
                    let dx = p2[0] -p1[0];
                    let dy = p2[1] -p1[1];
                    if (Math.abs(r-r2) ==1 && Math.abs(c-c2) == 1) {
                        if (p1[1] < p2[1]) {
                            p1[1] += 2 * scale;
                        } else {
                            p2[1] += 2 * scale;
                        }
                    }

                    turtle.jump(p);
                    for (let t=0; t<1; t += (1.0/128.0)) {
                        
                        let px =slerp(p1[0], p2[0], t);
                        let py =slerp(p1[1], p2[1], t);
                        let shift = bend*scale * (1 - 4 * ((t-0.5)*(t-0.5))) * Math.min(bendLimit, (((Math.abs(dx)+Math.abs(dy)) / spacing)-1));
                        if (Math.abs(dx) < Math.abs(dy)) {
                            px += shift;
                        } else {
                            py -= shift;
                        }
                        if (xydist(p, [px, py]) < scale*lineDist ||
                            xydist(p2, [px, py]) < scale*lineDist ) {
                            turtle.penup();       
                        } else {
                            turtle.pendown();
                        }
                        turtle.goto(px, py);
                    }
                    turtle.goto(p2);
                }
            }
                
            }
            index++;
        }
    }
    return false;   
}

/*function walk(i) {
    if (q.length <= 0) {
        return false;
    }
    if (rc[1] >= columns) {
        rc[1] = 0;
        rc[0] += 1;
    }
    if (rc[0] >= rows) {
        return false;
    }
    let s1 = q.shift();
    turtle.jump([rc[1] * spacing - (columns-1)*spacing*0.5, 
                 rc[0] * spacing - (rows-1)*spacing*0.5]);
    draw_shape(s1);
    let neighbours = next_states(s1);
    for (const state of neighbours){
        if (state in visited) {
            continue;
        }
        visited[state] = true;
        q.push(state);
    }
    rc[1] += 1;
    //turtle.jump(0, 0);
    //draw_shape(0x77);
    return true;
}*/