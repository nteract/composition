import * as React from "react";

export interface ConfigHeading {
  heading: string;
}

export const isHeading = (props: any): props is ConfigHeading =>
  "heading" in props;

export const Heading = ({ heading }: ConfigHeading) =>
  <h1>{heading}</h1>;

Heading.displayName = "Heading";
