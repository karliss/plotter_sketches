// https://turtletoy.net/turtle/0f50d67501
let turtle = null;

let rows = 16; // min=1, max=256, step=1,
let cols = 16; // min=1, max=256, step=1
let SIZE = 16; // min=1, max=256, step=0.1
let subdiv = 64; // min=1, max=1024, step=1
let subdivExtra = 1; // min=0, max=1, step=1

let H = Math.sqrt(3)/2;

let scene = null;

// 0      5 3
//2 4      1

let DIR_SIDES = [
    [0, 1], [3, 4], [2, 3], [5, 0], [4, 5], [1, 2]
];

let SIDE_DIRECTIONS = [
    [0, 1, 3, 4],
    [0, 1, 3, 4],
    [0, 2, 3, 5],
    [0, 2, 3, 5],
    [1, 5, 4, 2],
    [1, 5, 4, 2]
];

let REVERSE_SIDE_DIRECTIONS = [
    [0, 1, 2, 3, 4, 5],
    [0, 1,-1, 2, 3,-1],
    [0, 1,-1, 2, 3,-1],
    [0,-1, 1, 2,-1, 5],
    [0,-1, 1, 2,-1, 5],
    [-1,0, 3,-1, 2, 1],
    [-1,0, 3,-1, 2, 1],
]


class Tile {
    constructor(d) {
        this.dir = d;
        /** @type {[Tile]} */
        this.neighbours = [];
        this.neighbours[3] = null;
        /** @type {Rule} */
        this.rule = null;
        this.mirrorVariant = false;
    }
    horizontal() {
        return this.dir < 2;
    }
    static OFFSETS = [
        [0, 0], [0, 1],
        [0, 0], [H, -0.5],
        [0, 0], [H, -0.5],
    ];
    offset() {
        let offset = Tile.OFFSETS[this.dir];
        return V(offset[0], offset[1]);
    }
    canMirror() {
        return this.rule && this.rule.dirf == 1;
    }
    mirrored() {
        return this.dir >= 4 || this.mirrorVariant;
    }
}

class Cell {
    constructor(a, b, c) {
        /** @type {[Tile]} */
        this.tiles = [a, b, c];
        this.sides = [];
        for (let i=0; i<3; i++) {
            let tile = this.tiles[i];
            for (const x of DIR_SIDES[tile.dir]) {
                this.sides[x] = tile;
            }
        }
        this.up = true;
    }
}
class TR {
    constructor(horizontal, ruleId=null, group=null){
        this.horizontal = horizontal;
        this.ruleId = ruleId;
        this.group = group;
    }
    static contains(ids, idList){
        let hasNegative = false;
        let hasPositive = false;
        for (const v of idList) {
            if (v < 0) {
                hasNegative = true;
            } else {
                hasPositive = true;
            }
        }
        for (const v of idList) {
            for (const id of ids) {
                if (-v == ids) {
                    return false;
                }
            }
        }
        for (const v of idList) {
            if (v == ids) {
                return true;
            }
        }
        if (hasPositive) {
            return false;
        }
        return true;
    }
    /**
     * 
     * @param {Tile} tile 
     * @returns {boolean}
     */
    matches(tile, tileRuleOverride) {
        let tileRule = tile.rule;
        if (tileRuleOverride) {
            tileRule = tileRuleOverride;
        }
        if (this.horizontal != null && this.horizontal != tile.horizontal()) {
            return false;
        }
        if (this.ruleId != null && tileRule && !(TR.contains([tileRule.id], this.ruleId))) {
            return false;
        }
        if (this.group != null && tileRule && !(TR.contains(tileRule.group, this.group))) {
            return false;
        }
        return true;
    }
}

class Rule {
    
    /**
     * 
     * @param {TR} selfrule 
     * @param {[TR]} neighbours 
     * @param {string} path 
     */
    constructor(id, selfrule, neighbours, group, dirf, path) {
        this.id = id;
        this.selfrule = selfrule;
        this.neighbours = neighbours;
        this.group = group;
        this.dirf = dirf;
        /** @type {Ob} */
        this.ob = Ob.fromD(path);
    }
    /**
     * 
     * @param {Tile} tile 
     * @param {TR} rule 
     * @returns {boolean}
     */
    checkTile(tile, rule, tileRuleOverride) {
        if (!tile || !rule) {
            return true;
        }
        return rule.matches(tile, tileRuleOverride);
    }
    /**
     * 
     * @param {Tile} tile 
     * @param {[Rule]} allrules
     * @returns {boolean}
     */
    matches(tile, allrules, checkNeighbours=true) {
        if (!tile){ 
            return false;
        }
        if (!this.checkTile(tile, this.selfrule)) {
            return false;
        }
        if (this.neighbours) {
            for (let i=0; i<4; i++) {
                if (!this.checkTile(tile.neighbours[i], this.neighbours[i])) {
                    return false;
                }
            }
        }
        if (checkNeighbours) {
            for (let i=0; i<4; i++) {
                let neighbour = tile.neighbours[i];
                if (!neighbour || !neighbour.rule) {
                    continue;
                }
                let reverseRule = neighbour.rule;
                let dirf = SIDE_DIRECTIONS[tile.dir][i];
                let reverseI = REVERSE_SIDE_DIRECTIONS[neighbour.dir][(dirf+3)%6];
                if (!reverseRule.neighbours || !reverseRule.neighbours[reverseI]) {
                    continue;
                }
                if (!this.checkTile(tile, reverseRule.neighbours[reverseI], this)) {
                    return false;
                }
            }
        }
        return true;
    }
}



function cellSide(cell, side) {
    if (!cell) {
        return null;
    }
    return cell.sides[side];
}

function circle(p, r) {
    let loop = [];
    const STEPS =32;
    for (let i=0; i<STEPS; i++) {
        let a = Math.PI * 2 * i / STEPS;
        let p2 = new V3(Math.sin(a), Math.cos(a));
        loop.push(p2.mul(r).add(p));
    }
    return Ob.fromLoop(loop);
}

