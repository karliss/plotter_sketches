
use image::{GenericImageView, ImageBuffer, ImageReader, Luma, Pixel, Rgb};
use kurbo::Vec2;
use nalgebra::{vector, Vector2, Vector3};
use serde;
use std::result::Result;
use vsvg::UNITS;
use whiskers::prelude::*;

#[sketch_widget]
#[derive(Default)]
enum DitherMode {
    #[default]
    Ordered8Dot,
    HV1
}

#[sketch_app]
struct DitherSketch {
    #[param(slider, min = 0.01, max = 5.0)]
    line_size: f64,
    #[param(slider, min = 0.1, max = 2.0)]
    grid_mul: f64,
    path: String,
    have_image:bool,
    scale_mul: f64,
    w: u32,
    h: u32,
    mode: DitherMode,


    #[skip]
    #[serde(skip)]
    dstate: DynamicState,
}

#[derive(Default)]
struct DynamicState {
    path_loaded: String,
    image: ImageBuffer<image::Rgb<u8>, Vec<u8>>,
}

impl Default for DitherSketch {
    fn default() -> Self {
        Self {
            line_size: 1.0,
            grid_mul: 1.0,
            path: String::default(),
            have_image: false,
            scale_mul: 1.0,
            w: 0,
            h: 0,
            mode: DitherMode::default(),
            dstate: DynamicState::default(),
        }
    }
}

impl DitherSketch {
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
}

fn pixel_magnitude2(p: Rgb<u8>) -> i32 {
    let c = p.channels();
    return c[0] as i32 * c[0] as i32 + c[1] as i32 * c[1] as i32 + c[2] as i32 * c[2] as i32;
}

type IPos2 = Vector2<i32>;

fn pixel_to_vec32f(p: Rgb<u8>) -> Vector3<f32> {
    return Vector3::new(p.0[0] as f32, p.0[1] as f32, p.0[2] as f32);
}


struct HeapPos {
    cost: f32,
    pos: IPos2,
    prev: IPos2,
}


impl PartialEq for HeapPos {
    fn eq(&self, other: &Self) -> bool {
        self.cost == other.cost
    }
}
impl PartialOrd for  HeapPos {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        return Some(self.cmp(other));
    }
}
impl Ord for HeapPos {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        return other.cost.total_cmp(&self.cost);
    }
}
impl Eq for HeapPos {

}

pub fn grid_cell(grid: f64, pos: IPos2) -> Vec2 {
    return Vec2::new(pos.x as f64 * grid, pos.y as f64 * grid);
}

fn dither_a(state: &mut DitherSketch, sketch: &mut Sketch)
{
    let image = &state.dstate.image;
    let gs = state.line_size * state.grid_mul;

    let grid = Grid::from_cell_size([gs, gs])
        .columns(state.w as usize)
        .rows(state.h as usize);


    let mina = [
        [ 0, 8, 2,10,  0, 8, 2,10],
        [12, 4,14, 6, 12, 4,14, 6],
        [ 3,11, 1, 9,  3,11, 1, 9],
        [15, 7,13, 5, 15, 7,13, 5],

        [ 0, 8, 2,10,  0, 8, 2,10],
        [12, 4,14, 6, 12, 4,14, 6],
        [ 3,11, 1, 9,  3,11, 1, 9],
        [15, 7,13, 5, 15, 7,13, 5],
    ];


    /*grid.build(sketch, |sketch, cell| {
        let p1 = cell.position;
        let p2 = p1 + Point::new(cell.size[0], 0);
        
        let c1 = image.get_pixel(cell.column as u32, cell.row as u32);
        if pixel_magnitude2(*c1).isqrt() > (443/2) {
            sketch.line(p1.x(), p1.y(), p2.x(), p2.y());
        }
    });*/

    grid.build(sketch, |sketch, cell| {
        let p1 = cell.position;
        let p2 = p1 + Point::new(cell.size[0]*0.1, 0);
        
        let c1 = image.get_pixel(cell.column as u32, cell.row as u32);
        let mg = pixel_magnitude2(*c1).isqrt();
        
        let a = mina[cell.row % mina.len()][cell.column % mina[0].len()];


        if mg < ((443) * (a+1)) / 17 {
            sketch.line(p1.x(), p1.y(), p2.x(), p2.y());
        }
    });
}


