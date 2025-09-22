// https://turtletoy.net/turtle/9be13ee183
let seed = 85398024; // min=1, max=999999999, step=1
let quick_preview = 0;// min=0, max=1, step=1, (off, on)
let pipe_grid = 12; // min=2, max=500, step=1
let pipe_r = 3; // min=0.1, max=50, step=0.1
let segment_l = 15; // min=0.1, max=100, step=0.1
let p_bend = 0.23; // min=0, max=1, step=0.001
let p_stop = 0.03; // min=0.0, max=1, step=0.001
let p_balls = 0.2; // min=0.0, max=1, step=0.001
let total_segments = 300; // min=1, max=10000, step=1

let a1 = 3; // min = -720, max=720, step=1
let a2 = 26; // min = -90, max=90, step=1
let cd = 197; // min = 0, max=360, step=0.1
let perspective = 1; // min=0, max=1, step=1,  (off, on)
let viewSize = 200; // DIS min=10, max=600, step=1
let fov = 90; // min=10, max=160, step=0.1
let subdiv = 16; // DIS min=1, max=1024, step=1
let subdiv_target = 1.5; // min=0.01, max=50, step=0.01
const subdivExtra = 1; // DIS min=0, max=1, step=1
let grid_size = 0.2; // DIS min = 0.05, max=20, step=0.05

let aob1 = 0; // DIS min=0, max=4, step=0.01
let aob2 = 0; // DIS min=0, max=4, step=0.01

let scene = null;
let turtle = null;

let circleSubdiv = 16; // min=3, max=256, step=1

let useGrid = 0; // DIS min=0, max=2, step=1

const DEBUG_N_ON_SURFACE = true;
const INCREMENTAL = true;
let sceneGen = null;

class Psdr {
    constructor(seed = 1) {
        this.s = seed;
    }
    getInt() {
        this.s = ((this.s|0) * 48271) % 2147483647;
        return this.s;
    }
    coin(p) {
        let v = this.getInt()*1.0 / 2147483647;
        return v < p;
    }
}
let psdr = new Psdr(seed);

function init2() {
    // Global code will be evaluated once.
    //const turtle = new Turtle();

    scene = new Scene();
    scene.w = scene.h = viewSize;
    if (perspective > 0) {
        scene.fov = [fov, fov];
        scene.setPerspective(new V3(0, 0, 0), new V3(0, 0, 0));
    } else {
        scene.setOrthographic(100 / cd, new V3(0, 0, 0), new V3(0, 0, 0));
    }
    let pipe_region =  pipe_grid * segment_l;
    let camera_target = new V3(0.5*pipe_region, 0.5*pipe_region, 0.5*pipe_region);
    scene.camera_pos = Scene.worldCameraOrbit(camera_target, cd, a1, a2);


    let sdf2 = new SDF2();
    sdf2.MAX_STEPS = 160;
    sdf2.TANGENT_HACK = 0.1;
    sdf2.SUBDIV_TARGET = subdiv_target;
    sdf2.enableGrid = useGrid;
    sdf2.grid_step = grid_size;

    let grid = [];
    for (let i=0; i<pipe_grid; i++) {
        grid[i] = [];
        for (let j=0; j<pipe_grid; j++) {
            grid[i][j] = new Uint8Array(pipe_grid).fill(0);
        }
    }

    /**  @type {V3} */
    let pos = null;
    /**  @type {V3} */
    let start = null;
    /**  @type {V3} */
    let dir = null;
    let total = 0;
    let empty = function(p) {
        if (p.x < 0 || p.x >= pipe_grid ||
            p.y < 0 || p.y >= pipe_grid ||
            p.z < 0 || p.z >= pipe_grid) {
                return false;
        }
        return grid[p.x][p.y][p.z] == 0;
    }
    while (total < total_segments) {
        total++;
        console.log(pos);
        if (pos == null) {
            pos = null;
            let attempts = 50;
            while (!pos && attempts > 0) {
                let p = V(psdr.getInt() % pipe_grid, psdr.getInt() % pipe_grid, psdr.getInt() % pipe_grid);
                if (!grid[p.x][p.y][p.z]) {
                    pos = p;
                    start = pos.copy()
                    dir = V3.D3_6[psdr.getInt() % 6];
                    break;
                }
                attempts--;
            }
            if (attempts <= 0) {
                break;
            }
            grid[pos.x][pos.y][pos.z] = 1;
        }
        let end_of_pipe = total >= total_segments || psdr.coin(p_stop);
        let next = pos.add(dir);
        if (!empty(next) || psdr.coin(p_bend) || end_of_pipe) {
            let d0 = psdr.getInt() % 6;
            let next_dir = null;
            for (let i=0; i<6; i++) {
                let d = V3.D3_6[(d0 + i) % 6];
                if (d == dir) {
                    continue;
                }
                if (empty(pos.add(d))) {
                    next_dir = d;
                    break;
                }
            }
            let len = pos.sub(start).magnitude();
            if (len > 0) {
                let l = len * segment_l;
                let p0 = start.mul(segment_l)
                let ball_r = pipe_r * (psdr.coin(p_balls) ? 1.5 : 1.01);
                if (quick_preview) {
                    scene.addLine(p0, p0.add(dir.mul(l)));
                } else {
                    let pipe = new SDF2.Cylinder(pipe_r, l*0.5);
                    let tr = M4.fromDirZ(dir);
                    tr.setTranslate(p0.add(dir.mul(l* 0.5)));
                    pipe = pipe.tr(tr);
                    sdf2.addObj(pipe);
                    sdf2.addObj(
                        new SDF2.Sphere(ball_r).tr(M4.translate(p0))
                    );
                }
            }
            if (!next_dir) {
                end_of_pipe = true;
            }
            dir = next_dir;
            start = pos;
        }
        if (end_of_pipe) {
            pos = null;
            continue;
        }
        pos = pos.add(dir);
        grid[pos.x][pos.y][pos.z] = 1;
    }

    /*let p = new SDF2.Box(V(1, 1, 1));
    sdf2.addObj(p);*/

    sdf2.process(scene);
    if (!INCREMENTAL) {
        sdf2.draw_to_scene(scene);
        scene.draw();
    } else {
        scene.draw(); // fixed non SDF objects
        sceneGen = sdf2.drawIncremental(scene);
    }
}
// The walk function will be called until it returns false.
function walk(i) {
    if (!sceneGen) {
        return false;
    }
    let r = sceneGen.next();
    let r2 = r.value;
    if (r.value) {
        let ob = r.value;
        scene.drawincremental(ob);
    }
    return !r.done;
}