function init2() {
    // Global code will be evaluated once.
    //const turtle = new Turtle();
    if (typeof Canvas != 'undefined') {
        Canvas.setpenopacity(1);
        turtle = new Turtle();
    } else {
        turtle = new TestTurtle();
    }

    let RULES =[
        new Rule(0, new TR(true), null, [], 0, "M 0,0 0.866,-0.5 0,-1 -0.866,-0.5 0,0"), // plain h
        new Rule(1, new TR(false), null, [], 0, "m 0,0 -0.866,-0.5 0,1 L 0,1 -0,0"), // plain v
        new Rule(2, new TR(false), [null, null, new TR(true, null, [-1]), null], [], 0, "M -0.577,0.667\nV 0\nL -0.289,0.167\nv 0.667\n\nM -0,0\nV 1\nL -0.866,0.5\nv -1\nL -0,0"), // door
        new Rule(3, new TR(false), null, [], 0,"M -0,0 -0,1 -0.866,0.5 -0.866,-0.5 -0,0\n\nM -0.289,0.167 -0.577,0\nv 0.333\nl 0.289,0.167\nz\n\nm -0.144,-0.083 0,0.333"), // window
        new Rule(4, new TR(true), null, [1], 0,"M 0,0 0.866,-0.5 0,-1 -0.866,-0.5 0,0\n\nM -0,-1 0,0"), // pointy
        new Rule(5, new TR(true), null, [1], 0,"m -0.866,-0.5\nc 0.577,-0.267 1.155,-0.267 1.732,0\n\nM 0,-1 0,0 0.866,-0.5 0,-1 -0.866,-0.5 0,0"), // curved
        new Rule(6, new TR(true), [null, null, new TR(false),  new TR(false)], [], 0,"m -0.866,-0.5 0,-0.2\nL 0,-0.2 0.866,-0.7 0.866,-0.5\n\nM 0,-0.2 0,0 0.866,-0.5 0,-1 -0.866,-0.5 0,0\n\nm -0.693,-0.6\nv 0.2\n\nm 0.173,-0.1\nv 0.2\n\nm 0.173,-0.1 0,0.2\n\nm 0.173,-0.1\nv 0.2\n\nm 0.346,-0.2 0,0.2\n\nm 0.173,-0.3 0,0.2\n\nm 0.173,-0.3\nv 0.2\n\nm 0.173,-0.3 0,0.2"), // rails
        new Rule(7, new TR(true),  [null, new TR(false, [2]),  null, null], [], 0, "M 0,0 0.866,-0.5 0,-1 -0.866,-0.5 0,0\n\nm -0.26,-0.85 0.173,0.1 -0.346,0.2 -0.173,-0.1"), // doormat 1
        new Rule(8, new TR(true),  [new TR(false, [2]), null, null,  null], [], 0, "M -0,0 -0.866,-0.5 -0,-1 0.866,-0.5 -0,0\n\nM 0.26,-0.85\nl -0.173,0.1 0.346,0.2 0.173,-0.1"), // doormat 0
        new Rule(9, new TR(false), null, [], 0,"M -0,0 -0,1 -0.866,0.5 -0.866,-0.5 -0,0\n\nM -0.289,0.167 -0.577,0\nV 0.333\nL -0.289,0.5\nZ\n\nM -0.433,0.083\nV 0.417\n\nM -0.289,0.333 -0.577,0.167"), // windowx
        new Rule(10, new TR(false), null, [], 0, "M -0,0 -0,1 -0.866,0.5 -0.866,-0.5 -0,0\n\nM -0.722,0.283 -0.52,0.4\nV 0\nL -0.722,-0.117\nZ\n\nm 0.577,0.333\nV 0.217\nL -0.346,0.1\nv 0.4\nz"), // window2
        new Rule(11, new TR(false), null, [], 0, "M -0,0 -0,1 -0.866,0.5 -0.866,-0.5 -0,0\n\nM -0.144,0.617\nV 0.217\nL -0.346,0.1\nv 0.4\nz"), // window21
        new Rule(12, new TR(false), null, [], 0, "M -0,0 -0,1 -0.866,0.5 -0.866,-0.5 -0,0\n\nM -0.52,0.4\nV -0\nL -0.722,-0.117\nv 0.4\nz"), // window22
        new Rule(13, new TR(false), [null, null, new TR(true, null, [-1]), null], 0, 0, "M -0,0 -0,1 -0.866,0.5 -0.866,-0.5 -0,0\n\nM -0.144,0.617\nV 0.217\nL -0.346,0.1\nv 0.4\nz\n\nm -0.346,0.1 -0,-0.667 -0.289,-0.167 0,0.667"), // doors
        new Rule(14, new TR(false), [null, null, new TR(true, null, [-1]), null], 0, 0, "M -0,0 -0,1 -0.866,0.5 -0.866,-0.5 -0,0\n\nM -0.52,0.4\nV -0\nL -0.722,-0.117\nv 0.4\nz\n\nM -0.087,0.95\nl -0,-0.667 -0.289,-0.167 0,0.667"), // doors2
        new Rule(15, new TR(true), null, [], 1, "m 0.067,-0.36 0.167,0.039\n\nm -0.137,-0.164 0.159,0.048\n\nm -0.134,-0.153 0.193,0.051\n\nM -0,0 0.866,-0.5 -0,-1 -0.866,-0.5 -0,0\n\nM 0.087,-0.15\nc 0.011,-0.015 0.115,-0.415 0.115,-0.415"), // antena
        new Rule(16, new TR(true), null, [], 1, "m -0.087,-0.55\nv -0.3\nl -0.173,0.1\nv 0.3\n\nm 0,0\nv 0.2\n\nm 0.173,0.1\nv -0.2\n\nm 0.173,-0.1\nv 0.2\n\nm -0.346,-0.2 0.173,-0.1 0.173,0.1 -0.173,0.1\nz\n\nM 0,0 0.866,-0.5 0,-1 -0.866,-0.5 0,0"), // chair1
        new Rule(17, new TR(true), null, [], 1, "m 0.346,-0.5 -0.26,-0.15\n\nm -0.087,0.35 -0.087,0.15\n\nm 0.346,-0.3 0.087,0.05\n\nm -0.779,0.05 0.26,0.15 0.52,-0.3 0.087,-0.15 -0.26,-0.15 -0.087,0.15\nz\n\nM 0,-0 0.866,-0.5 0,-1 -0.866,-0.5 0,-0"), // chair_b
        new Rule(18, new TR(true), null, [], 1, "M 0,-0.9 -0.52,-0.6 0,-0.3 0.52,-0.6\nZ\n\nm 0,0.8 0.693,-0.4\nv -0.1\nl -0.693,0.4\n\nm -0.693,-0.3\nv -0.1\nL 0,-0.2\nv 0.1\nz\n\nM 0,-0.7 0.173,-0.6 0,-0.5 -0.173,-0.6\nZ\n\nM 0.433,-0.55 0,-0.8 -0.433,-0.55\n\nM 0,-0.8\nv -0.1\n\nm 0,0.9\nL 0.866,-0.5 0,-1 -0.866,-0.5 0,-0"), // hatch
        new Rule(19, new TR(true), null, [], 0, "m -0,-0.6\nv -0.1\n\nM 0.433,-0.35\nl -0.433,-0.25 -0.433,0.25\n\nm 0.953,-0.05\nL -0,-0.7 -0.52,-0.4\n\nm 1.126,-0.05\nL -0,-0.8 -0.606,-0.45\n\nM -0,-0.9\nv 0.1\n\nm 0,-0.1\nc 0,0 0.693,0.4 0.693,0.4\nL -0,-0.1 -0.693,-0.5\nZ\n\nm -0.866,0.4\nL -0,-0 0.866,-0.5 -0,-1\nZ"), // pit
        new Rule(20, new TR(true), null, [1], 0, "M 0,0 0.866,-0.5 0,-1 -0.866,-0.5 0,0\n\nM -0.866,-0.5 0,-0.9 0,0\n\nM -0,-1\nl -0,0.1\nL 0.866,-0.5"), // pointy2
        new Rule(21, new TR(true), [null, null, null, new TR(true, [22])], [1],0, "m 0.866025 -0.5 l -0.866025 -0.5 l -0.866026 0.5 L 4.81963e-07 1.08172e-08 M 4.81963e-07 -1 L -0.173205 -0.8 L -0.866025 -0.5 m 1.47224 0.15 l -0.779423 -0.45"), // gable_tl
        new Rule(22, new TR(true), [null, new TR(true, [21]), null, null], [1],0, "M -0.866025 -0.5 L 3.14034e-07 -1.20982e-07 L 0.866025 -0.5 L 3.35859e-07 -1 M 2.92209e-07 -4.40957e-07 L 0.173205 -0.6 L 0.866025 -0.5 m -1.12583 -0.35 l 0.433013 0.25"), // gable_br
    ]

    /** @type {[[Cell]]} */
    let grid = [];
    for (let i=0; i<rows; i++) {
        grid[i] = [];
        for (let j=0; j<cols; j++) {
            let x = SIZE*(2*(j - (cols-0.5)*0.5) + (i % 2))*H;
            let y = SIZE*(i-rows*0.5)*1.5;
            turtle.jump(x, y-SIZE);
            turtle.setheading(30);
            turtle.pendown();
            for (let k=0; k<6; k++) {
                /*turtle.forward(SIZE);
                turtle.right(60);*/
            }
            turtle.jump(x, y);
            
            let cell = null;
            
            if (Math.random() > 0.5) {
                turtle.setheading(90);
                cell = new Cell(new Tile(0), new Tile(2), new Tile(4));
            }  else {
                turtle.setheading(270);
                cell = new Cell(new Tile(1), new Tile(3), new Tile(5));
                cell.up = false;
            }
            grid[i][j] = cell;
            for (let k=0; k<3;k++) {
                /*turtle.pendown();
                turtle.forward(SIZE);
                turtle.penup();
                turtle.backward(SIZE);
                turtle.right(120);*/
            }
            //turtle.goto(x)
        }
    }
    for (let i=0; i<rows; i++) {
       for (let j=0; j<cols; j++) {
           let cell = grid[i][j];
           let dpos = null;
           if (i%2) {
               dpos = [[1, -1], [0, -1], [-1, 0], [0,1], [1,1], [1, 0]];
           } else {
               dpos = [[0, -1], [-1, -1], [-1, 0], [-1,1], [0, 1], [1, 0]];
           }
           let neighbours = [];
           for (let k=0; k<6; k++) {
                let tj = dpos[k][0] + j;
                let ti = dpos[k][1] + i;
                if (tj >= 0 && tj < cols && ti >= 0 && ti < rows) {
                    neighbours[k] = grid[ti][tj];
                } else {
                    neighbours[k] = null;
                }
           }
           const tiles = cell.tiles;
           if (cell.up) {
               tiles[0].neighbours = [cellSide(neighbours[0], 3), cellSide(neighbours[1], 4), tiles[1], tiles[2]];
               tiles[1].neighbours = [tiles[0], cellSide(neighbours[2], 5), cellSide(neighbours[3], 0), tiles[2]];
               tiles[2].neighbours = [tiles[0], cellSide(neighbours[5], 2), cellSide(neighbours[4], 1), tiles[1]];
           } else {
               tiles[0].neighbours = [tiles[1], tiles[2], cellSide(neighbours[3], 0), cellSide(neighbours[4], 1)];
               tiles[1].neighbours = [cellSide(neighbours[0], 3), tiles[1], tiles[0], cellSide(neighbours[5], 2)];
               tiles[2].neighbours = [cellSide(neighbours[1], 4), tiles[2], tiles[0], cellSide(neighbours[2], 5)];
           }
       }
    }
   
    scene = new Scene();
    scene.setOrthographic(1, V(0,0,-1), V(0, 0, 0)); 
    scene.camera_pos = Scene.worldCameraOrbit(new V3(0, 0, 0), 1, 90, -90)
    //let c = Ob.fromD("m 11.405754,6.8344004 c -0.633653,1.1767841 -1.108893,1.1541535 -1.108893,1.1541535 0,0 1.001399,0.1980164 1.041002,1.3578279 C 11.296318,8.1747642 11.649496,8.2493774 12.339261,7.8075102 10.7916,8.346872 11.405754,6.8344004 11.405754,6.8344004 Z  M 6.5175738,13.397235 C 11.974015,14.003528 12.808843,9.9347738 12.808843,9.9347738 L 12.627799,5.1144849 c 0,0 -4.0734834,-3.8924398 -5.657616,-2.9872212 C 5.3860506,3.0324821 5.2502678,6.291269 3.5303526,5.8160295 1.8104372,5.3407897 1.6293934,8.8711422 3.3040478,8.8485116 c 1.6746543,-0.02263 1.4483498,1.7878064 1.4483498,1.7878064 0,0 -0.6110226,3.552983 0.7241749,2.693026 1.3351973,-0.859958 0.7864086,0.0396 0.7864086,0.0396 z  M 8.3506419,7.9659233 c 0,0.5124369 -0.3546201,0.9278491 -0.7920663,0.9278491 -0.4374461,-10e-8 -0.7920662,-0.4154122 -0.7920662,-0.9278491 0,-0.5124368 0.3546201,-0.9278489 0.7920662,-0.927849 0.4374461,0 0.7920663,0.4154121 0.7920663,0.927849 z  M 10.786604,10.268659 8.2007462,9.8006287 6.3871012,11.897482 5.9894294,9.0256879 3.6306331,7.7608978 5.9707166,6.4540617 6.3265453,3.5755249 8.1704682,5.63965 10.749179,5.1254066 9.5487022,7.7079421 Z");
    //c.transform(M4.scale(3));
    //scene.addOb(c);
    for (let row of grid) {
        for (let cell of row) {
            for (let tile of cell.tiles) {
                if (!tile.rule ) {
                    let candidates = [];
                    for (let i=0; i<RULES.length; i++) {
                        if (RULES[i].matches(tile)) {
                            candidates.push(i);
                        }
                    }
                    if (candidates.length > 0) {
                        let k = Math.min(Math.floor(Math.random() * candidates.length), candidates.length - 1);
                        tile.rule = RULES[candidates[k]];
                    }
                }
                if (tile.canMirror()) {
                    tile.mirrorVariant = Math.random() > 0.5;
                }
            }
        }
    }
    // fallback
    for (let row of grid) {
        for (let cell of row) {
            for (let tile of cell.tiles) {
                if (!tile.rule ) {
                    for (let i=0; i<RULES.length; i++) {
                        if (RULES[i].matches(tile, RULES, false)) {
                            tile.rule = RULES[i];
                            break;
                        }
                    }
                }
            }
        }
    }
    for (let i=0; i<rows; i++) {
        for (let j=0; j<cols; j++) {
            let x = SIZE*(2*(j - (cols-0.5)*0.5) + (i % 2))*H;
            let y = SIZE*(i-rows*0.5)*1.5;
            let pos = V(x, y);
            for (let tile of grid[i][j].tiles) {
                if (tile.rule) {
                    let rule = tile.rule;
                    let transform = new M4();
                    transform = transform.mul(M4.translate(pos)).mul(M4.scale(SIZE));
                    if (tile.mirrored()) {
                        transform = transform.mul(M4.scale3(-1, 1));
                    }
                    transform = transform.mul(M4.translate(tile.offset()));
                    scene.addOb(rule.ob.transformed(transform));
                }
            }
        }
    }
    
    scene.draw();
}
// The walk function will be called until it returns false.
function walk(i) {
    return false;
}

