## Resize Images

### Shrink to n% of the size (pixels)

    for i in $(find . -name '*.jpg' -not -name '*_25p.jpg'); do convert -resize 25% "$i" "${i%.jpg}_25p.jpg" && rm "$i"; done
    for i in $(find . -name '*.jpg' -not -name '*_50p.jpg'); do convert -resize 50% "$i" "${i%.jpg}_50p.jpg" && rm "$i"; done

### Cut animated gif

    convert source.gif -coalesce -repage 0x0 -crop WxH+X+Y +repage destination.gif

### Shrink animated gif

    convert source.gif -coalesce -resize WxH -deconstruct destination.gif
