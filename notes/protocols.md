
|                      | HP-GL        | GP-GL          | DMP/PL                                          | DXG-GL, CAMM-GL mode 1      | RD-GL, CAMM-GL mode 2 | GCode                    |
| :------------------- | :----------- | -------------- | ----------------------------------------------- | --------------------------- | --------------------- | ------------------------ |
| Main or initial user | HP           | Graphtec       | Houston instrument                              | Roland                      | Roland                |                          |
| units                | 0.025mm, 0.02488mm* | 0.1mm/0.025mm  | EC1 0.001in, EC5 0.005in, ECM 0.1mm, ECN 0.025mm | 0.025mm, some mills  0.01mm, 0.1mm | 0.025mm               | G20 inch, G21 metric(mm) |
| pen lift/down        | PU/PD        | M/D            | M/D                                             | M/D                         | PU/PD                 | machine specific         |
| absolute/relative    | PA/PR        | M/O (down D/E) | A/R                                             | M/R (down D/I)              | PA/PR                 | G90/G91                  |


# HP-GL (and HP-GL/2)

Some materials mention HP-GL/2 and HP RTL, what are those?

HP RTL is protocol for raster printers, not relevant for pen plotters
The HP-GL/2 looks very similar to HP-GL, but it seemed to be described in context of device that support raster printing and other printing protocols. It's unclear if 

Exact scaling factor HP-GL devices is unclear. Many manuals say simply 0.025mm, some device manuals say "0.02488mm or 0.00098in", but there are also some that say "0.00098in 0.025mm". Does the real value vary between device models, are some of those simply inacurate rounding? It almost sounds like 0.02488mm is bad double conversation roundtrip. And that's just the HP docs, who knows what the other manufacturers implementing HP-GL do.

* 0.025mm = 40steps/mm = 1016steps/in (exact) ~= 0.00098425197in  | 100%
* 0.00098in=0.024892mm ~= 1020.408163 step/in ~= 40.173549 step/mm | 99.6%
* 1021step/in ~= 0.0009794319in ~= 0.024877571mm | 99.5%

Rounding error between 0.02488 and 0.025 might seem insignificant, but that's 1.5mm for A4 page or 3mm for A3 which can be easily measured and seen with naked eye.


## Available references
* HP DraftPro Plotter Programmer's Reference
* CHAPTER 9 HP-GL Graphics Language - not the offcial docs from HP 
* The HP-GL/2 and HP RTL Reference Guide A Handbook for Program Developers

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

Many Roland plotters support two command modes, one slightly similar to GP-Gl and other quite similar to HP-GL.


| name               | device series | similar roland protocol | similar protocol | device type     | notes                                                                                                                                                                                                     |
| :----------------- | :------------ | :---------------------- | :--------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DXG-GL             | DXY           |                         | GP-GL*           | pen plotter     | *many of the more advanced commands differ from GP-GL                                                                                                                                                     |
| RD-GL I, II, III   | DXY,DPX       |                         | HP-GL            | pen plotter     | Roman number roughly means protocol version, with higher version meaning more commands. But III isn't a strict superset, some commands are removed or argument meaning changed.                           |
| CAMM-GL III mode 1 | CAMM-1        | DXG-GL                  | GP-GL*           | cutting plotter |                                                                                                                                                                                                           |
| CAMM-GL II mode 1  | CAMM-2        | DXG-GL                  | GP-GL*           | engraver        | Additional commands for spindle motor control and engraving depth                                                                                                                                         |
| CAMM-GL I mode 1   | CAMM-3        | DXG-GL                  | GP-GL*           | mill            | Adds additional commands for 3axis movement and spindle control. Some mills are using 0.01 instead of 0.025 step size. Recommended to use CAM software meant for CNC mills instead of plotters/engravers. |
| CAMM-GL III mode 2 | CAMM-1        | RD-GL                   | HP-GL            | cutting plotter | The Roman number based numbering scheme for RD-GL and CAMM-GL has completely different meaning,                                                                                                           |
| CAMM-GL II mode 2  | CAMM-2        | RD-GL                   | HP-GL            | engraver        |                                                                                                                                                                                                           |
| CAMM-GL I mode 2   | CAMM-3        | RD-GL                   | HP-GL            | mill            | Recommended to use CAM software meant for CNC mills instead of plotters/engravers.                                                                                                                        |

DXG-GL, CAMM-GL mode 1 uses only 1 character commands while the GP-GL has some 2 character commands.

CAMM-GL devices have some 3 character commands prefixed by !, which can be used in both mode 1 and mode 2. These are usually Roland specific config commands which differ from GP-GL and HP-GL.


## Available references
* CAMM-GL II Programmer's Manual (CAMM-GL II mode 1, mode 2)

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

* https://www.linuxcnc.org/documents/ the GCode dialect is based on RS274/NGC . LinuxCNC rarely used for pen plotters
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

# EBB board protocol

Used by AxiDraw and iDraw machines.

* http://evil-mad.github.io/EggBot/ebb.html

## Available references
* [EBBB command set Firmware V3.0+](http://evil-mad.github.io/EggBot/ebb.html)