class V3 {
    constructor(x=0, y=0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static V0 = new V3(0, 0, 0);
    toString() { return `V3(${this.x}, ${this.y}, ${this.z})`; }
    add(b) { return new V3(this.x + b.x, this.y + b.y, this.z + b.z); }
    sub(b) { return new V3(this.x - b.x, this.y - b.y, this.z - b.z); }
    mul(b) { return new V3(this.x  * b, this.y * b, this.z * b); }
    scale(b) { return new V3(this.x  * b.x, this.y * b.y, this.z * b.z); }
    flipx() { return new V3(-this.x, this.y, this.z); }
    flipy() { return new V3(this.x, -this.y, this.z); }
    copy() { return new V3(this.x,this.y,this.z); }
    changex(v) { let res = this.copy(); res.x = v; return res;}
    changey(v) { let res = this.copy(); res.y = v; return res;}
    changez(v) { let res = this.copy(); res.z = v;    return res; }
    len2() { return this.x*this.x + this.y*this.y + this.z*this.z; }
    static lerp(a, b, x) { return a.mul(1-x).add(b.mul(x)); }
    magnitude() { return Math.sqrt(this.len2()); }
    normalized() { return this.mul(1/this.magnitude()); }
    xyzs() { return this.x + this.y + this.z }
    xyzMax() { return Math.max(this.x, this.y, this.z); }
    xyzMin() { return Math.min(this.x, this.y, this.z); }
    
    abs() { return new V3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)); }
    max(b) { return new V3(Math.max(this.x, b.x), Math.max(this.y, b.y), Math.max(this.z, b.z)); } 
    min(b) { return new V3(Math.min(this.x, b.x), Math.min(this.y, b.y), Math.min(this.z, b.z)); } 
    maxK(k) { return new V3(Math.max(this.x, k), Math.max(this.y, k), Math.max(this.z, k)); } 
    minK(k) { return new V3(Math.min(this.x, k), Math.min(this.y, k), Math.min(this.z, k)); } 
    dot(b) {
        return this.scale(b).xyzs();
    }
    rotDeg(deg) {
        const a = deg*Math.PI/180;
        const s = Math.sin(a);
        const c = Math.cos(a);
        return new V2(this.x*c-this.y*s, this.x*s+this.y*c);
    }
}
class M4 {
    constructor(d = null) {
        this.d = d;
        if (!d) {
            this.d = [[1,0,0,0],
                  [0,1,0,0],
                  [0,0,1,0],
                  [0,0,0,1]];
        }
    }
    mul(b) {
        let res = new M4();
        for (let i=0; i<4; i++) {
            for (let j=0; j<4; j++) {
                let s = 0;
                for (let k=0; k<4; k++) {
                    s += this.d[i][k] * b.d[k][j]
                }
                res.d[i][j] = s;
            }
        }
        return res;
    }
    transpose() {
        let res = new M4();
        for (let i=0; i<4; i++) {
            for (let j=0; j<4; j++) {
                res.d[i][j] = this.d[j][i];
            }
        }
        return res;
    }
    mulv(v) {
        let vv = [v.x, v.y, v.z, 1];
        let res = [0, 0, 0, 0];
        for (let i=0; i<4; i++) {
            for (let k=0; k<4; k++) {
                res[i] += this.d[i][k] * vv[k];
            }
        }
        return new V3(res[0], res[1], res[2]);
    }
    static translate(v) {
        let r = new M4();
        r.d[0][3] = v.x;
        r.d[1][3] = v.y;
        r.d[2][3] = v.z;
        return r;
    }
    static scale(x) {
        let r = new M4();
        r.d[0][0] = x;
        r.d[1][1] = x;
        r.d[2][2] = x;
        return r;
    }
    static scale3(x,y,z=1) {
        let r = new M4();
        r.d[0][0] = x;
        r.d[1][1] = y;
        r.d[2][2] = z;
        return r;
    }
    static euler(a,b,c) {
        let m1 = new M4();
        let m2 = new M4();
        let m3 = new M4();
        m1.d = [[1, 0, 0, 0],
                [0, Math.cos(a), -Math.sin(a), 0],
                [0, Math.sin(a), Math.cos(a), 0],
                [0, 0, 0, 1]];
        m2.d = [[Math.cos(b), 0, Math.sin(b), 0],
                [0, 1, 0, 0],
                [-Math.sin(b), 0, Math.cos(b), 0],
                [0, 0, 0, 1]];
        m3.d = [[Math.cos(c), -Math.sin(c), 0, 0],
                [Math.sin(c), Math.cos(c), 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]];
        return m1.mul(m2).mul(m3);
    }
    static eulerv(v) {
        return euler(v.x, v.y, v.z);
    }
    inverse() {
        let res  = [];
        for (let i=0; i<4; i++) {
            res[i] = this.d[i].slice();
            for (let j=0; j<4; j++) {
                res[i].push (i == j ? 1 : 0);
            }
        }
        for (let i=0; i<4; i++) {
            let r = i;
            for (let j=i; j<4; j++) {
                if (Math.abs(res[j][i]) > Math.abs(res[r][i])) {
                    r = j;
                }
            }
            [res[i], res[r]] = [res[r], res[i]];
            if (res[r][i] != 0) {
                let k = 1/res[i][i];
                res[i] = res[i].map((x) => x*k);

                for (let j=i+1; j<4; j++) {
                    let k2 = res[j][i];
                    for (let column=i; column<8; column++) {
                        res[j][column] = res[j][column] - k2 * res[i][column];
                    }
                }
            }
        }
        for (let i=3; i>=0; i--) {
            for (let j=0; j<i; j++) {
                let mul = res[j][i];
                for (let k=0; k<8; k++) {
                    res[j][k] -= res[i][k] * mul;
                }
            }
        }
        for (let i=0; i<4; i++) {
            res[i] = res[i].slice(4);
        }
        return new M4(res);
    }
}
class Util {
    static rndRange(min, max) {
        return Math.random() * (max-min)+min;
    }
    static radians(a) {
        return a * Math.PI / 180;
    }
    static inverseLerp(a, b, x) {
        let d = b-a;
        if (d != 0) {
            return (x-a)/d;
        } else {
            return 0;
        }
    }
    static lerp(a, b, x) {
        return (1-x)*a + x*b;
    }
    static planeDistance(p0, pnorm, x) {
        pnorm = pnorm.normalized();
        let k = p0.dot(pnorm);
        return x.dot(pnorm) - k;
    }
    static rectContains(r, p) {
        return p.x >= r[0] && p.x <= r[1] && p.y >= r[2] && p.y <= r[3];
    }
    static planeClip(p0, pnorm, a, b) {
        let d1 = Util.planeDistance(p0, pnorm, a);
        let d2 = Util.planeDistance(p0, pnorm, b);
        if (d1 >= 0 && d2 >= 0) {
            return [a, b];
        }
        if (d1 < 0 && d2 < 0) {
            return null;
        }
        let m = Util.inverseLerp(d1, d2, 0);
        let p = V3.lerp(a, b, m);
        if (d1 < 0) {
            return [p, b];
        } else {
            return [a, p];
        }
    }
    
