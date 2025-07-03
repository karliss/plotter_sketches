// You can find the Turtle API reference here: https://turtletoy.net/syntax
//
let a1 = 0; // min = -720, max=720, step=1
let a2 = 46; // min = -90, max=90, step=1
let cd = 51.9; // min = 0, max=360, step=0.1
let perspective = 1; // min=0, max=1, step=1,  (off, on)
let viewSize = 200; // min=10, max=400, step=1
let fov = 90; // min=10, max=160, step=0.1
let subdiv = 32; // min=1, max=1024, step=1
let subdivExtra = 1; // min=0, max=1, step=1

let scene = null;
let turtle = null;


function init2() {
    // Global code will be evaluated once.
    //const turtle = new Turtle();

    scene = new Scene();
    if (perspective > 0) {
        scene.fov = [fov, fov];
        scene.w = scene.h = viewSize;
        scene.setPerspective(new V3(0, 0, 0), new V3(0, 0, 0));    
    } else {
        scene.setOrthographic(1, new V3(0,0,0), new V3(0, 0, 0));  
    }
    scene.camera_pos = Scene.worldCameraOrbit(new V3(0, 0, 0), cd, a1, a2);
    let cube = new Ob([
            [0, 0, 0, 20, 0, 0],
            [0, 0, 0, 0, 20, 0],
            [0, 0, 0, 0, 0, 20],
            [20, 20, 20, 0, 20, 20],
            [20, 20, 20, 20, 0, 20],
            [20, 20, 20, 20, 20, 0],
    ]);

    let sdf2 = new SDF2();
    let p = new SDF2.Box(V(5, 5, 5));
    /*let x = 
        new SDF2.Diff(
            new SDF2.Diff(new SDF2.Box(V(5, 15, 10)),
                (new SDF2.Box(V(6, 6,5),
                    {textures: [
                            {id: "slice_local", step:1, dir:V(0, 0, 1)}
                    ]})).tr(M4.translate(-5, 0, 10)), {textures: [
                    {id: "slice_local", step:1},
                    //{id: "slice_local", step:1, dir:V(1, 0, 0)},
                    //{id: "slice_local", step:1, dir:V(0, 1, 0)},
                ]})
                , new SDF2.Sphere(4, {textures:[
                    {id: "slice_local", step:1, dir:V(0, 1, 0)}
                ]}).tr(M4.translate(-5, 15, 10))
                 ,{line_style: 1, invisible_style: null}
            );*/

        let x = new SDF2.Box(V(5, 15, 10))
            .sub(new SDF2.Box(V(6, 6,5),
                    {textures: [
                            {id: "slice_local", step:1, dir:V(0, 0, 1)}
                    ]}).tr(M4.translate(-5, 0, 10)))
            .format({textures: [
                            {id: "slice_local", step:1, dir:V(0, 0, 1)}
                    ]})
            .sub(new SDF2.Sphere(4, {textures:[
                    {id: "slice_local", step:1, dir:V(0, 1, 0)}
                ]}).tr(M4.translate(-5, 15, 10)))
            .sub(new SDF2.Cylinder(2, 8)
                    .tr(M4.euler(0, Math.PI/2, 0))
                    .format({textures: [{id: "slice_local", step:1, dir:V(0, 0, 1)}]}))
                ;

    sdf2.addObj(x);
    sdf2.addObj((new SDF2.Box(V(2, 2, 20))).tr(M4.translate(0, 0, 0)));
    sdf2.addObj(new SDF2.Cylinder(4, 8)
        .tr(M4.translate(-4, -10, 10))
        .format({
            line_style: 1,
            textures: [{id: "slice_local", step:1, dir:V(0, 0, 1)}]
        }));
    sdf2.process(scene);
    sdf2.draw_to_scene(scene);
    
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
    muldir(v) {
        let vv = [v.x, v.y, v.z, 1];
        let res = [0, 0, 0, 0];
        for (let i=0; i<4; i++) {
            for (let k=0; k<3; k++) {
                res[i] += this.d[i][k] * vv[k];
            }
        }
        return new V3(res[0], res[1], res[2]);
    }
    static translate(v, y=undefined, z=undefined) {
        if (y !== undefined) {
            let r = new M4();
            r.d[0][3] = v;
            r.d[1][3] = y;
            r.d[2][3] = z;
            return r;
        }
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
            if (res[i][i] != 0) {
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
        for (var line of x.lines) {
            for (let i=1; i<line.length; i++) {
                this.lines.push([line[i-1], line[i]]);
            }
        }
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
        res.lines = [points.slice()];
        return res;
    }
    static fromLoop(points) {
        let res = Ob.fromChain(points);
        if (points.length > 1) {
            res.lines[0].push(res.lines[0][0]);
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
    static circle(r, p0=null, subdiv=32){
        if (p0 == null) {
            p0 = new V3(0, 0, 0);
        }
        let points = []
        for (let i=0; i<subdiv; i++) {
            let a = (Math.PI * 2 * i) / subdiv;
            let pos = p0.add(new V3(Math.sin(a)*r, Math.cos(a)*r, 0));
            points.push(pos);
        }
        return Ob.fromLoop(points);
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
        if (this.lines.length > 0) {
            let line = this.lines[0];
            if (line.length > 0 && line[line.length - 1] == a) {
                line.push(b);
                return;
            }
        } 
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
            this.lines.push(line.slice())
        }
    }
    transform(m) {
        this.lines.forEach((v) => {
            v.forEach((point, i) => {
                v[i] = m.mulv(point);
            });
        });
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
    constructor(args) {
        if (!args) {
            args = {}
        }
        this.transform = new M4();
        if ("textures" in args) {
            this.textures = args.textures;
        }
        if ("line_style" in args) {
            this.line_style = args.line_style;
        }
        if ("invisible_style" in args) {
            this.invisible_style = args.invisible_style;
        }
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
        return this;
    }
    get_lines(camera_info, t) {
        return []
    }
    get_texture(texture, node, camera_info) {
        return [];
    }
    add(x) {
        return new SDF2.Union(this, x);
    }
    sub(x) {
        return new SDF2.Diff(this, x);
    }
    
}

class SDFNode {
    constructor() {
        this.a=null;
        this.b=null;
        /** @type{M4} */
        this.transform = null;
        this.g = null;
        this.line_style = 1;
        this.invisible_style = null;
    }
}

class SDF2 {
    
    static Sphere = class extends SDFF {
        constructor(r, args=null) {
            super(args);
            this.r = r;
        }
        do(p, id=null) {
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
        get_texture(texture, node, camera_info) {
            let result = [];
            switch (texture.id) {
                case "slice_local":
                    {
                        let dir = V(0, 0, 1);
                        if (texture.dir) {
                            dir = texture.dir;
                        }
                        
                        let step = texture.step;
                        for (let z=-this.r+step; z<this.r; z+= step) {
                            let r2 = Math.sqrt(this.r*this.r - z*z);
                            let ring = Ob.circle(r2, new V3(0, 0, z), subdiv);
                            ring = ring.lines[0];
                            for (let i=0; i<ring.length; i++) {
                                ring[i] = ring[i].swizzleSimple(dir);
                            }
                            result.push(ring);
                        }
                        return result;
                    }
                    break;
            }
            return super.get_texture(texture, node, camera_info);
        }
    }
    static Cylinder = class extends SDFF {
        constructor(r, h, args=null) {
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
        do(p, id=null) {
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
        get_lines(camera_info, t) {
            let result = new Ob();
            
            result.addOb(Ob.circle(this.r, new V3(0, 0, this.h)));
            result.addOb(Ob.circle(this.r, new V3(0, 0, -this.h)));
            return result.lines;
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
                            for (let z=-this.h; z<this.h; z+= step) {
                                result.addOb(Ob.circle(this.r, new V3(0, 0, z)));
                            }
                        }
                        
                        return result.lines;
                    }
                    break;
            }
            return super.get_texture(texture, node, camera_info);
        }
    }
    static Box = class extends SDFF {
        constructor(size, args=null) {
            super(args);
            /** @type{V3} */
            this.size = size;
        }
        /**
         * 
         * @param {V3} p 
         * @returns {SDFR}
         */
        do(p, id=null) {
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
            if (m&1) {
                r.x = -r.x;
            }
            if (m&2) {
                r.y = -r.y;
            }
            if (m&4) {
                r.z = -r.z;
            }
            return r;
        }
        get_lines(camera_info, t) {
            let result = [];
            for (let mask=0; mask<7; mask++) {
                for (let j=0; j<3; j++) {
                    let m2 = mask | (1 << j);
                    if (m2 == mask) {
                        continue;
                    }
                    result.push([this.corner(mask), this.corner(m2)]);
                }
            }
            return result;
        }
        get_texture(texture, node, camera_info) {
            let result = [];
            switch (texture.id) {
                case "slice_local":
                    {
                        let dir = V(0, 0, 1);
                        if (texture.dir) {
                            dir = texture.dir;
                        }
                        
                        let step = texture.step;
                        if (dir.z > 0) {
                            for (let z=-this.size.z; z<this.size.z; z+= step) {
                                result.push([
                                    new V3(this.size.x, this.size.y, z),
                                    new V3(this.size.x, -this.size.y, z),
                                    new V3(-this.size.x, -this.size.y, z),
                                    new V3(-this.size.x, this.size.y, z),
                                    new V3(this.size.x, this.size.y, z),
                                ]);
                            }
                        } else if (dir.y > 0) {
                            for (let z=-this.size.y; z<this.size.y; z+= step) {
                                result.push([
                                    new V3(this.size.x, z, this.size.z),
                                    new V3(this.size.x, z, -this.size.z),
                                    new V3(-this.size.x, z, -this.size.z),
                                    new V3(-this.size.x, z, this.size.z),
                                    new V3(this.size.x, z, this.size.z),
                                ]);
                            }
                        } else {
                            for (let z=-this.size.x; z<this.size.x; z+= step) {
                                result.push([
                                    new V3(z, this.size.y, this.size.z),
                                    new V3(z, this.size.y, -this.size.z),
                                    new V3(z, -this.size.y, -this.size.z),
                                    new V3(z, -this.size.y, this.size.z),
                                    new V3(z, this.size.y, this.size.z),
                                ]);
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
        constructor(a, b, args=null) {
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
        constructor(a, b, args=null) {
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
        constructor(a, b, args=null) {
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
        constructor(a, b, args=null) {
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

        this.RAY_MARCH_LIMIT = 0.000001;
    }

    addObj(x){ 
        this.objs.push(x);
    }
    /**
     * 
     * @param {V3} p 
     * @returns {SDFR}
     */
    calcSDF(p){
        for (let i of this.primitive) {
            let node = this.o2[i];
            let p2 = node.inverse_transform.mulv(p);
            this.tmpd[i] = node.func.do(p2, i);
        }
        for (let i=this.combine.length -1; i>=0; --i) {
            let node = this.o2[this.combine[i]];
            let r1 = this.tmpd[node.a];
            let r2 = this.tmpd[node.b];
            this.tmpd[i] = node.func.do(p, r1, r2);
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

    runRay(p0, dir, limit) {
        let travel = 0;
        let p = p0;
        let result = null;
        while (travel < limit) {
            /** @type {SDFR} */
            let hit = this.calcSDF(p);
            let distance = hit.d;
            if (distance < this.RAY_MARCH_LIMIT) {
                result = hit;
                break;
            }
            distance = Math.min(limit-travel, distance);
            p = p.add(dir.mul(distance));
            travel += distance;
        }
        return [p, travel, result];
    }
    clipReach(p0, point, ortho, forward, mustBeOnSurface, node=null) {
        if (mustBeOnSurface) {
            let d = 0;
            if (!node ) {
                d = Math.abs(this.calcSDF(point).d);
            } else {
                let hit = this.calcSDF(point);
                if (this.o2[hit.obj] != node) {
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
            dir = dir.mul(1/dis);
        }
        let [pRay, pTravel, hit] = this.runRay(p0, dir, dis);
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
        let p2Local = node.inverse_transform.mulv(p);
        /** @type {SDFR} */
        let sdfi = node.func.do(p2Local);
        let norm = sdfi.norm;
        let l2 = norm.len2();
        if (l2 <= 0.00001) {
            return p;
        }
        norm = norm.mul(sdfi.d/Math.sqrt(l2));
        return p.sub(node.transform.muldir(norm));
    }

    /**
     * 
     * @param {Scene} camera_info 
     * @param {[[V3]]} lines 
     * @param {SDFNode} node 
     */
    clip_lines(camera_info, lines, node, style, invisible_style=null) {
        let result = [];
        let p0 = camera_info.screenToWorld(V(0, 0, 0));
        let ortho = camera_info.ortho;
        let forward = camera_info.screenToWorld(V(0, 0, -1)).sub(p0);

        let show_invisible = false;

        if (invisible_style) {
            show_invisible = true;
        }

        for (let line of lines) {
            let prev = line[0];
            
            let chain = null;
            let chain_invisible = null;

            let last_normal = null;
            let last_invisible = null;
            //TODO: camera clipping
            let addSegment = function(a, b, invisible, show_invisible=false) {
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
                    if (invisible) {
                        active_chain = [invisible_style, [a]];
                        chain_invisible = active_chain;
                    } else {
                        active_chain = [style, [a]];
                        chain = active_chain;
                    }
                    result.push(active_chain);
                }
                active_chain[1].push(b);
                if (invisible) {
                    last_invisible = active_chain[1];
                    chain = null;
                    last_normal = null;
                } else {
                    last_normal = active_chain[1];
                    chain_invisible = null;
                    last_invisible = null;
                }
            }

            for (let j=1; j<line.length; j++) {
                let pa = line[j-1];
                let pb = line[j];
                last_normal = last_invisible = null;

                let prev = pa;
                for (let i=1; i<=subdiv; i++) {
                    let p2 = V3.lerp(pa, pb, i/subdiv);
                    if (node.func.curved) {
                        last_normal = last_invisible = null;
                        p2 = this.snap_to_surface(p2, node);
                    }
                    // todo snap to surface
                    let r1 = this.clipReach(p0, prev, ortho, forward, true, node);
                    let r2 = this.clipReach(p0, p2, ortho, forward, true, node);
                    if (r1  > 0 && r2 > 0) {
                        addSegment(prev, p2, false);
                    } else if (subdivExtra && (r1>0) != (r2 > 0)) {
                        let [l, r] = [prev, p2];
                        for (let iter=0; iter<10; iter++) {
                            let m = l.add(r).mul(0.5);
                            m = this.snap_to_surface(m, node);
                            let good = this.clipReach(p0, m, ortho, forward, true, node) > 0;
                            if ((r1 > 0) == good) {
                                l = m;
                            } else {
                                r = m;
                            }
                        }
                        if (r1 > 0) {
                            addSegment(prev, l, false);
                            if (r2 == 0) {
                                addSegment(l, p2, true, show_invisible);
                            } else {
                                chain = chain_invisible = last_normal = last_invisible = null;
                            }
                                
                        } else {
                            if (r1 == 0) {
                               addSegment(prev, l, true, show_invisible);
                            } else {
                                chain = chain_invisible = last_normal = last_invisible = null;
                            }
                            addSegment(l, p2, false);
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

        function recursiveProc(x, transform, textures, line_style, invisible_style) {
            let index = o2.length;
            let t2 = transform.mul(x.transform);
            if (x.primitive) {
                primitive.push(index);
            } else {
                combine.push(index);
            }
            if (x.textures !== undefined) {
                textures = x.textures;
            }
            if (x.line_style !== undefined) {
                line_style = x.line_style;
            }
            if (x.invisible_style !== undefined) {
                invisible_style = x.invisible_style;
            }
            let node = new SDFNode();
            node.func = x;
            node.transform = t2;
            node.textures = textures;
            node.line_style = line_style;
            node.invisible_style = invisible_style;
            o2.push(node);
            if (!x.primitive) {
                node.a = recursiveProc(x.a, t2, textures, line_style, invisible_style);
                node.b = recursiveProc(x.b, t2, textures, line_style, invisible_style);
            }
            return index;
        }
        let identity_transform = new M4();
        for (let item of this.objs) {
            root.push(recursiveProc(item, identity_transform, null, 1, null));
        }
        this.o2 = o2;
        this.root = root;
        this.combine = combine;
        this.primitive = primitive;
        for (let o of this.o2) {
            o.inverse_transform = o.transform.inverse();
        }
    }

    /**
     * 
     * @param {Scene} camera_info 
     * @returns {[any, [V3]]}
     */
    draw(camera_info) {
        let result = [];
        for (let i of this.primitive) {
            let node = this.o2[i];
            let lines = node.func.get_lines(camera_info, node.transform);
            for (let line of lines) {
                for (let j=0; j<line.length; j++) {
                    line[j] = node.transform.mulv(line[j]);
                }
            }
            let clipped = this.clip_lines(camera_info, lines, node, node.line_style, node.invisible_style);
            for (let x of clipped) {
                result.push(x);
            }
            let textures = node.textures;
            if (textures) {
                lines = [];
                for (let texture of textures) {
                    lines = lines.concat(node.func.get_texture(texture, node, camera_info));
                }
                for (let line of lines) {
                    for (let j=0; j<line.length; j++) {
                        line[j] = node.transform.mulv(line[j]);
                    }
                }
                /*let clipped = [];
                for (let line of lines) {
                    clipped.push(line, [1, line]);
                }*/
                clipped = this.clip_lines(camera_info, lines, node, 1, null);
                for (let x of clipped) {
                    result.push(x);
                }
            }
        }
        return result;
    }

    /**
     * 
     * @param {Scene} scene 
     */
    draw_to_scene(scene) {
        let r = this.draw(scene);
        for (let l of r) {
            let points = l[1];
            scene.addOb(Ob.fromChain(points));
        }
    }
}

function initlib() {
    this.V3 = V3;
    this.V = (x,y,z)=>new V3(x, y, z);
    this.M4 = M4;
    this.Ob = Ob;
    this.Scene = Scene;
}
initlib();
if (typeof Canvas != 'undefined') {
    console.log("init browser");
    Canvas.setpenopacity(1);
    turtle = new Turtle();
    init2();
} else {
    //console.log("init standalone");
    import('./testTurtle.js').then((mod) => {
        turtle = new mod.TestTurtle();
        init2();
        let i = 0;
        while(walk(i)) {
            ++i;
        }
        turtle.finishSVG();
    });
    
}
//init2();