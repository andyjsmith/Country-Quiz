# Country Quiz

A country quiz geography game for learning the locations of countries.

The initial inspiration for this game came after experimenting with OpenAI's [ChatGPT](https://openai.com/blog/chatgpt/) and asking it to generate some code for a map quiz game.

## Generating countries.geojson

Download the [Natural Earth country boundaries (1:50m)](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/).

Load the .shp file into [QGIS](https://qgis.org/en/site/).

Go into edit mode (the yellow pencil icon in the toolbar).

Open the attribute table (Layer -> Open Attribute Table).

Sort by TYPE, find the non-countries, and delete them or merge them with their main country.

To merge countries, hold shift to select multiple. Go to Edit -> Edit Geometry -> Merge Selected Features. Make sure the Merge row is the correct main country to merge into. If not, highlight the row and select "Take attributes from selected feature".

Sort by CONTINENT, and change any of the "Seven seas (open ocean)" entries to a continent:

- Mauritius -> Africa
- Seychelles -> Africa
- Maldives -> Asia

Export the map as GeoJSON:

1. Go to Layer -> Save As...
2. Select GeoJSON format
3. Set the file name to countries.geojson
4. Deselect all fields
5. Select NAME_EN and change the export name to "name"
6. Select CONTINENT and change the export name to "region"
7. Under Layer Options, set COORDINATE_PRECISION to 3

## Credits

- [Natural Earth](https://www.naturalearthdata.com/) for country outline data
- [Leaflet](https://leafletjs.com/) for the interactive map
- [ChatGPT](https://openai.com/blog/chatgpt/) for code suggestion

## Disclaimer

This game is solely for entertainment purposes and is not intended to make any political statements or endorsements regarding country borders. The data used in the game is sourced from Natural Earth and is presented as a means of teaching geographical concepts and information. The developer of the game is not responsible for any perceived political connotations or interpretations of the data presented in the game.
