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
                let mut points = vec![b, top];

                for i in 0..3 {
                    let frac = i as f64 / 3 as f64;
                    let start = Point::new(0, top.y() - (top.y() * 0.5) * frac);
                    points.push(start);
                    let w = top.y().abs() * lerp(3.0..=10.0, 0.1);
                    let br_h = w / self.angle.to_radians().tan();
                    points.push(start + Point::new(-w, br_h));
                    points.push(start);
                    points.push(start + Point::new(w, br_h));
                    points.push(start);
                }
                sketch.push_matrix();

                
                sketch.translate(cell.center.x(), cell.center.y());
                sketch.rotate_around(
                    Angle::from_deg(self.angle2),
                    0.0,
                    top.y() * 0.5,
                );

                sketch.polyline(points, true).pop_matrix();
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
