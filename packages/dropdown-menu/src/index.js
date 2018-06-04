// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

// react-hot-loader uses proxies to the original elements so we need to use
// their comparison function in case a consumer of these components is
// using hot module reloading
import { areComponentsEqual } from "react-hot-loader";
import * as React from "react";

import { DropdownMenu } from "./components/dropdown-menu";
import { DropdownTrigger } from "./components/dropdown-trigger";
import { DropdownContent } from "./components/dropdown-content";

export { DropdownMenu, DropdownTrigger, DropdownContent };