fn dither_b(state: &mut DitherSketch, sketch: &mut Sketch)
{
    let image = &state.dstate.image;
    let gs = state.line_size * state.grid_mul;

    let grid = Grid::from_cell_size([gs, gs])
        .columns(state.w as usize)
        .rows(state.h as usize);


    let dir = [
        [ 2, 2, 2, 1,  2, 2, 2, 1],
        [ 2, 1, 2, 1,  2, 1, 2, 1],
        [ 2, 2, 2, 1,  2, 2, 2, 1],
        [ 2, 1, 2, 1,  2, 1, 2, 1],

        [ 2, 2, 2, 1,  2, 2, 2, 1],
        [ 2, 1, 2, 1,  2, 1, 2, 1],
        [ 2, 2, 2, 1,  2, 2, 2, 1],
        [ 2, 1, 2, 1,  2, 1, 2, 1],
    ];

    /*let mina = [
        [ 6, 5, 4, 0,  4, 5, 6, 0],
        [13,10,12, 1, 12,11,13, 1],
        [ 7, 8, 9, 2,  9, 8, 7, 2],
        [14,11,15, 3, 15,10,14, 3],
        
        [ 4, 5, 6, 0,  6, 5, 4, 0],
        [12,11,13, 1, 13,10,12, 1],
        [ 9, 8, 7, 2,  7, 8, 9, 2],
        [15,10,14, 3, 14,11,15, 3],
    ];*/

    let mina = [
        [ 6, 5, 4, 2,  4, 5, 6, 0],
        [13,10,12, 1, 12,11,13, 1],
        [ 7, 8, 9, 0,  9, 8, 7, 2],
        [14,11,15, 3, 15,10,14, 3],
        
        [ 4, 5, 6, 2,  6, 5, 4, 0],
        [12,11,13, 1, 13,10,12, 1],
        [ 9, 8, 7, 0,  7, 8, 9, 2],
        [15,10,14, 3, 14,11,15, 3],
    ];


    let flip = [
        [99,99,99,99, 99,99,99,99],
        [99,99,99,99, 99,99,99,99],
        [99,99,99,99, 99,99,99,99],
        [99,99,99,99, 99,99,99,99],
        
        [99,99,99,99, 99,99,99,99],
        [99,99,99,99, 99,99,99,99],
        [99,99,99,99, 99,99,99,99],
        [99,99,99,99, 99,99,99,99],
    ];



    /*grid.build(sketch, |sketch, cell| {
        let p1 = cell.position;
        let p2 = p1 + Point::new(cell.size[0], 0);
        
        let c1 = image.get_pixel(cell.column as u32, cell.row as u32);
        if pixel_magnitude2(*c1).isqrt() > (443/2) {
            sketch.line(p1.x(), p1.y(), p2.x(), p2.y());
        }
    });*/

    let mut flags = ImageBuffer::from_fn(image.width(), image.height(), |x, y| {
        image::Luma([0u8])
    });

    grid.build(sketch, |sketch, cell| {
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
    });
    for y in 0..(state.h as u32) {
        let mut x = 0u32;
        while x < state.w {
            if flags.get_pixel(x, y )[0] != 2 {
                x += 1;
                continue;
            }
            let first = x;
            let mut last_need = x;
            while x < (state.w as u32) && flags.get_pixel(x, y)[0] > 0 {
                if (flags.get_pixel(x, y)[0] == 2) {
                    last_need = x;
                }
                x += 1;
            }
            let v1 = first as f64;
            let mut v2 = last_need as f64;
            if (first == last_need) {
                v2 += 0.01;
            }
            sketch.line(v1 * gs, y as f64 * gs, v2 * gs, y as f64 * gs);
        }
    }
    for x in 0..(state.w as u32) {
        let mut y = 0u32;
        while y < state.h {
            if flags.get_pixel(x, y )[0] != 1 {
                y += 1;
                continue;
            }
            let first = y;
            let mut last_need = first;
            while y < (state.h as u32) && flags.get_pixel(x, y)[0] > 0 {
                if (flags.get_pixel(x, y)[0] == 1) {
                    last_need = y;
                }
                y += 1;
            }
            let v1 = first as f64;
            let mut v2 = last_need as f64;
            if (first == last_need) {
                v2 += 0.01;
            }
            sketch.line(x as f64 * gs, v1 * gs, x as f64 * gs, v2 * gs);
        }
    }
}

impl App for DitherSketch {
    fn update(&mut self, sketch: &mut Sketch, _ctx: &mut Context) -> anyhow::Result<()> {
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

       
        match self.mode {
            DitherMode::Ordered8Dot => {
                dither_a(self,  sketch);
            }
            DitherMode::HV1 => {
                dither_b(self,  sketch);
            }
        }
/*
      
*/

        

        Ok(())
    }
}

fn main() -> whiskers::prelude::Result {
    DitherSketch::runner()
        .with_page_size_options(PageSize::A5H)
        .with_layout_options(LayoutOptions::Center)
        .run()
}
