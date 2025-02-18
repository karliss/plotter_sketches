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
* V-wheels for matching aluminum extrusions. You can also buy ready mount plates with 3-4 wheels, with builtin mechanism for adjusting tension.
* Belts and pulleys for them. Most common type used in 3d printers -> GT2 6mm. 
  - belt
  - drive pulley for mounting on stepper motor shaft, with grubscrew for locking it in place on D shaped shaft
  - toothed and smooth idler pulleys depending on belt routing

## Source of inspiration/existing models

If you are looking for inspiration or an existing design to build checkout websites with models for 3d printing, and posting diy projects. Recommended keywords for search "plotter", "pen plotter", "drawingbot". The later two will have more projects which are using mix of different techniques not just 3d printing.

3d printing
* [Printables](https://www.printables.com/search/models?q=plotter)
   * [various pen plotters](https://www.printables.com/@Kabacis_332837/collections/1870431)
   * [drawingmachines](https://www.printables.com/search/models?q=tag%3Adrawingmachine)
   * [penplotter](https://www.printables.com/search/models?q=tag%3Apenplotter)
   * [plotter](https://www.printables.com/search/models?q=tag%3Aplotter)
* [Thingiverse](https://www.thingiverse.com/search?q=plotter)
* [Makerworld](https://makerworld.com/en/search/models?keyword=plotter)
* [Makerworld](https://makerworld.com/en/search/models?keyword=plotter)
* [Thagns](https://thangs.com/search/pen%20plotter?scope=all)

All kind of DIY projects:
* [hackaday.io](https://hackaday.io/search?term=pen+plotter)
* [instructables](https://www.instructables.com/search/?q=plotter&projects=all)

* https://www.instructables.com/CNC-Plotter-1/  (lingib)
* https://howtomechatronics.com/projects/diy-pen-plotter-with-automatic-tool-changer-cnc-drawing-machine/ 
