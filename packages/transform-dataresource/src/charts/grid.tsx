import * as React from "react";
import ReactTable from "react-table";
import withFixedColumns from "react-table-hoc-fixed-columns";
import { Button, InputGroup, Tooltip } from "@blueprintjs/core";
import { blueprintCSS } from "@nteract/styled-blueprintjsx";

import ReactTableStyles from "../css/react-table";

import { JSONObject } from "@nteract/commutable";

import * as Dx from "../types";

const ReactTableFixedColumns = withFixedColumns(ReactTable);

const switchMode = (currentMode: string) => {
  const nextMode: JSONObject = {
    "=": ">",
    ">": "<",
    "<": "="
  };
  return nextMode[currentMode];
};

type OnChangeProps = (input: number | string) => void;

type FilterIndexSignature = "integer" | "number" | "string";

type NumberFilterProps = {
  onChange: OnChangeProps;
  filterState: { [key: string]: string };
  filterName: string;
  updateFunction: (input: JSONObject) => void;
};

const NumberFilter = (props: NumberFilterProps) => {
  const { filterState, filterName, updateFunction, onChange } = props;
  const mode = filterState[filterName] || "=";

  const lockButton = (
    <Tooltip content={`Switch to ${switchMode(mode)}`}>
      <Button
        minimal={true}
        onClick={() => {
          updateFunction({ [filterName]: switchMode(mode) });
        }}
      >
        {mode}
      </Button>
    </Tooltip>
  );

  return (
    <InputGroup
      //      allowNumericCharactersOnly={true}
      large={true}
      placeholder="number"
      rightElement={lockButton}
      small={false}
      type={"text"}
      onChange={(event: React.FormEvent<HTMLInputElement>) => {
        onChange(event.currentTarget.value);
      }}
    />
  );
};

const stringFilter = () => ({ onChange }: { onChange: OnChangeProps }) => (
  <InputGroup
    large={true}
    placeholder="string"
    type={"text"}
    onChange={(event: React.FormEvent<HTMLInputElement>) => {
      onChange(event.currentTarget.value);
    }}
  />
);

const numberFilterWrapper = (
  filterState: NumberFilterProps["filterState"],
  filterName: NumberFilterProps["filterName"],
  updateFunction: NumberFilterProps["updateFunction"]
) => ({ onChange }: { onChange: OnChangeProps }) => (
  <NumberFilter
    onChange={onChange}
    filterState={filterState}
    filterName={filterName}
    updateFunction={updateFunction}
  />
);

const filterNumbers = (mode = "=") => (
  filter: FilterObject,
  row: RowObject
) => {
  if (mode === "=") {
    return row[filter.id] == filter.value;
  } else if (mode === "<") {
    return row[filter.id] < filter.value;
  } else if (mode === ">") {
    return row[filter.id] > filter.value;
  }
  return row[filter.id];
};

const filterStrings = () => (filter: FilterObject, row: RowObject) => {
  return (
    row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
  );
};

type FilterMethodType = { [index in FilterIndexSignature]: Function };

const columnFilters: FilterMethodType = {
  integer: numberFilterWrapper,
  number: numberFilterWrapper,
  string: stringFilter
};

const filterMethod: FilterMethodType = {
  integer: filterNumbers,
  number: filterNumbers,
  string: filterStrings
};

type FilterObject = {
  id: string;
  value: string;
};

type RowObject = {
  [key: string]: string;
};

type State = {
  filters: { [key: string]: Function };
  showFilters: boolean;
};

type Props = {
  data: { data: Dx.Datapoint[]; schema: Dx.Schema };
  height: number;
};

class DataResourceTransformGrid extends React.Component<Props, State> {
  static defaultProps = {
    metadata: {},
    height: 500
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      filters: {},
      showFilters: false
    };
  }

  render() {
    const {
      data: { data, schema },
      height
    } = this.props;

    const { filters, showFilters } = this.state;

    const tableColumns = schema.fields.map((field: Dx.Field) => {
      if (
        field.type === "string" ||
        field.type === "number" ||
        field.type === "integer"
      ) {
        return {
          Header: field.name,
          accessor: field.name,
          fixed: schema.primaryKey.indexOf(field.name) !== -1 && "left",
          filterMethod: (filter: JSONObject, row: JSONObject) => {
            if (
              field.type === "string" ||
              field.type === "number" ||
              field.type === "integer"
            ) {
              filterMethod[field.type](filters[field.name])(filter, row);
            }
          },
          //If we don't have a filter defined for this field type, pass an empty div
          Filter: columnFilters[field.type](
            filters,
            field.name,
            (newFilter: { [key: string]: Function }) => {
              this.setState({ filters: { ...filters, ...newFilter } });
            }
          )
        };
      } else {
        return {
          Header: field.name,
          accessor: field.name,
          fixed: schema.primaryKey.indexOf(field.name) !== -1 && "left"
        };
      }
    });

    return (
      <div style={{ width: "calc(100vw - 150px)" }}>
        <Button
          icon="filter"
          onClick={() => this.setState({ showFilters: !showFilters })}
        >
          {showFilters ? "Hide" : "Show"} Filters
        </Button>
        <ReactTableFixedColumns
          data={data}
          columns={tableColumns}
          style={{
            height: `${height}px`
          }}
          className="-striped -highlight"
          filterable={showFilters}
        />
        <style jsx>{ReactTableStyles}</style>
        <style jsx>{blueprintCSS}</style>
      </div>
    );
  }
}

export default DataResourceTransformGrid;
