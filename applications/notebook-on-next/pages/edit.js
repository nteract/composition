// @flow
import React from "react";
import { Notebook } from "@nteract/core/components";
import configureStore from "../store";
import withRedux from "next-redux-wrapper";

const store = () => configureStore({});

export default withRedux(store, null)(Notebook);
