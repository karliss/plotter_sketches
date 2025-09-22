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


### Linear slide mechanism

Most pen plotters will have multiple linear axis requiring some kind of slide mechanism. Common choices are 2020 V slot profiles with POM wheels, round rods with linear bearings or plastic bushings, linear rails.


My personal opinion is that linear rails are slightly overhyped for pen plotters. They are good parts when used correctly, but they aren't silver bullet that will automatically make the plotter 10x more accurate. 
I get the feeling that one of reasons linear rails are perceived as "being the best" is because out of the box they directly provide all the required functionality and even when used incorrectly will likely behave good enough for DIY level machine. Other systems have a lot more room for behaving awful when used incorrectly.

Seemingly out of the box they:
* are straight and self supported (not quite true 1*)
* fully constrain rotation and position along all axis except one linear motion (*3)
* has no slop (*2)

In reality
1*) Linear rails are not designed to be a structural part. They will be only as straight and rigid as frame you mount them to. Any stick shaped object longer than 0.5m will bend. Less critical for pen plotters, but for any other CNC machine if you want to benefit from high quality linear rails you need to think about what you are attaching the linear rail to. 
2*) Cheap linear rails can have slop especially if you are buying the rails and carriages separately. Less of problem if you are buying a set of rail+carriage in which case the seller might have already picked pairs which have the best fit. Occasionally hobbyists will buy a rail+a bunch of carriages just to pick one with best fit. 
3*) Typical linear rails are quite narrow. This means that while they constrain rotation on all 3 axis, the maximum torque is limited and the leverage from anything attached to it can easily be 10-20x than the size of carriage. So in any application where some forces are involved will likely have 2 parallel rails and or carriages. Increasing spacing with 2 rails is often a simpler solution than increasing size of rail.

In comparison

Linear rods+linear bearings(or plastic bushings) have few properties which require more careful design ahead of time.
They don't constrain rotation which sometimes can be a feature, but in most cases you will need two parallel rods to constrain the rotation.
On the other hand, like previously mentioned linear rails are often in pairs anyway so this isn't as big of deal as it might seem. But even if you have 2 parallel rods, unless you have additional structural they can easily twist.

Linear bearing are round which makes attaching them to rest of mechanism a bit trickier. To make things worse they are often designed with assumption that they will be press fit in specifically size hole which will provide certain amount of compression and ensure 0 slop. Poorly designed systems can give an incorrect impression that linear bearings are inherently sloppy. You can buy linear bearing blocks which solve both the mounting and compression problems, but those are usually somewhat expensive. More common in industrial application, less in DIY builds.

Linear rods can only be supported by the ends. You can't support them in the middle like linear rails or v wheels. This limits their use for bigger machines.


V slot profiles with wheels might seem like inferior solution (partially due to prejudice against plastic), but if used correctly they can be more than adequate for the forces and precision requirements of pen plotters. 

First thing with v slot profiles and wheels is to get actual v slot aluminium profiles designed to be used with corresponding wheels. There are other 2020 aluminum profiles with very similar shape (except small difference for the grove in the middle), which are not designed to be used with wheels. Using wrong ones might work temporary immediately after assembling but wrong shape profiles will very quickly vear out groves in the wheels. Don't trust amazon/ebay listing descriptions, check the pictures as well. Even when description says V-slot pictures occasionally show regular non v slot 2020 profiles, best to avoid listing where picture doesn't match description.

Second important thing is that the wheels need a to be properly tensioned. Typically this is achieved by having an eccentric nut which allows shifting the wheel by a millimeter in either direction and thus tighten it against the aluminum profile. Once tightened there should be no slop. But don't tighten them excessively as that will cause excessive wear on the wheels and also increase friction. 

You can buy the of the shelf mounting plates designed to be used with 2020 v slot profiles and wheels both as a kit with wheels included and just plates. They have the proper spacing for hole size to be used this way. You can buy just the wheels and eccentric nuts separately and design your own mounting plates. But unless you have the resources to make them out of metal, consider buying existing mounting plates. Attempting to 3d print them can easily lead to wheels either being loose immediately or over time as the plastic parts deform. The way tightening mechanism works means you can't easily support the bolts with wheels from both sides, and supporting them from single side with a plate is more suited for stronger materials.

One advantage of v slots design is that the aluminum profiles can be also used as structural elements resulting in simpler more compact design.

One more advantage of v slots is the wheel spacing. Even in the smallest case with 1x1 2020 you get 4 wheels spaced 40mm in both directions. You can also get bigger plates designed for 2x1 or 2x2 profiles further increasing wheel spacing. Larger wheel spacing helps resisting any torque without need for 2 parallel rails or multiple carriages on single rail like you would need do with linear rails or rods.

## Source of inspiration/existing models

If you are looking for inspiration or an existing design to build checkout websites with models for 3d printing, and posting diy projects. Recommended keywords for search "plotter", "pen plotter", "drawingbot". The later two will have more projects which are using mix of different techniques not just 3d printing.

3d printing
* [Printables](https://www.printables.com/search/models?q=plotter)
   * [various pen plotters](https://www.printables.com/@Kabacis_332837/collections/1870431)
   * [drawingmachines](https://www.printables.com/search/models?q=tag%3Adrawingmachine)
   * [penplotter](https://www.printables.com/search/models?q=tag%3Apenplotter)
   * [plotter](https://www.printables.com/search/models?q=tag%3Aplotter)
* [Thingiverse](https://www.thingiverse.com/search?q=plotter)
   * [various pen plotters](https://www.thingiverse.com/karliss/collections/43091126/things)
   * [subassemblies](https://www.thingiverse.com/karliss/collections/43091129/things)
* [Makerworld](https://makerworld.com/en/search/models?keyword=plotter)
* [Thagns](https://thangs.com/search/pen%20plotter?scope=all)

All kind of DIY projects:
* [hackaday.io](https://hackaday.io/search?term=pen+plotter)
* [instructables](https://www.instructables.com/search/?q=plotter&projects=all)

* https://www.instructables.com/CNC-Plotter-1/  (lingib)
* https://howtomechatronics.com/projects/diy-pen-plotter-with-automatic-tool-changer-cnc-drawing-machine/ 


## Lifter designs


* https://www.printables.com/model/868919-generative-pen-plotter-art-cnc-arduino-vinyl-cutte#preview.80Yeb (string stepper)
* https://discord.com/channels/929089222118359100/1133548294925209814/1188035146457284668 (idraw clone)
* https://discord.com/channels/499297341472505858/499298106035273770/1323441263625638039 (belt string)
* https://discord.com/channels/929089222118359100/1191870618187087992/1331014811848413265 (belt loop, 2 sliders on one rail)


# Various builds
* https://github.com/DanniDesign/Ploxy/tree/main
* https://github.com/jamescarruthers/PlotteRXY
* https://www.thingiverse.com/thing:6841321
* https://www.niklasroy.com/robotfactory/

# Pen changer builds

* https://www.youtube.com/watch?v=GGtdwYdZWi8
* https://howtomechatronics.com/projects/diy-pen-plotter-with-automatic-tool-changer-cnc-drawing-machine/ 

* https://www.youtube.com/watch?v=qAdHhoz2k2I

* https://www.youtube.com/watch?v=JuZ5lk2J5p4
* https://www.youtube.com/watch?v=CpA98QtHj4s

* https://www.doublejumpelectric.com/projects/toolchanging_pen_plotter/2019-03-17-toolchanging_pen_plotter/

* https://patents.google.com/patent/US4417258A/en