
use image::{GenericImageView, ImageBuffer, ImageReader, Pixel, Rgb};
use kurbo::Vec2;
use nalgebra::{vector, Vector2, Vector3};
use serde;
use std::result::Result;
use vsvg::UNITS;
use whiskers::prelude::*;

#[sketch_app]
struct MSTImageSketch {
    #[param(slider, min = 0.01, max = 5.0)]
    line_size: f64,
    path: String,
    have_image: bool,
    #[param(min = 0.0, max = 100.0)]
    zero_dist_cost: f32,
    min_dist: bool,
    pr_mult: f32,
    #[param(slider, min = 0.01, max = 5.0)]
    pr_power: f64,
    #[skip]
    #[serde(skip)]
    dstate: DynamicState,
}

#[derive(Default)]
struct DynamicState {
    path_loaded: String,
    image: ImageBuffer<image::Rgb<u8>, Vec<u8>>,
}

impl Default for MSTImageSketch {
    fn default() -> Self {
        Self {
            line_size: 1.0,
            path: String::default(),
            zero_dist_cost: 0f32,
            pr_mult: 1f32,
            pr_power: 1f64,
            have_image: false,
            min_dist: false,
            dstate: DynamicState::default(),
        }
    }
}

impl MSTImageSketch {
    fn load_image(&mut self) -> Result<(), ()> {
        let mut img = ImageReader::open(&self.path)
            .map_err(|e| ())?
            .decode()
            .map_err(|e| ())?
            .to_rgb8();

        let img = image::imageops::resize(
            &img,
            img.width() / 4,
            img.height() / 4,
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

impl App for MSTImageSketch {
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
        sketch.stroke_width(self.line_size);

        let image = &self.dstate.image;
        let pw = vsvg::Unit::Mm.convert(sketch.width()) / image.width() as f64;

        let grid = Grid::from_cell_size([pw, pw])
            .columns(self.dstate.image.width() as usize)
            .rows(self.dstate.image.height() as usize);
        let mut nr = 0;
        /*grid.build(sketch, |sketch, cell| {
            let p1 = cell.position;
            let p2 = p1 + Point::new(cell.size[0], 0);
            if cell.column + 1 >= image.width() as usize {
                return;
            }
            let c1 = image.get_pixel(cell.column as u32, cell.row as u32);
            let c2 = image.get_pixel((cell.column + 1) as u32, cell.row as u32);
            if pixel_magnitude2(*c1) < pixel_magnitude2(*c2) {
                sketch.line(p1.x(), p1.y(), p2.x(), p2.y());
            }
            if nr < 8000000 {
                nr += 1;
            }
        });*/
        let mut heap: std::collections::BinaryHeap<HeapPos> = std::collections::BinaryHeap::new();
        let mut processed: std::collections::HashSet<IPos2> = std::collections::HashSet::new();
        let DV = [
            IPos2::new(-1, 0),
            IPos2::new(1, 0),
            IPos2::new(0, 1),
            IPos2::new(0, -1),
            IPos2::new(1, -1),
            IPos2::new(-1, -1),
            IPos2::new(1, 1),
            IPos2::new(-1, 1),
        ];
        let mut p0 = IPos2::new(0, 0);
        let mut best  = 100_f32;
        for i in 0..image.height() {
            for j in 0..image.width() {
                let p = *image.get_pixel(j, i);
                let sum = pixel_to_vec32f(p).magnitude();
                if sum < best {
                    p0 = IPos2::new(j as i32, i as i32);
                    best = sum;
                }
            }
        }

        heap.push(HeapPos {
            cost: 0.0,
            pos: p0,
            prev: p0,
        });
        while let Some(front) = heap.pop() {
            if processed.contains(&front.pos) {
                continue;
            }
            processed.insert(front.pos);

            let current_pix =
                pixel_to_vec32f(*image.get_pixel(front.pos.x as u32, front.pos.y as u32));

            let pr = 1f64 - current_pix.magnitude() as f64/((3*255*255) as f64).sqrt();
            if !_ctx.rng_weighted_bool(( self.pr_mult as f64 * pr.powf(self.pr_power)).clamp(0.0, 1.0)) {
                continue;
            }

            let p1 = grid_cell(pw, front.pos);
            let p2 = grid_cell(pw, front.prev);
            

            sketch.line(p1.x, p1.y, p2.x, p2.y);
            for dir in DV {
                let target = front.pos + dir;

                if target.x < 0
                    || target.y < 0
                    || !image.in_bounds(target.x as u32, target.y as u32)
                {
                    continue;
                }
                let target_pixel =
                    pixel_to_vec32f(*image.get_pixel(target.x as u32, target.y as u32));
                let mut dist =  ((target_pixel - current_pix).magnitude() + self.zero_dist_cost) * (dir.dot(&dir) as f32).sqrt();
                if self.min_dist {
                    dist += front.cost;
                }
                heap.push(HeapPos {
                    cost: dist /*+ front.cost*/,
                    pos: target,
                    prev: front.pos,
                })
            }
        }

        Ok(())
    }
}

fn main() -> whiskers::prelude::Result {
    MSTImageSketch::runner()
        .with_page_size_options(PageSize::A5H)
        .with_layout_options(LayoutOptions::Center)
        .run()
}
