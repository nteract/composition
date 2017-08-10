#!/bin/bash

cd static/icons/

# assume we have image magic
# Note, we could use somthing like that to have icons of various colors:
#   convert -density 200 -resize 256x256 <(cat nteract-desktop.svg|sed 's/5995f3/ffffff/' ) test.png

mkdir -p nteract.iconset

# convert -density 200 -resize 16x16     <(cat nteract-desktop-face.svg) nteract.iconset/icon_16x16.png
# convert -density 200 -resize 32x32     <(cat nteract-desktop-face.svg) nteract.iconset/icon_16x16@2x.png
# convert -density 200 -resize 32x32     <(cat nteract-desktop-face.svg) nteract.iconset/icon_32x32.png
# convert -density 200 -resize 64x64     <(cat nteract-desktop-face.svg) nteract.iconset/icon_32x32@2x.png
# 
# convert -density 200 -resize 128x128   <(cat nteract-desktop.svg)      nteract.iconset/icon_128x128.png
# convert -density 200 -resize 256x256   <(cat nteract-desktop.svg)      nteract.iconset/icon_128x128@2x.png
# convert -density 200 -resize 256x256   <(cat nteract-desktop.svg)      nteract.iconset/icon_256x256.png
# convert -density 200 -resize 512x512   <(cat nteract-desktop.svg)      nteract.iconset/icon_256x256@2x.png
# convert -density 200 -resize 512x512   <(cat nteract-desktop.svg)      nteract.iconset/icon_512x512.png


inkscape -z -y0 -w 16 -h 16     $(pwd)/nteract-desktop-face.svg -e $(pwd)/nteract.iconset/icon_16x16.png
inkscape -z -y0 -w 32 -h 32     $(pwd)/nteract-desktop-face.svg -e $(pwd)/nteract.iconset/icon_16x16@2x.png
inkscape -z -y0 -w 32 -h 32     $(pwd)/nteract-desktop-face.svg -e $(pwd)/nteract.iconset/icon_32x32.png
inkscape -z -y0 -w 64 -h 64     $(pwd)/nteract-desktop-face.svg -e $(pwd)/nteract.iconset/icon_32x32@2x.png

inkscape -z -y0 -w 128 -h 128   $(pwd)/nteract-desktop.svg      -e $(pwd)/nteract.iconset/icon_128x128.png
inkscape -z -y0 -w 256 -h 256   $(pwd)/nteract-desktop.svg      -e $(pwd)/nteract.iconset/icon_128x128@2x.png
inkscape -z -y0 -w 256 -h 256   $(pwd)/nteract-desktop.svg      -e $(pwd)/nteract.iconset/icon_256x256.png
inkscape -z -y0 -w 512 -h 512   $(pwd)/nteract-desktop.svg      -e $(pwd)/nteract.iconset/icon_256x256@2x.png
inkscape -z -y0 -w 512 -h 512   $(pwd)/nteract-desktop.svg      -e $(pwd)/nteract.iconset/icon_512x512.png
inkscape -z -y0 -w 1024 -h 1024 $(pwd)/nteract-desktop.svg      -e $(pwd)/nteract.iconset/icon_512x512@2x.png