class V3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static V0 = new V3(0, 0, 0);
    static D3_6 = [
        new V3(1, 0, 0),
        new V3(0, 1, 0),
        new V3(0, 0, 1),
        new V3(-1, 0, 0),
        new V3(0, -1, 0),
        new V3(0, 0, -1),
    ];
    toString() { return `V3(${this.x}, ${this.y}, ${this.z})`; }
    add(b) { return new V3(this.x + b.x, this.y + b.y, this.z + b.z); }
    sub(b) { return new V3(this.x - b.x, this.y - b.y, this.z - b.z); }
    mul(b) { return new V3(this.x * b, this.y * b, this.z * b); }
    scale(b) { return new V3(this.x * b.x, this.y * b.y, this.z * b.z); }
    flipx() { return new V3(-this.x, this.y, this.z); }
    flipy() { return new V3(this.x, -this.y, this.z); }
    copy() { return new V3(this.x, this.y, this.z); }
    changex(v) { let res = this.copy(); res.x = v; return res; }
    changey(v) { let res = this.copy(); res.y = v; return res; }
    changez(v) { let res = this.copy(); res.z = v; return res; }
    len2() { return this.x * this.x + this.y * this.y + this.z * this.z; }
    static lerp(a, b, x) { return a.mul(1 - x).add(b.mul(x)); }
    magnitude() { return Math.sqrt(this.len2()); }
    normalized() { return this.mul(1 / this.magnitude()); }
    xyzs() { return this.x + this.y + this.z }
    xyzMax() { return Math.max(this.x, this.y, this.z); }
    xyzMin() { return Math.min(this.x, this.y, this.z); }
    yzx() { return new V3(this.y, this.z, this.x); }
    zxy() { return new V3(this.z, this.x, this.y); }
    swizzleSimple(v) {
        if (v.x > 0) {
            return this.zxy();
        } else if (v.y > 0) {
            return this.yzx();
        }
        return this;
    }

    abs() { return new V3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)); }
    max(b) { return new V3(Math.max(this.x, b.x), Math.max(this.y, b.y), Math.max(this.z, b.z)); }
    min(b) { return new V3(Math.min(this.x, b.x), Math.min(this.y, b.y), Math.min(this.z, b.z)); }
    maxK(k) { return new V3(Math.max(this.x, k), Math.max(this.y, k), Math.max(this.z, k)); }
    minK(k) { return new V3(Math.min(this.x, k), Math.min(this.y, k), Math.min(this.z, k)); }
    sgn() { return new V3(Math.sign(this.x), Math.sign(this.y), Math.sign(this.z)); }
    dot(b) { return this.scale(b).xyzs(); }
    cross(b) {
        let a = this;
        return new V3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    }
    rotDeg(deg) {
        const a = deg * Math.PI / 180;
        const s = Math.sin(a);
        const c = Math.cos(a);
        return new V2(this.x * c - this.y * s, this.x * s + this.y * c);
    }
}
class M4 {
    constructor(d = null) {
        this.d = d;
        if (!d) {
            this.d = [[1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]];
        }
    }
    copy() {
        let result = new M4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.d[i][j] = this.d[i][j];
            }
        }
        return result;
    }

    mul(b) {
        let res = new M4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let s = 0;
                for (let k = 0; k < 4; k++) {
                    s += this.d[i][k] * b.d[k][j]
                }
                res.d[i][j] = s;
            }
        }
        return res;
    }
    transpose() {
        let res = new M4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                res.d[i][j] = this.d[j][i];
            }
        }
        return res;
    }
    mulv(v) {
        let vv = [v.x, v.y, v.z, 1];
        let res = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            for (let k = 0; k < 4; k++) {
                res[i] += this.d[i][k] * vv[k];
            }
        }
        return new V3(res[0], res[1], res[2]);
    }
    muldir(v) {
        let vv = [v.x, v.y, v.z, 1];
        let res = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            for (let k = 0; k < 3; k++) {
                res[i] += this.d[i][k] * vv[k];
            }
        }
        return new V3(res[0], res[1], res[2]);
    }
    static translate(v, y = undefined, z = undefined) {
        if (y !== undefined) {
            let r = new M4();
            r.d[0][3] = v;
            r.d[1][3] = y;
            r.d[2][3] = z;
            return r;
        }
        let r = new M4();
        r.setTranslate(v);
        return r;
    }
    setTranslate(v) {
        this.d[0][3] = v.x;
        this.d[1][3] = v.y;
        this.d[2][3] = v.z;
    }
    translation(v) {
        return new V3(this.d[0][3], this.d[1][3], this.d[2][3]);
    }
    static scale(x) {
        let r = new M4();
        r.d[0][0] = x;
        r.d[1][1] = x;
        r.d[2][2] = x;
        return r;
    }
    static scale3(x, y, z = 1) {
        let r = new M4();
        r.d[0][0] = x;
        r.d[1][1] = y;
        r.d[2][2] = z;
        return r;
    }
    /**
     * 
     * @param {V3} dir 
     * @param {V3} up 
     * @returns {M4}
     */
    static fromDirZ(dir, up=null) {
        dir = dir.normalized();
        if (up == null) {
            up = new V3(0, 0, 1);
        } else {
            up = up.normalized();
        }
        if (up.sub(dir).len2() < 0.0000001 || 
            up.add(dir).len2() < 0.0000001) {
            up = new V3(dir.y, dir.z, dir.x);
        }
        // TODO: correct sign
        let left = dir.cross(up);
        up = left.cross(dir);
        return new M4([
            [left.x, up.x, dir.x, 0],
            [left.y, up.y, dir.y, 0],
            [left.z, up.z, dir.z, 0],
            [0, 0, 0, 1],
        ]);
    }
    static euler(a, b, c) {
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
        let res = [];
        for (let i = 0; i < 4; i++) {
            res[i] = this.d[i].slice();
            for (let j = 0; j < 4; j++) {
                res[i].push(i == j ? 1 : 0);
            }
        }
        for (let i = 0; i < 4; i++) {
            let r = i;
            for (let j = i; j < 4; j++) {
                if (Math.abs(res[j][i]) > Math.abs(res[r][i])) {
                    r = j;
                }
            }
            [res[i], res[r]] = [res[r], res[i]];
            if (res[i][i] != 0) {
                let k = 1 / res[i][i];
                res[i] = res[i].map((x) => x * k);

                for (let j = i + 1; j < 4; j++) {
                    let k2 = res[j][i];
                    for (let column = i; column < 8; column++) {
                        res[j][column] = res[j][column] - k2 * res[i][column];
                    }
                }
            }
        }
        for (let i = 3; i >= 0; i--) {
            for (let j = 0; j < i; j++) {
                let mul = res[j][i];
                for (let k = 0; k < 8; k++) {
                    res[j][k] -= res[i][k] * mul;
                }
            }
        }
        for (let i = 0; i < 4; i++) {
            res[i] = res[i].slice(4);
        }
        return new M4(res);
    }
}
class Util {
    static rndRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    static rndInt(max_excl) {
        return Math.min(Math.floor(Math.random() * max_excl), max_excl - 1);
    }
    static radians(a) {
        return a * Math.PI / 180;
    }
    static inverseLerp(a, b, x) {
        let d = b - a;
        if (d != 0) {
            return (x - a) / d;
        } else {
            return 0;
        }
    }
    static lerp(a, b, x) {
        return (1 - x) * a + x * b;
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

    static clipRect(a, b, r) {
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
        let t1 = 1 - t;
        return p0.mul(t1 * t1 * t1).add(p1.mul(t1 * t1 * t * 3)).add(p2.mul(t1 * t * t * 3)).add(p3.mul(t * t * t));
    }
    /**
     * 
     * @param {V3} p0 
     * @param {V3} p1 
     * @param {V3} p2 
     * @returns {[V3]}
     */
    static quad_bezier_to_cubic(p0, p1, p2) {
        return [p0, p0.add(p1.sub(p0).mul(2 / 3)), p2.add(p1.sub(p2).mul(2 / 3)), p2];
    }
}
class Scene {
    constructor() {
        this.camera_pos_inverse = new M4();
        this.camera_pos = Scene.worldCameraM(new V3(0, 0, 0), new V3(1, 0, 0));
        this.camera_inverse = new M4();
        this.camera = Scene.orthographic1();
        this.lines = [];
        this.ortho = true;
        this.w = 100;
        this.h = 100;
        this.fov = [90, 90];
    }
    set camera_pos(v) {
        this._camera_pos = v;
        this.camera_pos_inverse = v.inverse();
    }
    /**
     * @type {M4}
     */
    get camera_pos() {
        return this._camera_pos;
    }
    set camera(m) {
        this._camera = m;
        this.camera_inverse = m.inverse();
    }
    /**
     * @type {M4}
     */
    get camera() {
        return this._camera;
    }
    addLine(a, b) {
        this.lines.push([a, b]);
    }
    addOb(x) {
        for (var line of x.lines) {
            let lineData = line.data;
            for (let i = 1; i < lineData.length; i++) {
                this.lines.push([lineData[i - 1], lineData[i]]);
            }
        }
    }
    mapPoint(x) {
        let p = this.camera.mulv(x);
        if (this.ortho) {
            // ok
        } else if (p.z != 0) {
            p = p.mul(1 / Math.abs(p.z));
        } else {
            p.x = 0; p.y = 0;
        }
        return p;
    }

