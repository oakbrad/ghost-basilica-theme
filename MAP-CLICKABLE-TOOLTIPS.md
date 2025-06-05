# Clickable Tooltips for Leaflet Maps

This theme now supports clickable tooltips on your Leaflet maps, allowing you to create interactive map elements that can navigate to other pages when clicked.

## How to Use Clickable Tooltips

When defining markers in your map JSON data, you can now add a `url` property to make the tooltip clickable:

```json
{
  "markers": [
    {
      "position": [500, 800],
      "tooltip": "Click to visit <b>The Castle</b>",
      "url": "/castle-page",
      "iconType": "flag"
    },
    {
      "position": [300, 600],
      "tooltip": "Visit the <b>Ancient Forest</b>",
      "url": "https://example.com/forest",
      "tooltipPermanent": true,
      "tooltipDirection": "top",
      "iconType": "flagpurple"
    }
  ]
}
```

## Tooltip Properties

- `tooltip`: The HTML content of the tooltip (supports basic HTML formatting)
- `url`: The URL to navigate to when the tooltip is clicked (can be relative or absolute)
- `tooltipPermanent`: (Optional) Set to `true` to make the tooltip always visible (default: `false`)
- `tooltipDirection`: (Optional) Set the direction of the tooltip: `'top'`, `'bottom'`, `'left'`, `'right'`, or `'auto'` (default: `'auto'`)

## Visual Indicators

Clickable tooltips have the following visual indicators:

1. A right arrow (→) appears at the end of the tooltip text
2. The cursor changes to a pointer when hovering over the tooltip
3. The tooltip slightly elevates and gets a shadow effect on hover
4. The border changes color on hover

## Example Usage

1. Create a post using the "Leaflet Map" template
2. Add your map image as the featured image
3. In the post content, add a code block with your map data JSON:

```json
{
  "markers": [
    {
      "position": [400, 700],
      "tooltip": "Click to read about <b>The Ancient Temple</b>",
      "url": "/ancient-temple",
      "iconType": "flagred"
    }
  ]
}
```

4. Publish your post
5. When users view your map, they can click on the tooltips to navigate to the specified URLs

