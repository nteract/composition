import * as React from "react";
import L from "leaflet";
import { GeoJsonObject } from "geojson";

interface Metadata {
  url_template: string;
  layer_options: object;
}

interface Props {
  data: GeoJsonObject;
  metadata: Metadata;
  mediaType: "application/geo+json";
  theme: string;
};

type TileTheme = "dark" | "light";
type TileLayer = { urlTemplate: string, layerOptions: object };

const MIMETYPE = "application/geo+json";

L.Icon.Default.imagePath = "../node_modules/leaflet/dist/images/";

export function getLuma(el: HTMLElement): number {
  // https://en.wikipedia.org/wiki/Luma_(video)
  const style = window.getComputedStyle(el);
  const [r, g, b] = style.backgroundColor!
    .replace(/^(rgb|rgba)\(/, "")
    .replace(/\)$/, "")
    .replace(/\s/g, "")
    .split(",");
  // Digital ITU BT.601
  // http://www.itu.int/rec/R-REC-BT.601
  const y = 0.299 * Number(r) + 0.587 * Number(g) + 0.114 * Number(b);
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
  MIMETYPE!: string;
  map!: L.Map;
  el!: HTMLDivElement | null;
  geoJSONLayer!: L.GeoJSON;
  tileLayer!: L.TileLayer;

  static defaultProps = {
    theme: "light",
    mediaType: MIMETYPE
  };
  static MIMETYPE = MIMETYPE;

  componentDidMount(): void {
    this.map = L.map(this.el!);
    this.map.scrollWheelZoom.disable();
    const tileLayerOptions = this.getTileLayer();
    this.tileLayer = L.tileLayer(tileLayerOptions!.urlTemplate, tileLayerOptions!.layerOptions).addTo(this.map);
    const geoJSON = this.props.data;
    this.geoJSONLayer = L.geoJSON(geoJSON).addTo(this.map);
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
      const tileLayerOptions = this.getTileLayer();
      this.tileLayer = L.tileLayer(tileLayerOptions!.urlTemplate, tileLayerOptions!.layerOptions).addTo(this.map);
    }
    if (prevProps.data !== this.props.data) {
      const geoJSON = this.props.data;
      this.map.removeLayer(this.geoJSONLayer);
      this.geoJSONLayer = L.geoJSON(geoJSON).addTo(this.map);
      this.map.fitBounds(this.geoJSONLayer.getBounds());
    }
  }

  getTileLayer = (): TileLayer | undefined => {
    if (!this.el) return;
    const theme = getTheme(this.props.theme, this.el);
    // const urlTemplate = (this.props.metadata && this.props.metadata.url_template) ||
    //   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const urlTemplate =
      (this.props.metadata && this.props.metadata.url_template) ||
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWlja3QiLCJhIjoiLXJIRS1NbyJ9.EfVT76g4A5dyuApW_zuIFQ";
    // const layerOptions = (this.props.metadata && this.props.metadata.layer_options) || {
    //   attribution: 'Map data (c) <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    //   minZoom: 0,
    //   maxZoom: 18
    // };
    const layerOptions = (this.props.metadata &&
      this.props.metadata.layer_options) || {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      id: `mapbox.${theme}`
    };
    return { urlTemplate, layerOptions };
  };

  render(): React.ReactElement<any> {
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}

export default GeoJSONTransform;
