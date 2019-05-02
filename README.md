# @esveo/satellite-visualisation

## Add to your project

```
npm i @esveo/satellite-visualisation
```

or

```
yarn add @esveo/satellite-visualisation
```

## Example usage

```jsx
import SatelliteVisualisation from "@esveo/satellite-visualisation";

<SatelliteVisualisation
  satellites={[
    {
      id: "0",
      name: "International Space Station",
      type: "science",
      angle: 15,
      reverse: false
    },
    {
      id: "1",
      name: "Hubble Space Telescope",
      type: "science",
      angle: 40,
      reverse: true
    }
  ]}
  selectedSatelliteId="0"
/>;
```

## API

- satellites: Array of satellite objects with the following shape:
  - id: string
  - angle: number (between 0 and 360)
  - type: string (one of 'military', 'communication', and 'science')
- selectedSatelliteId: string (id of the highlighted satellite)

## Sizing

The visualisation will pick the size of the parent container.
You can use any styling technique to set the dimensions of your parent container and the visualisation will adjust its size:

```jsx
<div style={{ height: 400, width: 500 }}>
  <SatelliteVisualisation
    satellites={satellites}
    selectedSatelliteId={selectedSatelliteId}
  />
</div>
```
