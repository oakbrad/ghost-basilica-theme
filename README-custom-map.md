# Custom Map Template for Ghost Basilica Theme

This template allows you to create interactive maps using Leaflet.js with data from Google Sheets.

## How to Use

1. Create a Google Sheet with your map data. The sheet should have the following columns:
   - `Latitude` (required): The latitude coordinate for the marker
   - `Longitude` (required): The longitude coordinate for the marker
   - `Title` (optional): The title for the marker popup
   - `Description` (optional): The description text for the marker popup
   - `Image` (optional): URL to an image to display in the popup
   - `Link` (optional): URL to link to from the popup
   - `Marker Color` (optional): Color for the marker (default: blue)
   - `Marker Icon` (optional): Font Awesome icon name (default: circle)

2. Publish your Google Sheet:
   - Click File > Share > Publish to the web
   - Choose "Entire Document" and "CSV" format
   - Click "Publish"
   - Copy the URL of your Google Sheet from the browser address bar

3. Create a new post in Ghost:
   - Write your post content (this will be hidden when the map is displayed)
   - In the post settings, select "custom-map" as the template
   - Go to the "Code injection" section in the post settings
   - Add the following HTML in the header section:
     ```html
     <meta name="custom:sheet_url" content="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit">
     ```
     (Replace YOUR_SHEET_ID with your actual Google Sheet ID)

4. Publish your post and view the full-screen map!

## Example Google Sheet Structure

| Latitude | Longitude | Title | Description | Image | Link | Marker Color | Marker Icon |
|----------|-----------|-------|-------------|-------|------|-------------|-------------|
| 37.7749  | -122.4194 | San Francisco | The Golden City | https://example.com/sf.jpg | https://sf.gov | red | building |
| 40.7128  | -74.0060  | New York | The Big Apple | https://example.com/nyc.jpg | https://nyc.gov | blue | apple-alt |

## Customization

The map uses the dark theme from CartoDB by default, which works well with the Ghost theme's dark mode. The markers and popups are styled to match the Ghost theme's color scheme.

## Troubleshooting

- If the map doesn't load, check that your Google Sheet is properly published and accessible
- Ensure your data has valid latitude and longitude coordinates
- Check the browser console for any JavaScript errors