    mapWorldPoint(p) {
        let cam = this.camera_pos.mulv(p);
        let z = cam.z;
        return this.mapPoint(cam).changez(z);
    }

    drawincremental(ob) {
        let lastPoint = null;
        turtle.pendown();
        ob.lines.forEach((line) => {
            for (let i = 1; i < line.data.length; i++) {
                let debug = false;
                let l = [line.data[i - 1], line.data[i]];
                if (l[0].z > 0 && l[1].z > 0) {
                    debug = true;
                }
                let p1 = this.camera_pos.mulv(l[0]);
                let p2 = this.camera_pos.mulv(l[1]);

                if (!this.ortho) {
                    let p0 = new V3(0, 0, 0);
                    let norm = new V3();
                    let line = [p1, p2];
                    let a1 = Math.PI * 0.5 * this.fov[0] / 180;
                    let a2 = Math.PI * 0.5 * this.fov[1] / 180;
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
                        continue
                    }
                }
                p1 = this.mapPoint(p1);
                p2 = this.mapPoint(p2);
                let connected = false;
                if (lastPoint != null) {
                    connected = lastPoint.sub(p1).len2() < 0.00001;
                }
                if (!connected) {
                    turtle.penup();
                    turtle.jump(p1.x, p1.y)
                    turtle.pendown();
                }
                turtle.goto(p2.x, p2.y);
                lastPoint = p2;
            }
        });
        turtle.penup();
    }

