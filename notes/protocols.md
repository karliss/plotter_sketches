
|                            | HP-GL           | GP-GL         |  DMP/PL                                          | GCode                    |
| :------------------------- | :-------------- | ------------- |  ----------------------------------------------- | ------------------------ |
| Main or initial user       | HP              | Graphtec      |  Houston instrument                              |                          |
| units                      | 0.025mm + scale | 0.1mm/0.025mm | EC1 0.001in, EC5 0.005in ECM 0.1mm, ECN 0.025mm | G20 inch, G21 metric(mm) |
| pen lift/down              | PU/PD           | M/D           | M/D                                             | machine specific         |
| special control characters |                 | ETX           |                                                 |                          |


# HP-GL (and HP-GL/2)

## Available references
* CHAPTER 9 HP-GL Graphics Language

## Secondary references (for confirming dialects supported by other manufacturer devices)
* DMP-60 SERIES PLOTTERS OPERATION MANUAL
* Houston Instrument DMP-160 Series Plotters Operation 
* Various Roland manuals where one of the supported modes is renamed version of HP-GL


# GP-GL
* Graphtec MP4000 Series command set reference manual
* https://github.com/fablabnbg/inkscape-silhouette/blob/main/Commands.md
* https://www.ohthehugemanatee.net/2011/07/gpgl-reference-courtesy-of-graphtec/

# Roland CAMM-GL (I/II/III), DXG-GL, RD-GL (I, II, III)

The versioning is very weird. According to CAMM-GL II programmer's manual:
> Consideration has been made for to ensure compatibility with DXY-GL for plotters from
Roland DG Corp. and with CAMM-GL III for the CAMM-1 Series of cutting machines
(mode1), as well as with CAMM-GL I for the CAMM-3 Series of compact modeling
machines (mode1).

Many Roland plotters support two command modes, one similar to HP-GL and other similar to GP-GL bet there are also some significant differences between real HP-GL, GP-GL and Roland flavors of them.

* DXG-GL - GP-GL like
* RD-GL I, II, III - based on HP-GL, later versions support wider range of commands
* CAMM-GL I, II, III mode 1 (more or less same as DXG-GL)
* CAMM-GL I, II, III mode 2 (more or less same as RDL-GL)

The differences between CAMM-GL I, II, III is that they are targeted at different device categories: CAMM-3 (milling machines), CAMM-2 (engravers), CAMM-1 (plotters).


## Available references
* CAMM-GL II Programmer's Manual (CAM-GL II mode 1, mode 2)

* DXY-880 operation manual (DXG-GL, RD-GL)
* DXY-1350A manual (DXG-GL)


# DM/PL

## Available references
* DMP/PL COMMAND LANGUAGE
* Houston Instrument DMP-160 Series Plotters Operation Manual
* HIPLOT® DMP-51/52 OPERATION MANUAL
* DMP-60 SERIES PLOTTERS OPERATION MANUAL

# GCode
Commonly used CNC mills, lathes, routers more recently also used by most FDM 3d printers. Popular choice for DIY machines with wide variety of available controller boards and firmwares. 

While basic commands are similar almost major manufacturer or firmware uses their own dialect. The biggest differences are usually related to:
* initialization
* homing procedure
* device configuration changes
* machine type and tool specific actions (needs of CNC mill are different from a lathe or 3d printer). For example 3d printer will have commands for controlling hotend temperature and synchronizing filament flow with movements, but CNC mills are more concerned with how fast the tool spins, tool size compensation and various routines for special operations like drilling or tapping. 
* macros and builtin scripting functionality

## Available references
When possible check the documentation of relevant controller manufacturer or firmware.

* https://www.linuxcnc.org/documents/ the GCode dialect is based on RS274/NGC
* RS274/NGC - not to be confused with various RS274 standards, describes the NIST reference GCode interpreters (with actual source code not an abstract specification)
* RS274 - common name for various standards made by NIST and other standards organizations describing the GCode. As far as I am aware the text can be only obtained by paying like many other standards. Limited relevance for hobbyists since most controller firmwares follow it very loosely. 
* https://reprap.org/wiki/G-code - covers differences between various 3d printer firmwares
* https://github.com/gnea/grbl/wiki and https://github.com/gnea/grbl/wiki While the original GRBL itself isn't actively maintained and the supported hardware is outdated, there are many forks derived from GRBL supporting newer hardware which are using similar gcode dialect. There are also plenty of older (and not so old) DIY builds still using it.
  - [FluidNC](http://wiki.fluidnc.com/) - popular for DIY plotters, currently supports only controller boards using one specific ESP32 chip, but range of supported hardware configurations isn't bad
  - [grblHAL](https://github.com/grblHAL) 
  - [RabbitGRBL](https://github.com/SourceRabbit/RabbitGRBL)
  - [uCNC](https://github.com/Paciente8159/uCNC)
* [MarlinFW](https://marlinfw.org/meta/gcode/) - Popular open source controller firmware. Supports wide range of controller boards. Primary targeted at 3d printers, but also has some CNC and laser specific features.

## Other DIY friendly GCode interpreters
* [Klipper](https://www.klipper3d.org/G-Codes.html) - high performance gcode interpreter. Primarily targeted at 3d printers, non 3d printer functionality limited. Good support for wide range 