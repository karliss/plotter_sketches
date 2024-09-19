// You can find the Turtle API reference here: https://turtletoy.net/syntax
// https://turtletoy.net/turtle/1dedb7c6d0
Canvas.setpenopacity(1);

let size = 5; // min=1 max=100 step=0.1

let W=15; // min = 1 max = 100 step=1
let H=W;
let symetry_mode = 2; // min=1 max=2 step=1 (rot6, rot6+mirror)

// Global code will be evaluated once.
const turtle = new Turtle();


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
    rotDeg(deg) {
        const a = deg*Math.PI/180;
        const s = Math.sin(a);
        const c = Math.cos(a);
        return new V2(this.x*c-this.y*s, this.x*s+this.y*c);
    }
    asPair() {
        return [this.x, this.y];
    }
    outp() {
        return this.flipy().mul(size).asPair();
    }
}

const DVX = new V2(Math.sqrt(3), 0);
const DVY = new V2(Math.sqrt(3)/2, -3/2);

function hexToPixel(hexpos)
{
    return DVX.mul(hexpos.x).add(DVY.mul(hexpos.y));
}
function hexRotate(hp, n=1) {
    for (let i=0; i<n; i++) {
        let q=hp.x, r=hp.y;
        let s = -q-r;
        hp = new V2(-r, -s);
    }
    return hp;
}
let corners=[]
for (let i=0; i<6; i++) {
    let a = (30+60*i)/180*Math.PI;
    corners.push(new V2(Math.cos(a), Math.sin(a)));
}
const DHEX = [
    new V2(1, 0), new V2(1, -1), new V2(0, -1), new V2(-1, 0), new V2(-1, 1), new V2(0, 1)  
];

function side(p1, p2) {
    return corners[p1].mul(2).add(corners[p2]).mul(1/3);
}
let loops = [
    [side(0, 5),  new V2(Math.sqrt(3)/2-1/(Math.sqrt(3)*6), 0), side(5, 0)],
    [side(0, 5),  (corners[0].add(corners[5]).add(corners[1])).mul(1/3), side(0, 1)],
    [side(0, 5), side(1, 2)],
    [side(0, 5), side(2, 3)],
    [side(0, 5), side(3, 4)],
    [side(0, 5), side(4, 5).add(corners[0].sub(corners[5]).mul(2/3)), side(4, 5)],
];
function randInt(maxExclusive) {
    return Math.min(Math.floor(Math.random()*maxExclusive), maxExclusive-1);
}
//console.log(corners);
//console.log(loops);

class PlacedTile {
    constructor(tile, dir) {
        this.tile = tile;
        this.dir = dir % 6;
    }
    drawAt(pos) {
        let pv2 = hexToPixel(pos);
        let p = [];
        for (let i=0; i<6; i++) {
            //if (i != 2) continue;
            p = [];
            let d = (i+this.dir)%6;
            let g0 = this.tile.connections[d];
            let d2 = (d+1)%6;
            if (g0 > 0) {
                while (this.tile.connections[d2] != g0) {
                    d2 = (d2+1)%6;
                }    
            } else {
                d2 = d;
            }
           // console.log(d2);
            let k = (d2 - d + 6) % 6;
            //console.log(loops[k]);
            loops[k].forEach((v) => {
                p.push(v.rotDeg(60 * i));
            });
            turtle.jump(pv2.add(p[0]).outp());
            for (let i=1; i<p.length; i++) {
                turtle.goto(pv2.add(p[i]).outp());
            }
        }
    }
    mirror1() {
        let connections = this.tile.connections.slice(0);
        //connections.push(this.tile.connections[0]);
        connections.reverse();
        let tile2 = new Tile(connections, this.tile.symetry);
        return tile2.place(6-this.dir);
        
    }
}

class Tile {
    constructor(connections, symetry) {
        this.connections = connections;
        this.symetry = symetry;
    }
    
    isSymetric(dir, rot=0) {
        dir += rot;
        return this.symetry[dir % 3] > 0;
    }
    
    fullSymetry() {
        return this.symetry[0]+this.symetry[1]+this.symetry[2] == 3;
    }
    angledSymetry() {
        return this.symetry[3] > 0;
    }
    place(dir) {
        return new PlacedTile(this, dir);
    }
    
    
}

const tiles = [
    new Tile([1,1,1,1,1,1], [1, 1, 1, 1]),
    new Tile([0,0,0,0,0,0], [1, 1, 1, 1]),
    new Tile([1,1,2,2,3,3], [0, 0, 0, 1]), // othersymb
    new Tile([1,2,2,1,3,3], [1, 0, 0, 0]) ,
    new Tile([1,0,0,1,0,0], [1, 0, 0, 0]) ,
    new Tile([1,1,0,1,0,1], [1, 0, 0, 0]) ,
    new Tile([0,1,1,0,2,2], [1, 0, 0, 0]),
    new Tile([0,1,1,0,1,1], [1, 0, 0, 0]),
    new Tile([1,2,2,1,0,1], [0, 0, 0, 0]),
    new Tile([1,1,1,0,0,1], [0, 0, 0, 1]),
    new Tile([1,1,2,3,3,2], [0, 0, 0, 1]),
];





//turtle.penup();
//turtle.goto(0, 0);

let data=[];
turtle.pendown();
for (let y=0; y<H; y++) {
    let line = [];
    for (let x=0; x<W; x++) {
        if (symetry_mode == 2 && x < y) {
            let v = data[x][y];
            line.push(v.mirror1());
            continue;
        }
        let candidates = [];
        tiles.forEach((t) => {
            let good = true;
            if ((x == 0 && y == 0)) {
                good = t.fullSymetry();
            }  else if (x == y) {
                good = t.angledSymetry();
            } else if (y == 0) {
                good = t.isSymetric(0);
            }
            if (good) {
                candidates.push(t);
            }
        });
        if (x+y > W) {
            candidates = [tiles[1]];
        }
        let rot = 0;
        let tile = candidates[randInt(candidates.length)];
        if (y == 0 && x > 0) {
            rot = randInt(2)*3;
        } else if (x == y) {
            rot = 1+randInt(2)*3;
        }else  {
            rot = randInt(6);
        }
        let pt = tile.place(rot);
        line.push(pt);
    }
    data.push(line);
}
for (let x=0; x<W; x++) {
    for (let y=0; y<H; y++) {
        let t = data[y][x];
        let maxr = (x+y == 0) ? 1 : 6;
        if (y > 0 && x==0) {
            continue;
        }
        for (let r=0; r<maxr; r++) {
            let p2 = hexRotate(new V2(x, y), r);
            let d2 = data[y][x].tile.place((t.dir+r+6)%6);
            d2.drawAt(p2);
        }
        
    }
}
/*for (let x=0; x<W; x++) {
    let line = [];
    for (let y=0; y<H; y++) {
        let t = tiles[randInt(tiles.length)].place(randInt(6)).drawAt(new V2(x, y));
    }
}*/

// The walk function will be called until it returns false.
function walk(i) {
    return false;
    //turtle.forward(5);
    //turtle.right(144);
    //return i < 4;
}
