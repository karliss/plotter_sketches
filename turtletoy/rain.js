//https://turtletoy.net/turtle/e765a9b502
Canvas.setpenopacity(1);

// Global code will be evaluated once.
const turtle = new Turtle();


let a1 = 0; // min = -720, max=720, step=1
let a2 = 46; // min = -90, max=90, step=1
let cd = 71.9; // min = 0, max=360, step=0.1
let perspective = 1; // min=0, max=1, step=1,  (off, on)
let viewSize = 200; // min=10, max=400, step=1
let fov = 90; // min=10, max=160, step=0.1

let radius = 109; // min = 10, max=200, step=1
let amount = 9800; // min=0, max=50000, step=1
let rainLen = 2.2; // min=0, max=100, step=0.1
let circleSize = 3.8; // min=0, max=30, step=0.1

let boxSize = 27.6; // min=1, max=50, step=0.1

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

// The walk function will be called until it returns false.
function walk(i) {
    initlib();
    let scene = new Scene();
    if (perspective > 0) {
        scene.fov = [fov, fov];
        scene.w = scene.h = viewSize;
        scene.setPerspective(new V3(0, 0, 0), new V3(0, 0, 0));    
    } else {
        scene.setOrthographic(1, new V3(0,0,0), new V3(0, 0, 0));  
    }
    scene.camera_pos = Scene.worldCameraOrbit(new V3(0, 0, 0), cd, a1, a2);
    //
    
    let cube = new Ob([
            //[0, 0, 0, 20, 0, 0],
            [0, 0, 0, 10, 0, 0],
            [11, 0, 0, 20, 0, 0],
            //[0, 0, 0, 0, 20, 0],
            [0, 0, 0, 0, 10, 0],
            [0, 11, 0, 0, 20, 0],
            [0, 0, 0, 0, 0, 20],
    ]);

    //scene.addOb(cube);
    /*scene.addLine(new V3(50, 5, 0), new V3(50, 0, 0));
    scene.addLine(new V3(0, 0, 0), new V3(0, 50, 0));
    scene.addLine(new V3(0, 0, 0), new V3(0, 0, 25));*/
    let sdFunc = SDF.move(SDF.sphere(V(0, 0, 0), boxSize), V(0, 0, boxSize) );// SDF.box(V(20, 10, 10));
    
    for (let i =0; i<amount; i++) {
        let p = new V3(Util.rndRange(-radius, radius), Util.rndRange(-radius, radius), Util.rndRange(-0.1*radius, radius));
        if (p.magnitude() > radius) {
            continue;
        }
        let posXY = p.changez(0);
        let p2 = p.add(new V3(0, 0, Util.rndRange(rainLen, rainLen * 1.05)));
        const [hit, travel] = SDF.runRay(sdFunc, posXY.changez(radius), V(0, 0, -1), radius);
        let h = hit.z;
        
        
        
        if (p.z < h && h > 0.01) { 
            if (p.z < h && h-p.z < circleSize ) {
                let r=  h-p.z;
                if (h > 0.01) {
                    r = 0.5;
                }
                scene.addOb(circle(p.changez(h), r));
                p.z = Math.max(h, p.z);
                p2.z = Math.max(h, p2.z);
                scene.addLine(p2, p);  
            } else {
               let d = Math.random() * Math.PI * 2;
               let dv = V(Math.cos(d), Math.sin(d));
               let l=0, r = radius;
               for (let i=0; i<20; i++) {
                   let m = (l+r)/2;
                   let pSide = posXY.changez(radius).add(dv.mul(m));
                   let [hit2, travel2] = SDF.runRay(sdFunc, pSide, V(0, 0, -1), radius);
                   if (hit2.z <= 0.01) {
                       r = m;
                   } else {
                       l = m;
                   }
               }
               let pnew = posXY.add(dv.mul(l));
               p = pnew.changez(Math.max(0, p.z));
               p2 = pnew.changez(Math.max(0, p2.z));
               scene.addLine(p2, p);
            }
        } else {
           if (p.z < h && h-p.z < circleSize ) {
                let r=  h-p.z;
                if (h > 0.01) {
                    r = 2;
                }
                scene.addOb(circle(p.changez(h), r));
            } 
            p.z = Math.max(h, p.z);
            p2.z = Math.max(h, p2.z);
            scene.addLine(p2, p);    
        }
        
        
        
        
        
    }
    /*let o1 = new Ob();
    scene.addLine(new V3(0, 0, 0), new V3(50, 0, 0));
    scene.addLine(new V3(50, 5, 0), new V3(50, 0, 0));
    scene.addLine(new V3(0, 0, 0), new V3(0, 50, 0));
    scene.addLine(new V3(0, 0, 0), new V3(0, 0, 25));
    
    
    //o1.transform(M4.translate(new V3(-10, -10, -10)));
    scene.addOb(o1);*/
    scene.draw();
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
    constructor() {
        this.d = [[1,0,0,0],
                  [0,1,0,0],
                  [0,0,1,0],
                  [0,0,0,1]];
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
}
class Util {
    static rndRange(min, max) {
        return Math.random() * (max-min)+min;
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
}
class Scene {
    constructor() {
        this.camera_pos = Scene.worldCameraM(new V3(0, 0, 0), new V3(1, 0, 0));
        this.camera = Scene.orthographic1();
        this.lines=[];
        this.ortho = true;
        this.w=100;
        this.h=100;
        this.fov = [90, 90];
    }
    addLine(a,b) {
        this.lines.push([a, b]);
    }
    addOb(x) {
        this.lines.push(...x.lines);
    }
    mapPoint(x) {
        let p = this.camera.mulv(x);
        if (p.z != 0) {
            p = p.mul(1/Math.abs(p.z));
        } else {
            p.x = 0; p.y = 0;
        }
        return [p.x, p.y];
    }
    draw() {
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
           turtle.jump(p1)
           turtle.pendown();
           turtle.goto(p2);
        });
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
    
   static orthographic1(scale=1) {
        let res = new M4();
        res.d = [
            [scale,0,0,0],
            [0,-scale,0,0],
            [0, 0, 0,1],
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
    addLine(a,b) {
        this.lines.push([a, b]);
    }
    addLines(ar) {
        for (const x of ar) {
            this.addLine(new V3(x[0], x[1], x[2]), new V3(x[3], x[4], x[5]));
        }
    }
    transform(m) {
        this.lines.forEach((v, i) => {
            this.lines[i] = [m.mulv(v[0]), m.mulv(v[1])];
        });
    }
}
class SDF {
    static bind1(f, ...args) {
        return function(...x) {
            f.bind(null, ...x);
        }
    }
    // combinations
    static unionD(a, b, x) { return Math.min(a(x), b(x)); }
    static union(a, b) { return SDF.unionD.bind(null, a, b); }
    static diffD(a, b, x) { return Math.max(-a(x), b(x)); }
    static diff(a, b) { return SDF.diffD.bind(a, b); }
    static intersectionD(a, b, x) { return Math.max(a(x), b(x)); }
    static intersection(a, b) { return SDF.intersectionD.bind(a, b); }
    static xorD(a, b, x) { 
        let d1=a(x), d2=b(x);
        return Math.max(min(d1, d2), -max(d1, d2)); 
    }
    static xor(a, b) { return SDF.xorD.bind(a, b); }
    static moveD(f, p, x) {
        return f(x.sub(p));
    }
    static move(f, p) {
        return SDF.moveD.bind(null, f, p);
    }
    static rotateD(f, euler, x) {
        return f(M4.euler(euler).mulV(x));
    }
    static rotate(f, euler) { return SDF.rotateD.bind(f, euler); }
    
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
        return q.maxK(0).magnitude() + Math.min(q.xyzMax());
    }
    static box = SDF.bind1(SDF.boxD);
    // 
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
}
function initlib() {
    this.V3 = V3;
    this.V = (x,y,z)=>new V3(x, y, z);
    this.M4 = M4;
    this.Ob = Ob;
    this.Scene = Scene;
    this.SDF = SDF;
}

