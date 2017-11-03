import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import Inputs from "../src/components/cell/inputs";

storiesOf("InputCounter", module)
  .add("running", () => <Inputs running />)
  .add("no execution yet", () => <Inputs />)
  .add("execution #10", () => <Inputs executionCount={10} />);
