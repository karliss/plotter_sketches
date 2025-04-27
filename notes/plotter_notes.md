
| model     | manufacturer | type     | protocols                | connection    | max size                 | scale                         | axis                                | notes                                                                                                                                      |
| :-------- | :----------- | -------- | ------------------------ | --- | ------------------------ | ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| HP7221 | HP | flatbead | custom binary | RS232 serial | | | | S and T have roller feed, C and T 8 pens
| HP7220 | HP | flatbead | HPGL |
| HP7475A   | HP           | roller   | HPGL                     |     | A3, ANSI A               | 0.02488mm                     | XRYU(A4) / XDYR(A3)                 | Paper size chosen with switches in back and front. Axis direction changes depending on if it's A4 or A3                                    |
| HP7470A   | HP           | roller   | HPGL                     |     | A4, Letter               | 0.025mm                       | XDYR                                |                                                                                                                                            |
| HP7585B   | HP           | roller   | HPGL                     |     | A4/A - A0/E 927x1190mm   | 0.025mm                       |                                     |                                                                                                                                            |
| DMP-40V   | HI           | roller   | DMPL                     |     | 400-420mmx2000mm         | 0.1mm, 0.001in, 0.005in       |                                     | Has motorized blade rotation                                                                                                               |
| DMP-61    | HI           | roller   | DMPL,HPGL                |     | A-D,A4-A1                | 0.001in 0.005in 0.1mm 0.025mm | related to small/large chart option |                                                                                                                                            |
| DMP-62    | HI           | roller   | DMPL,HPGL                |     | A-F,A4-A0,B1             | 0.001in 0.005in 0.1mm 0.025mm | varies                              | Axis direction depends on small chart/large chart option. Origin and axis direction in HPGL mode differs from DMPL. HPGL origin in center. |
| DMP-161   | HI           | roller   | DMPL,HPGL,HP-GL/2        |     | <=24in (specific widths) | 0.001in 0.005in 0.1mm 0.025mm | varies                              | axis direction varies depending on size, but might be possible to configure fixed corner.                                                  |
| DMP-162   | HI           |          | DMPL,HPGL,HP-GL/2        |     | 36in                     |                               | varies                              |                                                                                                                                            |
| DMP-162R  | HI           |          | DMPL,HPGL,HP-GL/2        |     | 36in +rolls              |                               | varies                              | Supports paper rolls.                                                                                                                      |
| DXY-1150A | Roland       | flatbead | RD-GL II, RD-GL I,DXY-GL | parallel(centronics)+serial(db25) | A3,B,431.8x297mm         | 0.025mm,0.1mm                 | TODO, centered 0 in RD-GL II mode   | Magnetic paper holder. round buttons, holes for pen storage |
| DXY-1350A | Roland       | flatbead |                          |     |                          |                               |                                     | Electrostatic paper holder. Otherwise same as 1150A.                                                                                        |
| DXY-1150 | Roland | flatbead | | | | | | round buttons, holes for pen storage
| DXY-1350 | Roland | flatbead | | | | | | round buttons, electrostatic holder,
| DXY-1250 | Roland | flatbead | | | | | | round buttons, electrostatic holder, 7segment position indicator
| DXY-1100 | Roland | flatbead | RD-GL I, DXG-GL | | | DXY-GL(0.025mm, 0.1mm), RD-GL I(0.025mm) | XRYU | square buttons
| DXY-1200 | Roland | flatbead | RD-GL I, DXG-GL | | | DXY-GL(0.025mm, 0.1mm), RD-GL I(0.025mm)| | square buttons,electrostatic holder, 7segment position indicator
| DXY-1300 | Roland | flatbead | RD-GL I, DXG-GL | | | DXY-GL(0.025mm, 0.1mm), RD-GL I(0.025mm) | | square buttons
| DXY-880 | Roland | flatbead | DXY-GL,RD_GL | parallel(centronics)+serial(db25) | A3 (with unreachable padding),380x270mm | 0.1mm DXY, 0.025mm RD-GL | XRYU | Magnetic holder
| DXY-980(A?) | Roland | flatbead | DXY-GL,RD_GL | parallel(centronics)+serial(db25) | A3 (with unreachable padding),380x270mm | 1) 0.1mm DXY, 0.025mm RD-GL | XRYU  | Electrostatic holder, 7segment XY position indicator |
| DXY-990 | Roland | flatbead |
| DXY-885 | Roland | flatbead |


1) need to verify