    static clipRect(a,b,r) {
        let ca = rectContains(r, a);
        let cb = rectContains(r, b);
        if (ca && cb) {
            return [a, b];
        }
    }

    /**
     * 
     * @param {V3} p0 
     * @param {V3} p1 
     * @param {V3} p2 
     * @param {V3} p3 
     * @param {float} t 
     * @returns 
     */
    static cubic_bezier(p0, p1, p2, p3, t) {
        let t1 = 1-t;
        return p0.mul(t1*t1*t1).add(p1.mul(t1*t1*t*3)).add(p2.mul(t1*t*t*3)).add(p3.mul(t*t*t));
    }
    /**
     * 
     * @param {V3} p0 
     * @param {V3} p1 
     * @param {V3} p2 
     * @returns {[V3]}
     */
    static quad_bezier_to_cubic(p0, p1, p2) {
        return [p0,p0.add(p1.sub(p0).mul(2/3)),p2.add(p1.sub(p2).mul(2/3)), p2];
    }
}
class Scene {
    constructor() {
        this.camera_pos_inverse = new M4();
        this.camera_pos = Scene.worldCameraM(new V3(0, 0, 0), new V3(1, 0, 0));
        this.camera = Scene.orthographic1();
        this.lines=[];
        this.ortho = true;
        this.w=100;
        this.h=100;
        this.fov = [90, 90];
    }
    set camera_pos(v) {
        this._camera_pos = v;
        this.camera_pos_inverse = v.inverse();
    }
    get camera_pos() {
        return this._camera_pos;
    }
    addLine(a,b) {
        this.lines.push([a, b]);
    }
    addOb(x) {
        this.lines.push(...x.lines);
    }
    mapPoint(x) {
        let p = this.camera.mulv(x);
        if (this.ortho) {
            // ok
        } else if (p.z != 0) {
            p = p.mul(1/Math.abs(p.z));
        } else {
            p.x = 0; p.y = 0;
        }
        return [p.x, p.y];
    }
    draw() {
        let lastPoint = null;
        turtle.pendown();
        this.lines.forEach((l) => {
            let debug=false;
            if (l[0].z > 0 && l[1].z > 0) {
                debug=true;
            }
           let p1 = this.camera_pos.mulv(l[0]);
           let p2 = this.camera_pos.mulv(l[1]);
           
           
           /*if (p1.z > 0 && p2.z > 0) {
               return;
           } else if (p1.z > 0 || p2.z > 0) {
               let x = Util.inverseLerp(p1.z, p2.z, 0.011);
               if (p1.z > 0) {
                   p1 = V3.lerp(p1, p2, x);
               } else {
                   p2 = V3.lerp(p1, p2, x);
               }
           }*/
           if (!this.ortho) {
               let p0 = new V3(0, 0, 0);
               let norm = new V3();
               let line = [p1, p2];
               let a1 = Math.PI * 0.5*this.fov[0]/180;
               let a2 = Math.PI * 0.5*this.fov[1]/180;
               if (line) {
                    norm = new V3(Math.cos(a1), 0, -Math.sin(a1));
                    line = Util.planeClip(p0, norm, line[0], line[1]);
               }
               if (line) {
                    norm = new V3(-Math.cos(a1), 0, -Math.sin(a1));
                    line = Util.planeClip(p0, norm, line[0], line[1]);
               }
               if (line) {
                    norm = new V3(0, -Math.cos(a2), -Math.sin(a2));
                    line = Util.planeClip(p0, norm, line[0], line[1]);
               }
               if (line) {
                    norm = new V3(0, Math.cos(a2), -Math.sin(a2));
                    line = Util.planeClip(p0, norm, line[0], line[1]);
               }
               if (line) {
                   p1 = line[0];
                   p2 = line[1];
               } else {
                   return;
               }
           }
           p1 = this.mapPoint(p1);
           p2 = this.mapPoint(p2);
           let connected = false;
           if (lastPoint != null) {
                let dx = lastPoint[0] - p1[0];
                let dy = lastPoint[1] - p1[1];
                connected = (dx*dx+dy*dy) < 0.00001;
           }
           if (!connected) {
                turtle.penup();
                turtle.jump(p1)
                turtle.pendown();
           }
           turtle.goto(p2);
           lastPoint = p2;
        });
        turtle.penup();
    }
    static worldCameraM(from, to) {
        let d = to.sub(from);
        let m1 = M4.translate(from.mul(-1));
        let a1 = Math.atan2(d.y, d.x);
        let xy = d.changez(0);
        
        let a2 = Math.atan2(d.z, xy.magnitude());
        //let m2 = (new M4()).mul(M4.euler(0, 0, +a1)).mul(M4.euler(-Math.PI/2 - a2, 0, 0));
        let m2 = (new M4()).mul(M4.euler(-a2, -a1, 0)).mul(M4.euler(Math.PI/2, Math.PI, -Math.PI/2));
        return m2.mul(m1);
    }
    static worldCameraOrbit(to, distance, z0, x0) {
        let x = x0* Math.PI / 180;
        let z = z0* Math.PI / 180;
        let p = M4.euler(0, 0, z).mul(M4.euler(0, x, 0)).mulv(new V3(-1, 0, 0));
        let p2 = p.mul(distance).add(to);
        if (x0 > -90 && x0 < 90) {
            return Scene.worldCameraM(p2, p2.sub(p));
        } else {
            let m1 = M4.translate(p2.mul(-1));
            if (x0 > 0) {
                return M4.euler(0, 0, 1*Math.PI/2-z).mul(m1);    
            } else {
                return M4.euler(0, Math.PI, -1*Math.PI/2-z).mul(m1);    
            }
            
        }
    }
    screenToWorld(p) {
        // TODO: missing camera<->screen conversion
        return this.camera_pos_inverse.mulv(p);
    }
    
