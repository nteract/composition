declare module "Dx" {
  export type dataProps = {
    schema: Schema;
    data: Data;
  };

  export type Schema = {
    fields: Fields;
    pandas_version: string;
    primaryKey: Array<string>;
  };

  export type Fields = Array<{ name: string; type: string }>;

  export type Data = Array<Datapoint>
  export type Datapoint = {[fieldName: string]: any}
}
