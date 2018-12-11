import * as React from "react";
import ReactTable from "react-table";
import withFixedColumns from "react-table-hoc-fixed-columns";
import { Button, InputGroup, Tooltip } from "@blueprintjs/core";
import { BlueprintCSS } from "@nteract/styled-blueprintjsx";

import ReactTableStyles from "../css/react-table";

const ReactTableFixedColumns = withFixedColumns(ReactTable);

const switchMode = currentMode => {
  const nextMode = {
    "=": ">",
    ">": "<",
    "<": "="
  };
  return nextMode[currentMode];
};

const NumberFilter = props => {
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
      allowNumericCharactersOnly={true}
      large={true}
      placeholder="number"
      rightElement={lockButton}
      small={false}
      type={"text"}
      onChange={event => onChange(event.target.value)}
    />
  );
};

const stringFilter = () => ({ onChange }) => (
  <InputGroup
    large={true}
    placeholder="string"
    type={"text"}
    onChange={event => onChange(event.target.value)}
  />
);

const numberFilterWrapper = (filterState, filterName, updateFunction) => ({
  filter,
  onChange
}) => (
  <NumberFilter
    filter={filter}
    onChange={onChange}
    filterState={filterState}
    filterName={filterName}
    updateFunction={updateFunction}
  />
);

const columnFilters = {
  integer: numberFilterWrapper,
  number: numberFilterWrapper,
  string: stringFilter
};

const filterNumbers = (mode = "=") => (filter, row) => {
  if (mode === "=") {
    return row[filter.id] == filter.value;
  } else if (mode === "<") {
    return row[filter.id] < filter.value;
  } else if (mode === ">") {
    return row[filter.id] > filter.value;
  }
  return row[filter.id];
};

const filterStrings = () => (filter, row) => {
  return (
    row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
  );
};

const filterMethod = {
  integer: filterNumbers,
  number: filterNumbers,
  string: filterStrings
};

type State = {
  filters: Object,
  showFilters: boolean
};

type Props = {
  data: { data: Array<Object>, schema: Object },
  height: number
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

  render(): ?React$Element<any> {
    const {
      data: { data, schema },
      height
    } = this.props;

    const { filters, showFilters } = this.state;

    const tableColumns = schema.fields.map(field => {
      return {
        Header: field.name,
        accessor: field.name,
        fixed: schema.primaryKey.indexOf(field.name) !== -1 && "left",
        filterMethod: (filter, row) => {
          return filterMethod[field.type](filters[field.name])(filter, row);
        },
        //If we don't have a filter defined for this field type, pass an empty div
        Filter:
          columnFilters[field.type] &&
          columnFilters[field.type](filters, field.name, newFilter => {
            this.setState({ filters: { ...filters, ...newFilter } }) || <div />;
          })
      };
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
        <BlueprintCSS />
      </div>
    );
  }
}

export default DataResourceTransformGrid;
