import React from 'react';
import ReactMapboxGl, { GeoJSONLayer, ScaleControl, ZoomControl } from 'react-mapbox-gl';

const MIMETYPE = 'application/vnd.geo+json';
const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

export class GeoJSONTransform extends React.Component {
  render() {
    const data = this.props.data.toJS();

    return (
      <ReactMapboxGl
        style="mapbox://styles/mapbox/light-v8"
        accessToken={ACCESS_TOKEN}
        containerStyle={{ height: '600px', width: '100%' }}>

        <ScaleControl/>
        <ZoomControl/>

        <GeoJSONLayer
          data={data}
          symbolLayout={{
            "text-field": "{place}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
          }}/>

      </ReactMapboxGl>
    );
  }
}

GeoJSONTransform.propTypes = {
  data: React.PropTypes.any,
};

GeoJSONTransform.MIMETYPE = MIMETYPE;

export default GeoJSONTransform;
