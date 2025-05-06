
| model | manufacturer | type | protocols | connection | speed | max size | scale | axis | notes |
| :---------- | :----------- | -------- | ------------------------------------- | --------------------------------- | --- | --------------------------------------- | ---------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| HP7221 | HP | flatbead | custom binary | RS232 serial | | | | | S and T have roller feed, C and T 8 pens |
| HP7220 | HP | flatbead | HPGL | | | | | | |
| HP7475A | HP | roller | HPGL | | | A3, ANSI A | 0.02488mm | XRYU(A4) / XDYR(A3) | Paper size chosen with switches in back and front. Axis direction changes depending on if it's A4 or A3 |
| HP7550A | roller | HPGL | HP-IB+2xRS232 serial with passthrough | | 800mm/s, 6G | A3 | | | | paper sheet tray/feed |
| HP7470A | HP | roller | HPGL | | | A4, Letter | 0.025mm | XDYR | |
| HP7585B | HP | roller | HPGL | | | A4/A - A0/E 927x1190mm | 0.025mm | | |
| DMP-40V | HI | roller | DMPL | | | 400-420mmx2000mm | 0.1mm, 0.001in, 0.005in | | Has motorized blade rotation |
| DMP-61 | HI | roller | DMPL,HPGL | | | A-D,A4-A1 | 0.001in 0.005in 0.1mm 0.025mm | related to small/large chart option | |
| DMP-62 | HI | roller | DMPL,HPGL | | | A-F,A4-A0,B1 | 0.001in 0.005in 0.1mm 0.025mm | varies | Axis direction depends on small chart/large chart option. Origin and axis direction in HPGL mode differs from DMPL. HPGL origin in center. |
| DMP-161 | HI | roller | DMPL,HPGL,HP-GL/2 | | | <=24in (specific widths) | 0.001in 0.005in 0.1mm 0.025mm | varies | axis direction varies depending on size, but might be possible to configure fixed corner. |
| DMP-162 | HI | | DMPL,HPGL,HP-GL/2 | | | 36in | | varies | |
| DMP-162R | HI | | DMPL,HPGL,HP-GL/2 | | | 36in +rolls | | varies | Supports paper rolls. |
| DXY-1350A | Roland | flatbead | RD-GL II, RD-GL I,DXY-GL | parallel(centronics)+serial(db25) | 600mm/s | | | | Electrostatic paper holder+replot Otherwise same as 1150A. |
| DXY-1150A | Roland | flatbead | RD-GL II, RD-GL I,DXY-GL | parallel(centronics)+serial(db25) | 600mm/s | A3,B,431.8x297mm | 0.025mm,0.1mm | TODO, centered 0 in RD-GL II mode | Magnetic paper holder. round buttons, holes for pen storage |
| DXY-1350 | Roland | flatbead | | | | | | | round buttons, holes for pen storage, electrostatic holder, 7segment position indicator, replot |
| DXY-1250 | Roland | flatbead | | | | | | | round buttons, holes for pen storage, electrostatic holder, 7segment position indicator |
| DXY-1150 | Roland | flatbead | | | | | | | round buttons, holes for pen storage |
| DXY-1300 | Roland | flatbead | RD-GL I, DXG-GL | parallel(centronics)+serial(db25) | | | DXY-GL(0.025mm, 0.1mm), RD-GL I(0.025mm) | XRYU | square buttons, electrostatic holder, 7segment position indicator, replot |
| DXY-1200 | Roland | flatbead | RD-GL I, DXG-GL | parallel(centronics)+serial(db25) | | | DXY-GL(0.025mm, 0.1mm), RD-GL I(0.025mm) | XRYU | square buttons, electrostatic holder, 7segment position indicator |
| DXY-1100 | Roland | flatbead | RD-GL I, DXG-GL | parallel(centronics)+serial(db25) | | | DXY-GL(0.025mm, 0.1mm), RD-GL I(0.025mm) | XRYU | square buttons, magnetic holder |
| DXY-980A| Roland | flatbead | | | | | | | Electrostatic holder, 7segment XY position indicator
| DXY-880A | Roland | flatbead | | | | | | | Magnetic holder |
| DXY-880 | Roland | flatbead | DXY-GL,RD_GL | parallel(centronics)+serial(db25) | | A3 (with unreachable padding),380x270mm | 0.1mm DXY, 0.025mm RD-GL | XRYU | Magnetic holder |
| DXY-980 | Roland | flatbead | DXY-GL,RD_GL | parallel(centronics)+serial(db25) | | A3 (with unreachable padding),380x270mm | 1) 0.1mm DXY, 0.025mm RD-GL | XRYU | Electrostatic holder, 7segment XY position indicator |
| DXY-990 | Roland | flatbead | RD-GL I | parallel(centronics)+serial(db25) | 300mm/s | A3, B (unreachable padding) | | | electrostatic+7segment position+pen buttons |
| DXY-885 | Roland | flatbead | RD-GL I | parallel(centronics)+serial(db25) | 300mm/s | 416mmx259mm (ANSI B), 403mmx276mm (A3) | | | magnetic
| DXY-800 | Roland | flatbead | DXY-GL | parallel(centronics)+serial(db25) | 180mm/s | 350x260mm | 0.1mm | | 8 pens |
| DXY-101 | Roland | flatbead | DXY-GL | parallel(centronics)+serial(db25) | 180mm/s | 370x260mm | 0.1mm | | 1 pen |

1) need to verify