   static orthographic1(scale=1) {
        let res = new M4();
        res.d = [
            [scale,0,0,0],
            [0,-scale,0,0],
            [0, 0, 1,0],
            [0,0,0,1],
        ];
        //res = res.mul(Scene.worldCameraM(from, to));
        res = res;
        return res;
    }
    setOrthographic(scale, from, to) {
        this.camera = Scene.orthographic1(scale);
        this.camera_pos = Scene.worldCameraM(from, to);
        this.ortho = true;
    }
    static perspective(scale) {
        let res = new M4();
        res.d = [
            [scale,0,0,0],
            [0, -scale,0,0],
            [0, 0, -1,0],
            [0,0,0,1],
        ];
        return res;
    }
    setPerspective(from, to) {
        
        this.camera = Scene.perspective(this.w*0.5 * Math.tan((90-this.fov[0]*0.5)/180*Math.PI));
        this.camera_pos = Scene.worldCameraM(from, to);
        this.ortho = false;
    }
}
class Ob {
    constructor(linesa=[]){
        this.lines=[];
        if (linesa) {
            this.addLines(linesa);
        }
    }
    static fromChain(points) {
        let res = new Ob();
        for (let i=1; i<points.length; i++) {
            res.addLine(points[i-1], points[i]);
        }
        return res;
    }
    static fromLoop(points) {
        let res = Ob.fromChain(points);
        if (points.length > 1) {
            res.addLine(points[points.length-1], points[0]);
        }
        return res;
    }

