# Plotter test file

For testing plotter and pens.

When plotting **disable** any **optimizations** which reorder the paths! Certain parts of this file are meant to be plotted in specific order and direction.



## Checks

1) Pen width test, can be used to find what spacing produces solid infill
2) Spiral
3) Spiral, larger spacing and path going from outside to the center
4) Pen width check, same as 1. but vertical
5) Concentric circles. The middle one is using alternating directions. Pay attention whether circles are concentric, round (not oval) and evenly spaced.
6) Grid of lines
7) Text size, size of capital letters in mm
8) Grid made of rectangles with 1mm and 2mm spacing. Unlike 6 the rectangles cause liens to go in alternating directions.
9) Grid of rectangles, same as 8. but rotated 45°. 
10) Grid made of squares drawn in randomized order.
11) Backlash test. 1mm gaps are intentional. To do the test - place a piece of paper (or other flat straight material) along each square edge and check if the line segment from corner piece is aligned with the square edge.


12) empty

13) The big square 170mm. Can be used for testing that scale and steps/mm configuration is correct. Can be used for testing axis squareness by comparing diagonal length.
14) Crosses in the corners of big square. Meant to detect any position shifts during the print, which could be caused by motors skipping steps, paper being insufficiently secured, (in case of roller plotters that move the paper) paper slipping. First set of crosses should be plotted at the start and second set at the end.
15) Stretched crosses. Possible results (described for horizontal one, but works similarly ):
    - all 4 lines cross in the center - good
    - diagonal line crossing is shifted to the right or left - movement direction dependent vertical position error

## Files

* test_cal_plot_A4.svg - source file
* \*\_exported.svg - finalized file with all text converted to strokes

## Changelog

* v0.22 
   - Change the starting point for backlash test 11 so that it doesn't start from corner
   - Add 1.25mm font size
   - Add feature numbers
   - Add feature 15 - stretched crosses
   - Add direction arrows
* v0.21 first public version
