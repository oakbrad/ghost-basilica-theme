# Map Block Component

The Map Block component provides an easy way to embed interactive maps anywhere in your Ghost theme.

## Usage

### Basic Usage

To include a map in any template, use the following code:

```handlebars
{{> "map-block"}}
```

This will display the default map (Pyora) with default settings.

### Customizing the Map

You can customize the map by passing parameters:

```handlebars
{{> "map-block" 
    post_slug="pyora" 
    overlay="Sunset_Clouds_Squar_One.webm" 
    opacity="1.0"
}}
```

#### Parameters

- `post_slug`: The slug of the post containing the map data (default: "pyora")
- `overlay`: The filename of the video overlay to display (default: "Sunset_Clouds_Squar_One.webm")
- `opacity`: The opacity of the video overlay (default: "1.0")

### Including in Templates

The map-block can be included in any template. For example:

```handlebars
{{!-- In a post template --}}
<div class="post-content">
    {{content}}
    
    {{!-- Add a map at the end of the post --}}
    {{> "map-block" post_slug=post.slug}}
</div>
```

### Full-Page Map

A full-page map template is available at `custom-map-block.hbs`. To use it:

1. Create a custom template in Ghost Admin
2. Select "custom-map-block" as the template
3. The map will fill the entire page below the header

## Styling

The map-block comes with default styling that makes it extend to the full width of the page with a height of 500px. You can customize this by adding your own CSS:

```css
/* Custom styling for map-block */
.map-block {
    height: 700px; /* Taller map */
    margin-bottom: 30px; /* Less margin */
}
```

## Technical Details

The map-block component:

1. Creates a container with the appropriate data attributes
2. Fetches the specified post for map data
3. Renders the map using the Leaflet.js library
4. Applies the video overlay if specified

The map data is stored in the post content as JSON and is processed by the map component.

