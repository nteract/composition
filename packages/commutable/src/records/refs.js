// @flow

import uuid from "uuid";

export opaque type CellRef: string = string;
export const createCellRef = (): CellRef => uuid.v4();

export opaque type OutputRef: string = string;
export const createOutputRef = (): OutputRef => uuid.v4();