    static cubic_bezier(p0, p1, p2, p3, steps=32) {
        let result = [p0];
        for (let i=1; i<steps; i++) {
            result.push(Util.cubic_bezier(p0, p1, p2, p3, i/steps));
        }
        result.push(p3);
        return Ob.fromChain(result);
    }

    /**
     * 
     * @param {string} text 
     * @returns {V3}
     */
    static parsePoint(text) {
        let t = text.split(/[, ]/)
        return new V3(Number.parseFloat(t[0]), Number.parseFloat(t[1]));
    }
    /**
     *
     * @function
     * @param {string} data
     * @returns {Ob}
     */
    static fromD(data) {
        let res = new Ob();
        let pos = new V3(0, 0, 0);
        let p=0;
        data = data.trim();
        let chunks = data.split(/(?=[a-df-zA-DF-Z])/);
        let drawing = false;
        let start = pos;
        let last_cubic = null;
        let last_quad = null;
        let POINT_REGEX = /[0-9.eE+\-]+[, ][0-9.eE+\-]+/g;
        let NUMBER_REGEX = /[0-9.eE+\-]+/g;
        for (const chunk of chunks) {
            let t = chunk[0];
            if (t == 'm' || t == 'M') {
                let pointText = chunk.matchAll(POINT_REGEX);
                /**  @type {[V3]} */
                let points = Array.from(pointText.map((x) => { return Ob.parsePoint(x[0]) }));
                for (let i=0; i<points.length; i++) {
                    let p2 = points[i];
                    if (t == 'm') {
                        p2 = p2.add(pos);
                    }
                    if (i == 0){ 
                        pos = p2;
                        start = pos;
                        drawing = true;
                    } else {
                        res.addLine(pos, p2);
                        pos = p2;
                    }
                }
                last_cubic = null;
                last_quad = null;
            } else if (t == 'l' || t == 'L') {
                let pointText = chunk.matchAll(POINT_REGEX);
                /**  @type {[V3]} */
                let points = Array.from(pointText.map((x) => { return Ob.parsePoint(x[0]) }));
                if (!drawing) {
                    drawing = true;
                    start = pos;
                }
                for (let i=0; i<points.length; i++) {
                    let p2 = points[i];
                    if (t == 'l') {
                        p2 = p2.add(pos);
                    }
                    res.addLine(pos, p2);
                    pos = p2;
                }
                last_cubic = null;
                last_quad = null;
            } else if (t == 'h' || t == 'H' || t == 'v' || t == 'V') {
                let pointText = chunk.matchAll(NUMBER_REGEX);
                /**  @type {[float]} */
                let points = Array.from(pointText.map((x) => { return Number.parseFloat(x[0]) }));
                if (!drawing) {
                    drawing = true;
                    start = pos;
                }
                for (let v of points) {
                    let p2 = pos;
                    if (t == 'h') {
                        p2 = p2.add(V(v, 0));
                    } else if (t == 'v') {
                        p2 = p2.add(V(0, v));
                    } else if (t == 'H') {
                        p2 = p2.changex(v);
                    } else if (t == 'V') {
                        p2 = p2.changey(v);
                    }
                    res.addLine(pos, p2);
                    pos = p2;
                }
                last_cubic = null;
                last_quad = null;
            } else if (t == 'c' || t == 'C' || t == 's' || t == 'S') {
                let pointText = chunk.matchAll(POINT_REGEX);
                /**  @type {[V3]} */
                let points = Array.from(pointText.map((x) => { return Ob.parsePoint(x[0]) }));
                if (!drawing) {
                    drawing = true;
                    start = pos;
                }
                let step = 3;
                if (t == 's' || t == 'S') {
                    step = 2;
                }
                for (let i=0; i+step-1<points.length; i+=step) {
                    let px = null;
                    if (step == 3) {
                        px =  [points[i+0], points[i+1], points[i+2]];
                    } else {
                        px =  [points[i+0], points[i+0], points[i+1]];
                    }
                    
                    if (t == 'c' || t == 's') {
                        for (let j=0; j<px.length; j++) {
                            px[j] = px[j].add(pos);
                        }
                    }
                    if (step == 2) {
                        if (last_cubic) {
                            px[0] = pos.mul(2).sub(last_cubic);
                        } else {
                            px[0] = pos;
                        }
                    }
                    res.addOb(Ob.cubic_bezier(pos, px[0], px[1], px[2]));
                    pos = px[2];
                    last_cubic = px[1];
                }
                last_quad = null;
            } else if (t == 'Q' || t == 'q' || t == 'T' || t == 't') {
                let pointText = chunk.matchAll(POINT_REGEX);
                /**  @type {[V3]} */
                let points = Array.from(pointText.map((x) => { return Ob.parsePoint(x[0]) }));
                if (!drawing) {
                    drawing = true;
                    start = pos;
                }
                let step = 2;
                if (t == 't' || t == 'T') {
                    step = 1;
                }
                for (let i=0; i+step-1<points.length; i+=step) {
                    let px = null;
                    if (step == 2) {
                        px =  [points[i+1], points[i+2]];
                    } else {
                        px =  [points[i+0], points[i+0]];
                    }
                    
                    if (t == 'q' || t == 't') {
                        for (let j=0; j<px.length; j++) {
                            px[j] = px[j].add(pos);
                        }
                    }
                    if (step == 1) {
                        if (last_quad) {
                            px[0] = pos.mul(2).sub(last_quad);
                        } else {
                            px[0] = pos;
                        }
                    }
                    last_quad = px[0];
                    px = Util.quad_bezier_to_cubic(pos, px[0], px[1]);
                    res.addOb(Ob.cubic_bezier(pos, px[1], px[2], px[3]));
                    pos = px[3];
                }
                last_cubic = null;
            } else if (t == 'a' || t == 'A') {
                let pointText = chunk.matchAll(NUMBER_REGEX);
                /**  @type {[V3]} */
                let numbers = Array.from(pointText.map((x) => { return Number.parseFloat(x[0]) }));
                if (!drawing) {
                    drawing = true;
                    start = pos;
                }
                for (let i=0; i+6<numbers.length; i+=7) {
                    let rx = numbers[i+0];
                    let ry = numbers[i+1];
                    let angle = numbers[i+2];
                    let large_arc = numbers[i+3];
                    let sweep_flag = numbers[i+4];
                    let p2 = new V3(numbers[i+4], numbers[i+5]);
                    
                    if (t == 'a') {
                        p2 =  p2.add(pos);
                    }
                    res.addLine(pos, p2); // TODO: implement arcs
                    pos = p2;
                }
                last_cubic = null;
                last_quad = null;
            }
            else if (t == 'z' || t == 'Z') {
                if (drawing) {
                    res.addLine(pos, start);
                    pos = start;
                    drawing = false;
                }
                last_cubic = null;
                last_quad = null;
            }
        }
        return res;
    }
    addLine(a,b) {
        this.lines.push([a, b]);
    }
    addLines(ar) {
        for (const x of ar) {
            this.addLine(new V3(x[0], x[1], x[2]), new V3(x[3], x[4], x[5]));
        }
    }
    addLineArray(ar) {
        for (const x of ar) {
            this.addLine(x[0], x[1]);
        }
    }
    addOb(o) {
        for (const line of o.lines) {
            this.addLine(line[0], line[1]);
        }
    }
    transform(m) {
        this.lines.forEach((v, i) => {
            this.lines[i] = [m.mulv(v[0]), m.mulv(v[1])];
        });
    }
    transformed(m) {
        let r = new Ob();
        r.addOb(this);
        r.transform(m);
        return r;
    }
}
class SDF {
    static bind1(f) {
        return function(...x) {
            return f.bind(null, ...x);
        }
    }
    // combinations
    static unionD(a, b, x) { return Math.min(a(x), b(x)); }
    static union(a, b) { return SDF.unionD.bind(null, a, b); }
    static diffD(a, b, x) { return Math.max(a(x), -b(x)); }
    static diff(a, b) { return SDF.diffD.bind(null, a, b); }
    static intersectionD(a, b, x) { return Math.max(a(x), b(x)); }
    static intersection(a, b) { return SDF.intersectionD.bind(null, a, b); }
    static xorD(a, b, x) { 
        let d1=a(x), d2=b(x);
        return Math.max(min(d1, d2), -max(d1, d2)); 
    }
    static xor(a, b) { return SDF.xorD.bind(null, a, b); }
    
