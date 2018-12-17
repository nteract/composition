declare module "Dx" {
  export interface dataProps {
    schema: Schema;
    data: Data;
  }

  export interface Schema {
    fields: Fields;
    pandas_version: string;
    primaryKey: Array<string>;
  }
  export interface Field {
    name: string;
    type: string;
    
  }
  export type Fields = Array<Field>;

  export interface Metric extends Field {
    type: "integer" | "datetime" | "number";
  }
  
  export interface Dimension extends Field {
    type: "string" | "boolean" | "datetime";
  }

  export type Data = Array<Datapoint>;
  export type Datapoint = { [fieldName: string]: any };

  export type LineCoordinate = {
    value: number;
    x: number;
    label: string;
    color: string;
    originalData: Datapoint;
  }

  export type LineData = {
    color: string;
    label: string;
    type: "number" | "integer" | "datetime";
    coordinates: LineCoordinate[]
  };

  export type Chart = {
    metric1?: string;
    metric2?: string;
    metric3?: string;
    dim1?: string;
    dim2?: string;
    dim3?: string;
    networkLabel?: string;
    timeseriesSort?: string;
  };
  export type LineType = "line" | "stackedarea" | "bumparea" | "stackedpercent";
}
