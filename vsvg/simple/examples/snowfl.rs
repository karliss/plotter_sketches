// Inspired by the approach used by revdancatt https://revdancatt.com/penplotter/036-Snowflakes/

use std::cmp::min;

use egui::lerp;
use vsvg::UNITS;
use whiskers::prelude::*;

#[sketch_app]
struct HexGridSketch {
    #[param(min = 0.01, max = 100.0)]
    line_size: f64,
    is_pointy_orientation: bool,
    #[param(slider, min = 2, max = 100)]
    columns: usize,
    #[param(slider, min = 2, max = 100)]
    rows: usize,
    #[param(slider, min = 0.0, max = 200.0)]
    spacing: f64,
    #[param(slider, min = 0.0, max = 100.0)]
    cell_size: f64,
    #[param(slider, min = 0.0, max = 1.0)]
    tree_h: f64,
    #[param(slider, min = 0.0, max = 90.0)]
    angle: f64,

    #[param(slider, min = 0.0, max = 360.0)]
    angle2: f64,
}

impl Default for HexGridSketch {
    fn default() -> Self {
        Self {
            line_size: 1.0,
            columns: 5,
            rows: 5,
            spacing: 0.0,
            is_pointy_orientation: false,
            cell_size: 40.0,
            tree_h: 0.7,
            angle: 45.0,
            angle2: 0.0,
        }
    }
}

impl App for HexGridSketch {
    fn update(&mut self, sketch: &mut Sketch, _ctx: &mut Context) -> anyhow::Result<()> {
        sketch.stroke_width(self.line_size);

        let grid = if self.is_pointy_orientation {
            HexGrid::with_pointy_orientation()
        } else {
            HexGrid::with_flat_orientation()
        };

        sketch.scale(Unit::Mm);

        grid.cell_size(self.cell_size)
            .columns(self.columns)
            .rows(self.rows)
            .spacing(self.spacing)
            .build(sketch, |sketch, cell| {
                let b = Point::new(0.0, 0.0); //cell.center;
                let top = b + Point::new(0, -self.cell_size * self.tree_h);

                sketch.push_matrix();

                sketch.translate(cell.center.x(), cell.center.y());
                sketch.rotate_around(Angle::from_deg(self.angle2), 0.0, 0.0);

                let size: f64 = self.tree_h * self.cell_size;
                let steps = _ctx.rng_range(2..5);
                let mut branches = vec![(0.0, 0); steps];
                let shape = _ctx.rng_range(0..1);
                let branch_w = vec![(80.0, 0), (20.0, 1), (10.0, 2), (10.0, 3)];
                let linec = {
                    if _ctx.rng_weighted_bool(0.10) {
                        _ctx.rng_range(2..4)
                    } else {
                        1
                    }
                };

                for b in 0..steps {
                    let pos = size * ((1 + b) as f64) / (steps as f64 + 1.0);
                    let mut maxl = size;
                    if shape == 0 {
                        maxl = f64::min(size * 0.3, pos);
                    }
                    let l = _ctx.rng_range(0.3..1.3) * maxl;
                    let t = *_ctx.rng_weighted_choice(&branch_w);
                    branches[b] = (l, t);
                }

                if !self.is_pointy_orientation {
                    sketch.rotate(Angle::from_deg(30.0));
                }

                for _i in 0..3 {
                    sketch.rotate(Angle::from_deg(60.0));

                    if linec == 1 {
                        sketch.line(0, -size, 0, size);
                    } else if linec == 2 {
                        let w = 0.05 * size;
                        sketch.line(-w, -size, -w, size);
                        sketch.line(w, size, w, -size);
                    } else {
                        for i in 0..linec {
                            let w = 0.1 * size;
                            let p = i as f64 * w  / ((linec - 1) as f64) - 0.5 * w;
                            let down  = if i % 2 == 0 {1f64}  else {-1f64};
                            sketch.line(p, -size * down, p, size * down);
                            

                        }
                    }
                    
                }
                for _i in 0..6 {
                    sketch.rotate(Angle::from_deg(60.0));
                    //sketch.line(0, 0, 0, size);
                    for b in 0..steps {
                        let pos = size * ((1 + b) as f64) / (steps as f64 + 1.0);
                        let (l, t) = branches[b];
                        if t == 0 {
                            sketch.line(
                                -f64::sin(60_f64.to_radians()) * l,
                                pos + f64::cos(60_f64.to_radians()) * l,
                                0,
                                pos,
                            );
                            sketch.line(
                                0,
                                pos,
                                f64::sin(60_f64.to_radians()) * l,
                                pos + f64::cos(60_f64.to_radians()) * l,
                            );
                        } else if t == 1 {
                            sketch.line(
                                -f64::sin(60_f64.to_radians()) * l,
                                pos - f64::cos(60_f64.to_radians()) * l,
                                0,
                                pos,
                            );
                            sketch.line(
                                0,
                                pos,
                                f64::sin(60_f64.to_radians()) * l,
                                pos - f64::cos(60_f64.to_radians()) * l,
                            );
                        } else if t == 2 {
                            sketch.circle(0, pos, f64::min(l, 0.15 * size));
                        } else if t == 3 {
                            let l2 = f64::min(l, 0.15 * size);
                            sketch
                                .push_matrix()
                                .translate(0, pos)
                                .polyline(
                                    (0..6).map(|i| {
                                        let a = ((60 * i) as f64).to_radians();
                                        Point::new(a.sin() * l2, a.cos() * l2)
                                    }),
                                    true,
                                )
                                .pop_matrix();
                        }
                    }
                }

                sketch.pop_matrix();
                //sketch.add_path(cell);
            });

        Ok(())
    }
}

fn main() -> Result {
    HexGridSketch::runner()
        .with_page_size_options(PageSize::A5H)
        .with_layout_options(LayoutOptions::Center)
        .run()
}