    static transformD(f, t, x) {
        return f(t.mulv(x))
    }
    static moveD(f, p, x) {
        return f(x.sub(p));
    }
    static move(f, p) {
        return SDF.moveD.bind(null, f, p);
    }
    static rotateD(f, euler, x) {
        return f(M4.euler(Util.radians(euler.x), Util.radians(euler.y), Util.radians(euler.z)).mulv(x));
    }
    static rotate(f, euler) {
        return SDF.transformD.bind(null, f, M4.euler(Util.radians(euler.x), Util.radians(euler.y), Util.radians(euler.z))); 
    }
    
    // primitives
    static sphereD(p, r, x) {
        let dv = x.sub(p);
        return dv.magnitude() - r;
    }
    static sphere(p, r) {
        //SDF.bind1(SDF.sphereD);
        return SDF.sphereD.bind(null, p, r);
    }
    static boxD(s, x) {
        let q = x.abs().sub(s);
        return q.maxK(0).magnitude() + Math.min(q.xyzMax(), 0);
    }
    static box = SDF.bind1(SDF.boxD);

    static runRay(f, p0, dir, limit) {
        let travel = 0;
        let p = p0;
        while (travel < limit) {
            let distance = f(p);
            if (distance < 0.001) {
                break;
            }
            distance = Math.min(limit-travel, distance);
            p = p.add(dir.mul(distance));
            travel += distance;
        }
        return [p, travel];
    }
    static clipReach(f, p0, point, mustBeOnSurface) {
        let dis = point.sub(p0).magnitude();
        
        if (mustBeOnSurface && Math.abs(f(point)) > 0.001) {
            return false;
        }
        let dir = point.sub(p0);
        let len2 = dir.len2();
        if (len2 <= 0.001) {
            return false;
        }
        dir = dir.mul(1/Math.sqrt(len2));
        let [pRay, pTravel] = SDF.runRay(f, p0, dir, dis);
        if (pRay.sub(point).len2() > 0.0001) {
            return false;
        }
        return true;
    }
    static clipLines(f, camera_info, lines, subdiv=1, subdivExtra=true) {
        let result = [];
        let p0 = camera_info.screenToWorld(V(0, 0, 0));
        for (let line of lines) {
            let prev = line[0];
            for (let i=1; i<=subdiv; i++) {
                let p2 = V3.lerp(line[0], line[1], i/subdiv);
                let r1 = SDF.clipReach(f, p0, prev, false);
                let r2 = SDF.clipReach(f, p0, p2, false);
                if (r1 && r2) {
                    result.push([prev, p2]);
                } else if (subdivExtra && r1 != r2) {
                    let [l, r] = [prev, p2];
                    for (let iter=0; iter<10; iter++) {
                        let m = l.add(r).mul(0.5);
                        let good = SDF.clipReach(f, p0, m, false);
                        
                        if (r1 == good) {
                            l = m;
                        } else {
                            r = m;
                        }
                    }
                    if (r1) {
                        result.push([prev, l]);
                    } else {
                        result.push([l, p2]);
                    }
                }
                prev = p2;
            }
        }
        return result;
    }
}
class TestTurtle
{
    constructor() {}
    jump(x, y) { }
    pendown(){}
    penup() {}
    forward(x) {}
    backward(x) {}
    right(x) {}
    setheading(x) {}
    goto(x, y){}
}
function initlib() {
    this.V3 = V3;
    this.V = (x,y,z)=>new V3(x, y, z);
    this.M4 = M4;
    this.Ob = Ob;
    this.Scene = Scene;
    this.SDF = SDF;
}
initlib();
init2();