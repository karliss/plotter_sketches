
use image::{GenericImageView, ImageBuffer, ImageReader, Luma, Pixel, Rgb};
use kurbo::Vec2;
use nalgebra::{vector, Vector2, Vector3};
use serde;
use std::result::Result;
use vsvg::UNITS;
use whiskers::prelude::*;


#[sketch_app]
struct CircleSketch {
    #[param(slider, min = 0.01, max = 5.0)]
    line_size: f64,
    grid_mul: f64,
    path: String,
    have_image:bool,
    scale_mul: f64,
    w: u32,
    h: u32,

    circles: usize,
    black_max: i32,
    rings: i32,
    #[param(slider, min = 0.1, max = 20.0)]
    spacing: f64,
    
    subdiv: i32,

    priority: bool,
    invert: bool,
    


    #[skip]
    #[serde(skip)]
    dstate: DynamicState,
}

#[derive(Default)]
struct DynamicState {
    path_loaded: String,
    image: ImageBuffer<image::Rgb<u8>, Vec<u8>>,
}

impl Default for CircleSketch {
    fn default() -> Self {
        Self {
            line_size: 1.0,
            grid_mul: 1.0,
            path: String::default(),
            have_image: false,
            scale_mul: 1.0,
            w: 0,
            h: 0,
            circles: 4,
            black_max: 5,
            rings: 20,
            spacing: 5.0,
            subdiv: 128,
            priority: false,
            invert: false,
            dstate: DynamicState::default(),
        }
    }
}

impl CircleSketch {
    fn load_image(&mut self) -> Result<(), ()> {
        let mut img = ImageReader::open(&self.path)
            .map_err(|e| ())?
            .decode()
            .map_err(|e| ())?
            .to_rgb8();

        let w2 = (img.width()as f64 * self.scale_mul) as u32;
        let h2 = (img.height()as f64 * self.scale_mul) as u32;
        self.w = w2;
        self.h = h2;

        let img = image::imageops::resize(
            &img,
            w2,
            h2,
            image::imageops::FilterType::CatmullRom,
        );

        self.dstate.image = img;
        self.dstate.path_loaded = self.path.clone();
        return Ok(());
    }

    fn draw(self: &mut CircleSketch, sketch: &mut Sketch, ctx: &mut Context)
    {
        let image = &self.dstate.image;
        let scale1 = f64::min(vsvg::Unit::Mm.convert_from(&vsvg::Unit::Px, sketch.width()) / image.width() as f64,
                         vsvg::Unit::Mm.convert_from(&vsvg::Unit::Px, sketch.height()) / image.height() as f64);
        let circle_space = self.line_size * self.spacing;
    
    
        let mut flags: ImageBuffer<Luma<u8>, Vec<u8>> = ImageBuffer::from_fn(image.width(), image.height(), |x, y| {
            image::Luma([0u8])
        });

        let mut circles = Vec::new();
        let w = (image.width() as f64) * scale1;
        let h = (image.height() as f64) * scale1;
        for circle in 0..self.circles {
            let c = ctx.rng_point(0.0..w, 0.0..h);
            let r = self.rings as f64 * circle_space;

            circles.push((c, r));
        }
        for circle in 0..self.circles as usize {
            let (c, r) = circles[circle];
            for ring in 0..self.rings {
                //sketch.circle(c.x(), c.y(), (ring+1) as f64 * circle_space);
                let r = (ring+1) as f64 * circle_space;
                let mut prev = c + Point::new(r, 0);
                for i in 1..=self.subdiv {
                    let angle = f64::to_radians((360.0  * i as f64) / (self.subdiv as f64));
                    let p2: Point = c + Point::new(angle.cos(), angle.sin()) * r;

                    let mut posp = (image.width() as f64 * (p2.x()/w), image.height()as f64 * (p2.y()/h));
                    posp.0 = if posp.0 >= 0.0 {posp.0} else {(image.width() + 3) as f64};
                    posp.1 = if posp.1 >= 0.0 {posp.1} else {(image.height() + 3) as f64};
                    
                    let pixel = image.get_pixel_checked(posp.0 as u32, posp.1 as u32).unwrap_or(&image::Rgb([255u8, 255u8, 255u8]));
                    //let v = pixel_magnitude2(*pixel);
                    let v = pixel.to_luma().0[0];

                    let numf = if self.invert { 
                        v as f32 / 255.0
                    } else {
                        1.0-(v as f32 / 255.0)
                    };
                    let need = (numf * self.black_max as f32) as i32;

                    let num_have = if self.priority {
                        circles[0..circle].iter().map(|x: &(Point, f64)| {
                            if p2.distance(&x.0) < x.1 {
                                1
                            } else {
                                0
                            }
                        }).sum()
                    } else {
                        circles.iter().enumerate().map(|(i, x)| {
                            if i == circle {
                                return 0;
                            }
                            if p2.distance(&x.0) < x.1 && p2.distance(&x.0) < p2.distance(&c){
                                1
                            } else {
                                0
                            }
                        }).sum()
                    };

                    if need > num_have  {
                        sketch.line(prev.x(), prev.y(), p2.x(), p2.y());
                    }
                    
                    prev = p2;
                    
                }
            }
        }
    
        /*grid.build(sketch, |sketch, cell| {
            let p1 = cell.position;
            let p2 = p1 + Point::new(cell.size[0]*0.1, 0);
            
            let c1 = image.get_pixel(cell.column as u32, cell.row as u32);
            let mg = pixel_magnitude2(*c1).isqrt();
            
            let W = mina.len();
            let a: i32 = mina[cell.row % W][cell.column % W];
            let d: i32 = dir[cell.row % W][cell.column % W];
    
    
    
            if 443-mg > ((443) * (a+1)) / 17 {
                *flags.get_pixel_mut(cell.column as u32, cell.row as u32) = Luma([d as u8; 1]);
                //sketch.line(p1.x(), p1.y(), p2.x(), p2.y());
            }
        });*/
       
    }
}

fn pixel_magnitude2(p: Rgb<u8>) -> i32 {
    let c = p.channels();
    return c[0] as i32 * c[0] as i32 + c[1] as i32 * c[1] as i32 + c[2] as i32 * c[2] as i32;
}

type IPos2 = Vector2<i32>;

fn pixel_to_vec32f(p: Rgb<u8>) -> Vector3<f32> {
    return Vector3::new(p.0[0] as f32, p.0[1] as f32, p.0[2] as f32);
}



pub fn grid_cell(grid: f64, pos: IPos2) -> Vec2 {
    return Vec2::new(pos.x as f64 * grid, pos.y as f64 * grid);
}






impl App for CircleSketch {
    fn update(&mut self, sketch: &mut Sketch, ctx: &mut Context) -> anyhow::Result<()> {
        if self.path != self.dstate.path_loaded {
            match self.load_image() {
                Err(_) => {
                    std::eprintln!("Failed to load image");
                    self.have_image = false;
                }
                Ok(_) => {
                    self.have_image = true;
                }
            }
            self.dstate.path_loaded = self.path.clone();
        }
        if self.dstate.image.is_empty() {
            eprintln!("No image");
            return Ok(());
        }
        sketch.scale(Unit::Mm);
        sketch.stroke_width( vsvg::Unit::Mm.convert_to(&vsvg::Unit::Px, self.line_size)  );

       self.draw(sketch, ctx);
        
        Ok(())
    }
}

fn main() -> whiskers::prelude::Result {
    CircleSketch::runner()
        .with_page_size_options(PageSize::A5H)
        .with_layout_options(LayoutOptions::Center)
        .run()
}
