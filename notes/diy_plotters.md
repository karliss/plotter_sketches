TODO:

## Commonly used parts

* Nema17 stepper motors (could use other sizes as well, but these are most common and easily available and usually don't need bigger ones in a pen plotter)
* 28BYJ-48 stepper motors (not recommended unless you are going for <$80 build budget, out of the box these will not work with many controller CNC/3d printer firmwares/stepper drivers)
* controller board -> recommended to search for "3d printer motherboard". You can get a decent modern board for $25-$50. Some manufacturers:
  - BIGTREETECH / BIQU
  - fysetc 
  - MKS
* (not recommended) boards mentioning Arduino, RAMPS or arduino CNC shield .
* stepper motor driver boards
  - some controller boards have builtin
  - other boards have sockets for step stick format driver boards
  - driver based on TMC chip are recommended (at the time of writing these notes)
  - larger format standalone stepper drivers are unlikely to be necessary for motors that you would use in a pen plotter
* Linear rails
* Linear bearings common size LM8UU
* Aluminum extrusion (for frame) commonly used 2020 series. There are variations 2x1, 3x1 and other variations which are 40x20 and 60x20 mm accordingly. Usually used together with matching angle brackets and t-nuts. Notes. Note that there are various other similar looking aluminum extrusion systems which have incompatible dimensions. Also 80/20 extrusions often instead referring to 4x1 2020 series profile (which have dimensions of 80x20mm), instead means one of the aluminum extrusions made by company called "80/20" which have multiple extrusion systems including some that are based on inches instead of metric units.