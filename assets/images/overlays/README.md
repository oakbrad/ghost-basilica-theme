# Animated Map Overlays

This directory contains WebM video files that can be used as animated overlays on Leaflet maps.

## Default Overlay

The default animated overlay is `clouds.webm`, which creates a moving cloud effect over maps.

## Adding Custom Overlays

You can add your own WebM files to this directory and reference them in your map JSON configuration:

```json
{
  "animatedOverlay": {
    "enabled": true,
    "url": "/assets/images/overlays/your-custom-overlay.webm",
    "opacity": 0.4,
    "autoplay": true,
    "loop": true
  }
}
```

## Creating WebM Overlays

For best results:

1. Create transparent WebM videos (VP8/VP9 codec with alpha channel)
2. Keep file sizes small (under 5MB if possible)
3. Use a resolution that matches your map dimensions
4. Use subtle animations that don't distract from the map content

## Recommended Tools

- [FFmpeg](https://ffmpeg.org/) - Command-line tool for video conversion
- [HandBrake](https://handbrake.fr/) - GUI for video conversion
- [GIMP](https://www.gimp.org/) or [Photoshop](https://www.adobe.com/products/photoshop.html) - For creating animated overlays
- [After Effects](https://www.adobe.com/products/aftereffects.html) - For more complex animations

## Example FFmpeg Command

Convert an animated PNG sequence to WebM with transparency:

```bash
ffmpeg -framerate 24 -i frame_%04d.png -c:v libvpx -pix_fmt yuva420p -metadata:s:v:0 alpha_mode="1" -auto-alt-ref 0 -quality good -b:v 2M -crf 30 output.webm
```

