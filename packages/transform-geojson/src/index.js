/* @flow */
/* eslint class-methods-use-this: 0 */
import React from "react";
import L from "leaflet";

type Props = {
  data: Object,
  metadata: Object,
  theme: string
};
type TileTheme = "dark" | "light";
type TileLayer = [string, Object];

const MIMETYPE = "application/geo+json";

L.Icon.Default.imagePath = "../node_modules/leaflet/dist/images/";

export function getLuma(el: HTMLElement): number {
  // https://en.wikipedia.org/wiki/Luma_(video)
  const style = window.getComputedStyle(el);
  const [r, g, b] = style.backgroundColor
    .replace(/^(rgb|rgba)\(/, "")
    .replace(/\)$/, "")
    .replace(/\s/g, "")
    .split(",");
  // Digital ITU BT.601
  // http://www.itu.int/rec/R-REC-BT.601
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  return y / 255;
}

export function getTheme(theme: string = "light", el: HTMLElement): TileTheme {
  switch (theme) {
    case "light":
    case "dark":
      return theme;
    default:
      if (getLuma(el) < 0.5) {
        return "dark";
      }
      return "light";
  }
}

export class GeoJSONTransform extends React.Component<Props> {
  MIMETYPE: string;
  map: Object;
  el: ?HTMLElement;
  geoJSONLayer: Object;
  tileLayer: Object;

  static defaultProps = {
    theme: "light"
  };
  static MIMETYPE = MIMETYPE;

  componentDidMount(): void {
    this.map = L.map(this.el);
    this.map.scrollWheelZoom.disable();
    this.tileLayer = L.tileLayer(...this.getTileLayer()).addTo(this.map);
    const geoJSON = this.props.data;
    this.geoJSONLayer = L.geoJson(geoJSON).addTo(this.map);
    this.map.fitBounds(this.geoJSONLayer.getBounds());
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    if (
      nextProps.theme !== this.props.theme ||
      this.props.data !== nextProps.data
    ) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.theme !== this.props.theme) {
      this.map.removeLayer(this.tileLayer);
      this.tileLayer = L.tileLayer(...this.getTileLayer()).addTo(this.map);
    }
    if (prevProps.data !== this.props.data) {
      const geoJSON = this.props.data;
      this.map.removeLayer(this.geoJSONLayer);
      this.geoJSONLayer = L.geoJson(geoJSON).addTo(this.map);
      this.map.fitBounds(this.geoJSONLayer.getBounds());
    }
  }

  getTileLayer = (): ?TileLayer => {
    if (!this.el) return;
    const theme = getTheme(this.props.theme, this.el);
    // const urlTemplate = (metadata && metadata.url_template) ||
    //   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const urlTemplate =
      this.props.metadata.url_template ||
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWlja3QiLCJhIjoiLXJIRS1NbyJ9.EfVT76g4A5dyuApW_zuIFQ";
    // const layerOptions = (metadata && metadata.layer_options) || {
    //   attribution: 'Map data (c) <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    //   minZoom: 0,
    //   maxZoom: 18
    // };
    const layerOptions = this.props.metadata.layer_options || {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      id: `mapbox.${theme}`
    };
    return [urlTemplate, layerOptions];
  };

  render(): ?React$Element<any> {
    return (
      <div>
        <link
          rel="stylesheet"
          href="../node_modules/leaflet/dist/leaflet.css"
        />
        <div
          ref={el => {
            this.el = el;
          }}
          style={{ height: 600, width: "100%" }}
        />
      </div>
    );
  }
}

export default GeoJSONTransform;