    draw() {
        let lastPoint = null;
        turtle.pendown();
        this.lines.forEach((l) => {
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
                let a1 = Math.PI * 0.5 * this.fov[0] / 180;
                let a2 = Math.PI * 0.5 * this.fov[1] / 180;
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
                connected = lastPoint.sub(p1).len2() < 0.00001;
            }
            if (!connected) {
                turtle.penup();
                turtle.jump(p1.x, p1.y)
                turtle.pendown();
            }
            turtle.goto(p2.x, p2.y);
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
        let m2 = (new M4()).mul(M4.euler(-a2, -a1, 0)).mul(M4.euler(Math.PI / 2, Math.PI, -Math.PI / 2));
        return m2.mul(m1);
    }
    static worldCameraM2(from, to) {
        let d = to.sub(from);
        let m1 = M4.translate(from.mul(-1));

        let a1 = Math.atan2(-d.x, d.y);
        let xy = d.changez(0);

        let a2 = Math.atan2(xy.magnitude(), d.z);
        let m2 = M4.euler(0, 0, a1);
        let m3 = M4.euler(-a2, 0, 0);
        return m2.mul(m3).mul(m1);
    }

    static worldCameraOrbit(to, distance, z0, x0) {
        let x = x0 * Math.PI / 180;
        let z = z0 * Math.PI / 180;
        let p = M4.euler(0, 0, z).mul(M4.euler(0, x, 0)).mulv(new V3(-1, 0, 0));
        let p2 = p.mul(distance).add(to);
        if (x0 > -90 && x0 < 90) {
            return Scene.worldCameraM(p2, p2.sub(p));
        } else {
            let m1 = M4.translate(p2.mul(-1));
            if (x0 > 0) {
                return M4.euler(0, 0, 1 * Math.PI / 2 - z).mul(m1);
            } else {
                return M4.euler(0, Math.PI, -1 * Math.PI / 2 - z).mul(m1);
            }

        }

    }
    cameraToWorld(p) {
        return this.camera_pos_inverse.mulv(p);
    }
    screenToWorld(p) {
        return this.camera_pos_inverse.mulv(this.camera_inverse.mulv(p));
    }

    static orthographic1(scale = 1) {
        let res = new M4();
        res.d = [
            [scale, 0, 0, 0],
            [0, -scale, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
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
            [scale, 0, 0, 0],
            [0, -scale, 0, 0],
            [0, 0, -1, 0],
            [0, 0, 0, 1],
        ];
        return res;
    }
    setPerspective(from, to) {

        this.camera = Scene.perspective(this.w * 0.5 * Math.tan((90 - this.fov[0] * 0.5) / 180 * Math.PI));
        this.camera_pos = Scene.worldCameraM(from, to);
        this.ortho = false;
    }
}
class StrokeInfo {
    constructor(data) {
        this.p0 = null;
        this.data = data;
    }
    copy() {
        let result = new StrokeInfo(this.data.slice());
        result.p0 = this.data;
        return result;
    }
    last() {
        if (this.data.length == 0) {
            return null;
        }
        return this.data[this.data.length - 1];
    }
}
class Ob {
    constructor() {
        /** @type [StrokeInfo] */
        this.lines = [];
    }
    static fromChain(points) {
        let res = new Ob();
        let resLine = new StrokeInfo(points.slice());
        res.lines = [resLine];
        return res;
    }
    static fromLinesFlat(points) {
        let res = new Ob();
        res.lines = [];
        for (let i=0; i+1<points.length; i+=2) {
            res.lines.push(new StrokeInfo([points[i], points[i+1]]));
        }
        return res;
    }
    static fromLoop(points) {
        let res = Ob.fromChain(points);
        if (points.length > 1) {
            res.lines[0].data.push(res.lines[0].data[0]);
        }
        return res;
    }
    static cubic_bezier(p0, p1, p2, p3, steps = 32) {
        let result = [p0];
        for (let i = 1; i < steps; i++) {
            result.push(Util.cubic_bezier(p0, p1, p2, p3, i / steps));
        }
        result.push(p3);
        return Ob.fromChain(result);
    }
    static circle(r, p0 = null, subdiv = circleSubdiv) {
        if (p0 == null) {
            p0 = new V3(0, 0, 0);
        }
        let points = []
        for (let i = 0; i < subdiv; i++) {
            let a = (Math.PI * 2 * i) / subdiv;
            let pos = p0.add(new V3(Math.sin(a) * r, Math.cos(a) * r, 0));
            points.push(pos);
        }
        let res = Ob.fromLoop(points);
        let line = res.lines[0];
        line.p0 = p0;
        return res;
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
        let p = 0;
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
                for (let i = 0; i < points.length; i++) {
                    let p2 = points[i];
                    if (t == 'm') {
                        p2 = p2.add(pos);
                    }
                    if (i == 0) {
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
                for (let i = 0; i < points.length; i++) {
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
                for (let i = 0; i + step - 1 < points.length; i += step) {
                    let px = null;
                    if (step == 3) {
                        px = [points[i + 0], points[i + 1], points[i + 2]];
                    } else {
                        px = [points[i + 0], points[i + 0], points[i + 1]];
                    }

                    if (t == 'c' || t == 's') {
                        for (let j = 0; j < px.length; j++) {
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
                    res.addObMove(Ob.cubic_bezier(pos, px[0], px[1], px[2]));
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
                for (let i = 0; i + step - 1 < points.length; i += step) {
                    let px = null;
                    if (step == 2) {
                        px = [points[i + 1], points[i + 2]];
                    } else {
                        px = [points[i + 0], points[i + 0]];
                    }

                    if (t == 'q' || t == 't') {
                        for (let j = 0; j < px.length; j++) {
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
                    res.addObMove(Ob.cubic_bezier(pos, px[1], px[2], px[3]));
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
                for (let i = 0; i + 6 < numbers.length; i += 7) {
                    let rx = numbers[i + 0];
                    let ry = numbers[i + 1];
                    let angle = numbers[i + 2];
                    let large_arc = numbers[i + 3];
                    let sweep_flag = numbers[i + 4];
                    let p2 = new V3(numbers[i + 4], numbers[i + 5]);

                    if (t == 'a') {
                        p2 = p2.add(pos);
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
    addLine(a, b) {
        if (this.lines.length > 0) {
            let line = this.lines[0];
            if (line.last() == a) {
                line.data.push(b);
                return;
            }
        }
        this.lines.push(new StrokeInfo([a, b]));
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
            this.lines.push(line.copy());
        }
    }
    addObMove(o) {
        for (const line of o.lines) {
            this.lines.push(line);
        }
    }
    transform(m) {
        for (let line of this.lines) {
            for (let i = 0; i < line.data.length; i++) {
                line.data[i] = m.mulv(line.data[i]);
            }
            if (line.p0) {
                line.p0 = m.mulv(line.p0);
            }
        }
    }
    transformed(m) {
        let r = new Ob();
        r.addOb(this);
        r.transform(m);
        return r;
    }
}

class SDFR {
    constructor(d, norm, obj) {
        /** @type {float} */
        this.d = d;
        /** @type {V3} */
        this.norm = norm;
        this.obj = obj;
    }
}
class SDFF {
    static DETECT_EDGE_EMPTY = 1;
    static DETECT_EDGE_FRONT = 2;
    static DETECT_EDGE_EXTERNALG = 4;
    static DETECT_EDGE_INTERNALG = 8;
    static DETECT_EDGE_SURFACE = 16;

    constructor(args) {
        if (!args) {
            args = {}
        }
        this.transform = new M4();
        this.format(args);
    }
    get primitive() {
        return false;
    }
    get curved() {
        return true;
    }
    tr(t) {
        this.transform = t.mul(this.transform);
        return this;
    }
    format(args) {
        if ("textures" in args) {
            this.textures = args.textures;
        }
        if ("line_style" in args) {
            this.line_style = args.line_style;
        }
        if ("invisible_style" in args) {
            this.invisible_style = args.invisible_style;
        }
        if ("detect_edges" in args) {
            this.detect_edges = args.detect_edges;
        }
        if ("groot" in args) {
            this.groot = args.groot;
        }
        return this;
    }
    /**
     * 
     * @param {Scene} camera_info 
     * @param {SDFNode} t 
     * @returns {null|Ob}
     */
    get_lines(camera_info, t) {
        return null;
    }
    get_texture(texture, node, camera_info) {
        return null;
    }
    add(x) {
        return new SDF2.Union(this, x);
    }
    sub(x) {
        return new SDF2.Diff(this, x);
    }

}

class SDFNode {
    /**
     * 
     * @param {SDFNode} parent 
     */
    constructor(parent) {
        this.a = null;
        this.b = null;
        /** @type{M4} */
        this.transform = null;
        /** @type{M4} */
        this.inverse_transform = null;
        

        this.line_style = 1;
        this.invisible_style = null;
        this.textures = null;
        this.detect_edges = 0;
        this.group = -1;
        if (parent) {
            this.line_style = parent.line_style;
            this.invisible_style = parent.invisible_style;
            this.textures = parent.textures;
            this.detect_edges = parent.detect_edges;
            this.group = parent.group;
        }

        this.sign = 1;
        this.index = -1;
        /** @type{SDFF} */
        this.func = null;
    }
}

let sdf_runs = 0;

class SDF2 {

    static Sphere = class extends SDFF {
        constructor(r, args = null) {
            super(args);
            this.r = r;
        }
        do(p, id = null) {
            let v = p;
            let m = v.magnitude();
            let d = m - this.r;
            let norm = null;
            norm = v;
            /*if (d > 0) {
                norm = v;
            } else {
                norm = v.mul(-1);
            }*/
            return new SDFR(d, norm, id);
        }

        get primitive() {
            return true;
        }
        /**
         * 
         * @param {Scene} camera_info 
         * @param {SDFNode} node
         * @returns {Ob}
         */
        get_lines(camera_info, node) {
            let result = null;
            let p0 = camera_info.cameraToWorld(V(0, 0, 0));
            let forward = camera_info.cameraToWorld(V(0, 0, -1)).sub(p0);
            if (camera_info.ortho) {
                result = Ob.circle(this.r);
                let transform = camera_info.camera_pos_inverse.copy();
                transform.setTranslate(new V3());
                let objTransform = node.inverse_transform.copy();
                objTransform.setTranslate(new V3())
                result.transform(objTransform.mul(transform));
            } else {
                let pObj = node.transform.translation();
                let posRelative = pObj.sub(p0);
                let d = posRelative.magnitude();
                if (d < this.r) {
                    return null;
                }
                let r = this.r;
                let tangent = Math.sqrt(d * d - r * r);
                let radiusOutline = r * tangent / d;
                let offset = r * r / d;
                let o = Ob.circle(radiusOutline, new V3(0, 0, offset));

                let objTransform = node.inverse_transform.copy();
                objTransform.setTranslate(new V3())
                let tr = Scene.worldCameraM2(new V3(), posRelative.mul(-1));
                tr.setTranslate(new V3());

                result = o;
                o.transform(objTransform.mul(tr));
            }
            return result;
        }
        get_texture(texture, node, camera_info) {
            let result = new Ob();
            switch (texture.id) {
                case "slice_local":
                    {
                        let dir = V(0, 0, 1);
                        if (texture.dir) {
                            dir = texture.dir;
                        }

                        let step = texture.step;
                        for (let z = -this.r + step; z < this.r; z += step) {
                            let r2 = Math.sqrt(this.r * this.r - z * z);
                            let ring = Ob.circle(r2, new V3(0, 0, z));
                            let ringData = ring.lines[0].data;
                            for (let i = 0; i < ringData.length; i++) {
                                ringData[i] = ringData[i].swizzleSimple(dir);
                            }
                            ring.lines[0].p0 = ring.lines[0].p0.swizzleSimple(dir);
                            result.addObMove(ring);
                        }
                        return result;
                    }
                    break;
            }
            return super.get_texture(texture, node, camera_info);
        }
    }
    static Cylinder = class extends SDFF {
        constructor(r, h, args = null) {
            super(args);
            this.r = r;
            this.h = h;
        }
        /**
         * 
         * @param {V3} p 
         * @param {*} id 
         * @returns {SDFR}
         */
        do(p, id = null) {
            let flip = p.z < 0 ? -1 : 1;
            p.z *= flip;
            let v = p.changez(0);
            let d = v.magnitude() - this.r;
            let dh = p.z - this.h;
            if (dh < 0) {
                //d = v.magnitude() - this.r;
            } else {
                if (d < 0) {
                    d = dh;
                    v = new V3(0, 0, d);
                } else {
                    v = v.sub(v.normalized().mul(this.r)).changez(dh)
                    d = v.magnitude();
                }
            }
            v.z = v.z * flip;
            return new SDFR(d, v, id);
        }

        get primitive() {
            return true;
        }
        /**
         * 
         * @param {Scene} camera_info 
         * @param {SDFNode} node 
         * @returns 
         */
        get_lines(camera_info, node) {
            let result = new Ob();

            result.addObMove(Ob.circle(this.r, new V3(0, 0, this.h)));
            result.addObMove(Ob.circle(this.r, new V3(0, 0, -this.h)));
            let p0 = camera_info.cameraToWorld(new V3());

            if (camera_info.ortho) {
                let forwardGlobal = camera_info.cameraToWorld(new V3(0, 0, -1)).sub(p0);
                let flocal = node.inverse_transform.muldir(forwardGlobal);

                let side = flocal.cross(new V3(0, 0, 1));
                side = side.mul(this.r / side.magnitude());
                result.addLine(side.changez(-this.h), side.changez(this.h));
                side = side.mul(-1);
                result.addLine(side.changez(-this.h), side.changez(this.h));
            } else {
                let cameraObjLocal = node.inverse_transform.mulv(p0).changez(0);
                let d = cameraObjLocal.magnitude();
                if (d <= this.r) {
                    return result;
                }
                let r = this.r;
                let tangent = Math.sqrt(d * d - r * r);
                let radiusOutline = r * tangent / d;
                let offset = r * r / d;

                let v1 = cameraObjLocal.normalized();
                let v2 = new V3(v1.y, -v1.x, 0);
                v1 = v1.mul(offset);
                v2 = v2.mul(radiusOutline);
                let side1 = v1.add(v2);
                let side2 = v1.sub(v2);

                result.addLine(side1.changez(-this.h), side1.changez(this.h));
                result.addLine(side2.changez(-this.h), side2.changez(this.h));
            }

            return result;
        }
        get_texture(texture, node, camera_info) {
            let result = new Ob();
            switch (texture.id) {
                case "slice_local":
                    {
                        let dir = V(0, 0, 1);
                        if (texture.dir) {
                            dir = texture.dir;
                        }

                        let step = texture.step;
                        if (dir.z > 0) {
                            for (let z = -this.h; z < this.h; z += step) {
                                result.addObMove(Ob.circle(this.r, new V3(0, 0, z)));
                            }
                        }

                        return result;
                    }
                    break;
            }
            return super.get_texture(texture, node, camera_info);
        }
    }
    static Box = class extends SDFF {
        constructor(size, args = null) {
            super(args);
            /** @type{V3} */
            this.size = size;
        }
        /**
         * 
         * @param {V3} p 
         * @returns {SDFR}
         */
        do(p, id = null) {
            let sc1 = p.sgn();
            p = p.scale(sc1);
            let q = p.sub(this.size);
            let [a, b, c] = [q.x, q.y, q.z];
            let d = 0;
            let norm = null;
            if (a < 0 && b < 0 && c < 0) {
                if (a > b && a > c) {
                    d = a;
                    norm = new V3(-d, 0, 0);
                } else if (b > c) {
                    d = b;
                    norm = new V3(0, -d, 0);
                } else {
                    d = c;
                    norm = new V3(0, 0, -c);
                }
            } else {
                norm = q.maxK(0);
                d = norm.magnitude();
            }
            return new SDFR(d, norm.scale(sc1), id);
        }
        get primitive() {
            return true;
        }
        get curved() {
            return false;
        }
        corner(m) {
            let r = this.size.mul(-1);
            if (m & 1) {
                r.x = -r.x;
            }
            if (m & 2) {
                r.y = -r.y;
            }
            if (m & 4) {
                r.z = -r.z;
            }
            return r;
        }
        get_lines(camera_info, node) {
            let result = new Ob();
            for (let mask = 0; mask < 7; mask++) {
                for (let j = 0; j < 3; j++) {
                    let m2 = mask | (1 << j);
                    if (m2 == mask) {
                        continue;
                    }
                    result.addLine(this.corner(mask), this.corner(m2));
                }
            }
            return result;
        }
        get_texture(texture, node, camera_info) {
            let result = new Ob();
            switch (texture.id) {
                case "slice_local":
                    {
                        let dir = V(0, 0, 1);
                        if (texture.dir) {
                            dir = texture.dir;
                        }

                        let step = texture.step;
                        if (dir.z > 0) {
                            for (let z = -this.size.z; z < this.size.z; z += step) {
                                result.addObMove(Ob.fromLoop([
                                    new V3(this.size.x, this.size.y, z),
                                    new V3(this.size.x, -this.size.y, z),
                                    new V3(-this.size.x, -this.size.y, z),
                                    new V3(-this.size.x, this.size.y, z)
                                ]));
                            }
                        } else if (dir.y > 0) {
                            for (let z = -this.size.y; z < this.size.y; z += step) {
                                result.addObMove(Ob.fromLoop([
                                    new V3(this.size.x, z, this.size.z),
                                    new V3(this.size.x, z, -this.size.z),
                                    new V3(-this.size.x, z, -this.size.z),
                                    new V3(-this.size.x, z, this.size.z),
                                    new V3(this.size.x, z, this.size.z),
                                ]));
                            }
                        } else {
                            for (let z = -this.size.x; z < this.size.x; z += step) {
                                result.addObMove(Ob.fromLoop([
                                    new V3(z, this.size.y, this.size.z),
                                    new V3(z, this.size.y, -this.size.z),
                                    new V3(z, -this.size.y, -this.size.z),
                                    new V3(z, -this.size.y, this.size.z),
                                    new V3(z, this.size.y, this.size.z),
                                ]));
                            }
                        }
                        return result;
                    }
                    break;
            }
            return super.get_texture(texture, node, camera_info);
        }
    }
    static Union = class extends SDFF {
        constructor(a, b, args = null) {
            super(args)
            this.a = a;
            this.b = b;
        }
        /**
         * 
         * @param {V3} p 
         * @returns {SDFR}
         */
        do(p, r1, r2) {
            if (r1.d < r2.d) {
                return r1;
            } else {
                return r2;
            }
        }
        static doStatic(p, r1, r2) {
            if (r1.d < r2.d) {
                return r1;
            } else {
                return r2;
            }
        }
    }
    static Diff = class extends SDFF {
        constructor(a, b, args = null) {
            super(args)
            this.a = a;
            this.b = b;
        }
        /**
         * 
         * @param {V3} p 
         * @returns {SDFR}
         */
        do(p, r1, r2) {
            r2.d *= -1;
            if (r1.d > r2.d) {
                return r1;
            } else {
                r2.norm = r2.norm.mul(-1);
                return r2;
            }
        }
    }
    static Intersection = class extends SDFF {
        constructor(a, b, args = null) {
            super(args)
            this.a = a;
            this.b = b;
        }
        /**
         * 
         * @param {V3} p 
         * @returns {SDFR}
         */
        do(p, r1, r2) {
            if (r1.d > r2.d) {
                return r1;
            } else {
                return r2;
            }
        }
    }
    static Xor = class extends SDFF {
        constructor(a, b, args = null) {
            super(args)
            this.a = a;
            this.b = b;
        }
        /**
         * 
         * @param {V3} p 
         * @returns {SDFR}
         */
        do(p, r1, r2) {
            if (r1.d >= r2.d) {
                [r1, r2] = [r2, r1];
            }
            if (r1.d > r2.d) {
                return r1;
            } else {
                r2.d *= -1;
                r2.norm = r2.norm.mul(-1);
                return r2;
            }
        }
    }
    constructor() {
        /** @type {SDFF} */
        this.objs = []
        this.tmpd = []
        /** @type {[SDFNode]} */
        this.o2 = [];

        this.MAX_STEPS = 300;
        this.RAY_MARCH_LIMIT = 0.0001;
        this.TANGENT_HACK = 0.01;
        this.SUBDIV_TARGET = 0.5;
        this.MAX_DISTANCE = 10000;
        this.EDGE_SEARCH_ITER = 16;

        this.grid_step = 1;


        this.enableGrid = 1;

        /** @type {[[[V3, float, SDFR]]]} */
        this.grid = null;
    }

    addObj(x) {
        this.objs.push(x);
    }
    /**
     * 
     * @param {V3} p 
     * @param {SDFNode} offsetNode
     * @returns {SDFR}
     */
    calcSDF(p, offsetNode = null) {
        sdf_runs++;
        for (let i of this.primitive) {
            let node = this.o2[i];
            let p2 = node.inverse_transform.mulv(p);
            this.tmpd[i] = node.func.do(p2, this.o2[i]);
        }
        if (offsetNode) {
            this.tmpd[offsetNode.index].d += offsetNode.sign * this.TANGENT_HACK;
        }
        for (let i = this.combine.length - 1; i >= 0; --i) {
            let index = this.combine[i];
            let node = this.o2[index];
            let r1 = this.tmpd[node.a];
            let r2 = this.tmpd[node.b];
            this.tmpd[index] = node.func.do(p, r1, r2);
        }
        let res = null;
        for (let i of this.root) {
            if (res) {
                res = SDF2.Union.doStatic(p, res, this.tmpd[i]);
            } else {
                res = this.tmpd[i];
            }
        }
        return res;
    }

    runRay(p0, dir, limit, offsetNode = null) {
        let travel = 0;
        let p = p0;
        let result = null;
        let steps = 0;
        while (travel < limit) {
            steps++;
            /** @type {SDFR} */
            let hit = this.calcSDF(p, offsetNode);
            let distance = hit.d;
            if (distance < this.RAY_MARCH_LIMIT || steps > this.MAX_STEPS) {
                result = hit;
                break;
            }
            distance = Math.min(limit - travel, distance);
            p = p.add(dir.mul(distance));
            travel += distance;
        }
        return [p, travel, result];
    }
    clipReach(p0, point, ortho, forward, mustBeOnSurface, node = null) {
        if (mustBeOnSurface && DEBUG_N_ON_SURFACE) {
            let d = 0;
            if (!node) {
                d = Math.abs(this.calcSDF(point).d);
            } else {
                let hit = this.calcSDF(point);
                if (hit.obj != node) {
                    return -1;
                }
                d = Math.abs(hit.d);
            }
            if (d > 0.001) {
                return -1;
            }
        }
        let dir = point.sub(p0);
        let dis = null;
        if (ortho) {
            let fnorm = forward.normalized();
            let l = fnorm.dot(dir);
            let sideway = dir.sub(fnorm.mul(l));
            p0 = p0.add(sideway);
            dir = fnorm;
            dis = point.sub(p0).magnitude();
        } else {
            forward = point.sub(p0);
            dir = forward;
            let len2 = dir.len2();
            if (len2 <= 0.001) {
                return 0;
            }
            dis = Math.sqrt(len2);
            dir = dir.mul(1 / dis);
        }
        let [pRay, pTravel, hit] = this.runRay(p0, dir, dis, node);
        if (pRay.sub(point).len2() > 0.0001) {
            return 0;
        }
        return 1;
    }

    /**
     * 
     * @param {V3} p 
     * @param {SDFF} node 
     */
    snap_to_surface(p, node) {
        if (!DEBUG_N_ON_SURFACE) {
            return p;
        }
        let p2Local = node.inverse_transform.mulv(p);
        /** @type {SDFR} */
        let sdfi = node.func.do(p2Local);
        let norm = sdfi.norm;
        let l2 = norm.len2();
        if (l2 <= 0.00001) {
            return p;
        }
        norm = norm.mul(sdfi.d / Math.sqrt(l2));
        return p.sub(node.transform.muldir(norm));
    }

    /**
     * 
     * @param {V3} a 
     * @param {V3} b 
     * @param {float} k 
     * @param {StrokeInfo} stroke 
     * @param {SDFNode} node 
     */
    interpolate_point(a, b, k, stroke, node) {
        let p = V3.lerp(a, b, k);

        if (stroke.p0) {
            let p0 = stroke.p0;
            let r1 = a.sub(p0).len2();
            let plocal = p.sub(p0);
            let r2 = plocal.len2()
            if (r2 > 0.00001 && r1 > 0.00001) {
                p = plocal.mul(Math.sqrt(r1 / r2)).add(p0);
            }
        }

        if (node.func.curved) {
            p = this.snap_to_surface(p, node);
        }
        return p;
    }

    /**
     * 
     * @param {Scene} camera_info 
     * @param {Ob} shape 
     * @param {SDFNode} node 
     */
    clip_lines(camera_info, shape, node, style, invisible_style = null) {
        let result = new Ob();
        let p0 = camera_info.cameraToWorld(V(0, 0, 0));
        let ortho = camera_info.ortho;
        let forward = camera_info.cameraToWorld(V(0, 0, -1)).sub(p0);

        let show_invisible = false;

        if (invisible_style) {
            show_invisible = true;
        }

        for (let line of shape.lines) {
            let chain = null;
            let chain_invisible = null;

            let last_normal = null;
            let last_invisible = null;
            //TODO: camera clipping
            let addSegment = function (a, b, invisible, show_invisible = false) {
                let cur_style = invisible ? invisible_style : style;
                if (cur_style == null) {
                    chain = null;
                    last_normal = null;
                    chain_invisible = null;
                    last_invisible = null;
                    return;
                }
                let last = invisible ? last_invisible : last_normal;
                if (last && last.length > 0) {
                    last[last.length - 1] = b;
                    return;
                }
                let active_chain = invisible ? chain_invisible : chain;
                if (!active_chain) {
                    active_chain = new StrokeInfo([a]);
                    if (invisible) {
                        active_chain.style = invisible_style;
                        chain_invisible = active_chain;
                    } else {
                        active_chain.style = style;
                        chain = active_chain;
                    }
                    result.lines.push(active_chain);
                }
                active_chain.data.push(b);
                if (invisible) {
                    last_invisible = active_chain.data;
                    chain = null;
                    last_normal = null;
                } else {
                    last_normal = active_chain.data;
                    chain_invisible = null;
                    last_invisible = null;
                }
            }

            let points = line.data;
            for (let j = 1; j < points.length; j++) {
                let pa = points[j - 1];
                let pb = points[j];
                last_normal = last_invisible = null;

                let prev = pa;
                let prevOnLine = pa;
                let k = 1 / subdiv;
                let recalcSize = 0.26;
                let recalcStep = 0.0 - 0.001;
                for (let progress = 0; progress < 1; progress += k) {

                    let next = progress + k;
                    if (next > recalcStep) {
                        let sc1 = camera_info.mapWorldPoint(prevOnLine);
                        recalcStep += recalcSize;
                        let nextP = null
                        let nextScreen = null;

                        let target2 = this.SUBDIV_TARGET * this.SUBDIV_TARGET;
                        do {
                            k *= 0.5;
                            next = Math.min(progress + k, 1);
                            nextP = V3.lerp(pa, pb, next);
                            nextScreen = camera_info.mapWorldPoint(nextP);
                        } while (sc1.sub(nextScreen).changez(0).len2() > target2 && k > 0.01);
                        do {
                            k *= 2;
                            next = Math.min(progress + k, 1);
                            nextP = V3.lerp(pa, pb, next);
                            nextScreen = camera_info.mapWorldPoint(nextP)
                        } while (sc1.sub(nextScreen).changez(0).len2() < target2 && k < 1 - progress);
                        next = progress + k;
                        //console.log(`recalc ${k} ${sc1.sub(nextScreen).changez(0).magnitude()}`);
                    }
                    next = Math.min(next, 1);
                    prevOnLine = V3.lerp(pa, pb, next);
                    let p2 = this.interpolate_point(pa, pb, next, line, node);

                    if (node.func.curved || line.p0) {
                        last_normal = last_invisible = null;
                    }
                    // todo snap to surface
                    let r1 = this.clipReach(p0, prev, ortho, forward, true, node);
                    let r2 = this.clipReach(p0, p2, ortho, forward, true, node);
                    if (r1 > 0 && r2 > 0) {
                        addSegment(prev, p2, false);
                    } else if (subdivExtra && (r1 > 0) != (r2 > 0)) {
                        let [l, r] = [prev, p2];
                        let m = null;
                        for (let iter = 0; iter < 10; iter++) {
                            m = this.interpolate_point(l, r, 0.5, line, node);
                            let good = this.clipReach(p0, m, ortho, forward, true, node) > 0;
                            if ((r1 > 0) == good) {
                                l = m;
                            } else {
                                r = m;
                            }
                        }
                        if (r1 > 0) {
                            addSegment(prev, m, false);
                            if (r2 == 0) {
                                addSegment(m, p2, true, show_invisible);
                            } else {
                                chain = chain_invisible = last_normal = last_invisible = null;
                            }

                        } else {
                            if (r1 == 0) {
                                addSegment(prev, m, true, show_invisible);
                            } else {
                                chain = chain_invisible = last_normal = last_invisible = null;
                            }
                            addSegment(m, p2, false);
                        }
                    } else {
                        if (r1 == 0 && r2 == 0) {
                            addSegment(prev, p2, true, show_invisible);
                        } else {
                            chain = chain_invisible = last_normal = last_invisible = null;
                        }
                    }
                    prev = p2;
                }
            }
        }
        return result;
    }

    process(camera_info) {
        let o2 = [];
        let root = [];
        let combine = [];
        let primitive = [];

        function recursiveProc(x, transform, parent, sign) {
            let index = o2.length;
            let t2 = transform.mul(x.transform);
            if (x.primitive) {
                primitive.push(index);
            } else {
                combine.push(index);
            }

            let node = new SDFNode(parent);
            node.sign = sign;
            node.func = x;
            node.transform = t2;

            if (x.textures !== undefined) {
                node.textures = x.textures;
            }
            if (x.line_style !== undefined) {
                node.line_style = x.line_style;
            }
            if (x.invisible_style !== undefined) {
                node.invisible_style = x.invisible_style;
            }
            if (x.detect_edges !== undefined) {
                node.detect_edges = x.detect_edges;
            }
            if (x.groot) {
                node.group = index;
            }

            node.index = index;
            o2.push(node);
            if (!x.primitive) {
                node.a = recursiveProc(x.a, t2, node, sign);
                let subSign = 1;
                if (x instanceof SDF2.Diff) {
                    subSign = -1;
                }
                node.b = recursiveProc(x.b, t2, node, sign * subSign);
            }
            return index;
        }
        let identity_transform = new M4();
        let dummyParent = new SDFNode();
        for (let item of this.objs) {
            root.push(recursiveProc(item, identity_transform, dummyParent, 1));
        }
        this.o2 = o2;
        this.root = root;
        this.combine = combine;
        this.primitive = primitive;
        for (let o of this.o2) {
            o.inverse_transform = o.transform.inverse();
        }
    }

    gridPos(i, j, camera_info) {
        let w = camera_info.w;
        let n = this.grid.length;
        return new V3((j * w / n) - 0.5 * w, (i * w / n) - 0.5 * w, 0);
    }

    /**
     * 
     * @param {Scene} camera_info 
     */
    *calcGrid(camera_info) {
        let c = camera_info.screenToWorld(new V3(0, 0, 1));
        let vy = camera_info.screenToWorld(new V3(0, 1, 1)).sub(c);
        let vx = camera_info.screenToWorld(new V3(1, 0, 1)).sub(c);

        let n = Math.floor(camera_info.w / this.grid_step);
        let res = [];
        for (let i = 0; i < n; i++) {
            let a = [];
            a.length = n;
            res.push(a);
        }
        this.grid = res;
        let forward = camera_info.camera_pos_inverse.muldir(new V3(0, 0, -1));
        let p0 = camera_info.cameraToWorld(new V3());
        let w = camera_info.w;

        /*let debug_points = [
            camera_info.screenToWorld(new V3(w*0.5, 0, 1)),
            camera_info.screenToWorld(new V3(0, w*0.5, 1)),
            camera_info.screenToWorld(new V3(-w*0.5, 0, 1)),
            camera_info.screenToWorld(new V3(0, -w*0.5, 1)),
        ];
        let debugOb = Ob.fromLoop(debug_points);
        camera_info.drawincremental(debugOb);*/

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                let p = this.gridPos(i, j, camera_info);
                let worldP = c.add(vx.mul(p.x)).add(vy.mul(p.y));
                let f = forward;
                if (!camera_info.ortho) {
                    f = worldP.sub(p0).normalized();
                    worldP = p0;
                }
                let rayResult = this.runRay(worldP, f, this.MAX_DISTANCE, null);
                res[i][j] = rayResult;
            }
            //console.log(`${i}/${n}`);
            yield null;
        }
        //camera_info.drawincremental(ob);
    }

    /**
     * 
     * @param {Scene} camera_info 
     */
    searchEdges(camera_info) {
        const DIR1 = [[0, 1], [1, 0]];
        let n = this.grid.length;

        let visited = new Uint8Array(n * n * 4);
        let depth = new Uint32Array(n * n * 4);
        let NEXT2 = [
            [[0, 0, 1], [0, 1, 1], [1, 0, 0],
            [-1, 0, 1], [-1, 1, 1], [-1, 0, 0]],
            [[0, 0, 0], [1, 0, 0], [0, 1, 1],
            [0, -1, 0], [1, -1, 0], [0, -1, 1]],
        ]

        function splitIndex(v) {
            let side = v % 4;
            v = Math.trunc(v / 4);
            let j = v % n;
            v = Math.trunc(v / n);
            let i = v;
            return [i, j, side];
        }
        function joinIndex(i, j, side) {
            return (((i * n) + j) * 4) + side;
        }
        function needEdge(hit1, hit2) {
            let o1 = hit1[2] ? hit1[2].obj : null;
            let o2 = hit2[2] ? hit2[2].obj : null;
            if (o1 == null) {
                [o1, o2] = [o2, o1];
                [hit1, hit2] = [hit2, hit1];
            }
            if (o1 == null) {
                return false;
            }
            if (o2 == null) {
                return (o1.detect_edges & (SDFF.DETECT_EDGE_EMPTY));
            }
            if (o1.detect_edges == 0 && o2.detect_edges == 0){ 
                return false;
            }
            let frontO1 = !(o1.detect_edges & SDFF.DETECT_EDGE_FRONT) || hit1[1] < hit2[1];
            let frontO2 = !(o2.detect_edges & SDFF.DETECT_EDGE_FRONT) || hit2[1] < hit1[1];
            let mask = 0;
            if (frontO1) {
                mask |= o1.detect_edges;
            }
            if (frontO2) {
                mask |= o2.detect_edges;
            }
            if (o1 != o2 && (mask & SDFF.DETECT_EDGE_SURFACE)) {
                return true;
            }
            if (o1.group == o2.group && (mask & SDFF.DETECT_EDGE_INTERNALG)) {
                return true;
            }
            if (o1.group != o2.group && (mask & SDFF.DETECT_EDGE_EXTERNALG)) {
                return true;
            }
            return false;
        }
        let context = this;
        function hasEdge(i, j, ni, nj) {
            return needEdge(context.grid[i][j], context.grid[ni][nj]);
        }

        let forward = camera_info.camera_pos_inverse.muldir(new V3(0, 0, -1));
        let p0 = camera_info.cameraToWorld(new V3());
        //let edges = [];
        let followPath = function (i, j, side, o1, o2) {
            let s = [];
            let i0 = joinIndex(i, j, side);
            if (visited[i0]) {
                return;
            }
            let startPos = context.grid[i][j][0];// todo 
            s.push([i0, 0, null])
            while (s.length > 0) {
                let [index, it, edgePos] = s[s.length - 1];
                let [ci, cj, cs] = splitIndex(index);
                if (it == 0) {
                    let hit1 = context.grid[ci][cj];
                    let i2 = ci + DIR1[cs][1];
                    let j2 = cj + DIR1[cs][0];
                    let hit2 = context.grid[i2][j2];

                    let p1World = camera_info.screenToWorld(context.gridPos(ci, cj, camera_info).changez(1));
                    let p2World = camera_info.screenToWorld(context.gridPos(i2, j2, camera_info).changez(1));

                    let left = p1World, right = p2World;
                    let hitleft = hit1;
                    let hitRight = hit2;
                    /*{ //DEBUG
                        let tmp = new Ob();
                        tmp.addLine(p1World, p2World);
                        camera_info.drawincremental(tmp);
                    }*/
                    for (let t = 0; t < context.EDGE_SEARCH_ITER; t++) {
                        let m = V3.lerp(left, right, 0.5);
                        let rayStart = m;
                        let f = forward;
                        if (!camera_info.ortho) {
                            f = rayStart.sub(p0).normalized();
                            rayStart = p0;
                        }
                        let rayResult = context.runRay(rayStart, f, context.MAX_DISTANCE, null);
                        if (needEdge(hit1, rayResult)) {
                            right = m;
                            hitRight = rayResult;
                        } else {
                            left = m;
                            hitleft = rayResult;
                        }
                    }

                    if (hitleft[1] < hitRight[1]) {
                        edgePos = hitleft[0];
                    } else {
                        edgePos = hitRight[0];
                    }
                    s[s.length - 1][2] = edgePos;
                    if (s.length > 1) {
                        let prevPos = s[s.length - 2][2];

                        let tmp = new Ob();
                        tmp.addLine(prevPos, edgePos);
                        camera_info.drawincremental(tmp);
                    }
                }

                if (it >= 6) {
                    s.pop();
                } else {

                    s[s.length - 1][1] = it + 1;

                    let diff = NEXT2[cs][it];
                    let ni = ci + diff[1];
                    let nj = cj + diff[0];
                    let ns = diff[2];
                    if (ni < 0 || nj < 0 || ni >= n || nj >= n) {
                        continue;
                    }
                    let nextIndex = joinIndex(ni, nj, ns);
                    let n2i = ni + DIR1[ns][1];
                    let n2j = nj + DIR1[ns][0];
                    if (n2i >= n || n2j >= n) {
                        continue;
                    }
                    //let ns = diff[2];
                    if (visited[nextIndex] ||
                        !hasEdge(ni, nj, n2i, n2j)
                    ) {
                        continue;
                    }
                    visited[nextIndex] = 1;
                    depth[nextIndex] = depth[index] + 1;

                    /*let pos1 = context.grid[ni][nj][0];
                    let pos2 = context.grid[n2i][n2j][0];


                    let posNew = V3.lerp(pos1, pos2, 0.5);
                    let tmp = new Ob();
                    tmp.addLine(prevp, posNew);
                    camera_info.drawincremental(tmp);*/
                    s.push([nextIndex, 0, null]);
                }
            }
        }

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                let hit1 = this.grid[i][j];
                for (let side = 0; side < DIR1.length; side++) {
                    let tx = j + DIR1[side][0];
                    let ty = i + DIR1[side][1];
                    if (tx < 0 || ty < 0 || tx >= n || ty >= n) {
                        continue;
                    }
                    let hit2 = this.grid[ty][tx];
                    if (needEdge(hit1, hit2)) {
                        followPath(i, j, side);
                    }
                }
            }

        }
    }

    /**
     * 
     * @param {Scene} camera_info 
     * @returns {[any, [V3]]}
     */
    draw(camera_info) {
        let result = new Ob();
        for (let i of this.primitive) {
            let node = this.o2[i];
            let lines = node.func.get_lines(camera_info, node);
            if (lines) {
                lines.transform(node.transform);
                let clipped = this.clip_lines(camera_info, lines, node, node.line_style, node.invisible_style);
                result.addObMove(clipped);
            }

            let textures = node.textures;
            if (textures) {
                let textureLines = new Ob();
                for (let texture of textures) {
                    let text = node.func.get_texture(texture, node, camera_info);
                    if (text) {
                        textureLines.addObMove(text);
                    }
                }
                textureLines.transform(node.transform);
                let clipped = this.clip_lines(camera_info, textureLines, node, 1, null);
                result.addObMove(clipped);
            }
        }
        return result;
    }

    *drawIncremental(camera_info) {
        let t0 = Date.now();
        let t1 = t0;
        let tim = function () {
            let t2 = Date.now();
            //console.log(`time ${t2 - t1} ${t2 - t0}`);
            t1 = t2;
        }
        console.log(`t: ${Date.now() - t0}`);
        for (let i of this.primitive) {
            let node = this.o2[i];
            let lines = node.func.get_lines(camera_info, node);
            if (lines) {
                lines.transform(node.transform);
                let clipped = this.clip_lines(camera_info, lines, node, node.line_style, node.invisible_style);
                tim();
                yield clipped;
            }
        }
        for (let i of this.primitive) {
            let node = this.o2[i];
            let textures = node.textures;
            if (textures) {
                for (let texture of textures) {
                    let text = node.func.get_texture(texture, node, camera_info);
                    text.transform(node.transform);
                    let clipped = this.clip_lines(camera_info, text, node, 1, null);
                    //console.log(`sometext ${i}/${this.o2.length}`);
                    tim();
                    yield clipped;
                }
            }
        }
        if (this.enableGrid == 1) {
            for (let x of this.calcGrid(camera_info)) {
                yield x;
            }
            //this.calcGrid(camera_info);
            this.searchEdges(camera_info);
        }
    }

    /**
     * 
     * @param {Scene} scene 
     */
    draw_to_scene(scene) {
        let r = this.draw(scene);
        scene.addOb(r);
    }
}

function initlib() {
    this.V3 = V3;
    this.V = (x, y, z) => new V3(x, y, z);
    this.M4 = M4;
    this.Ob = Ob;
    this.Scene = Scene;
}
initlib();
if (typeof Canvas != 'undefined') {
    //console.log("init browser");
    Canvas.setpenopacity(1);
    turtle = new Turtle();
    init2();
} else {
    //console.log("init standalone");
    import('./testTurtle.js').then((mod) => {
        turtle = new mod.TestTurtle();
        init2();
        let i = 0;
        while (walk(i)) {
            ++i;
        }
        turtle.finishSVG();
    });

}
//init2();
