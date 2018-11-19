// @flow

import * as React from "react";

// Built from `@nteract/styles`
// When a change happens within `@nteract/styles`, we need to re-generate this
const styles = `
:root {
  --nt-color-alabaster-darkest: var(--nt-color-alabaster-darker);
  --nt-color-alabaster-darker: var(--nt-color-alabaster-dark);
  --nt-color-alabaster-dark: var(--nt-color-alabaster);
  --nt-color-alabaster: hsl(0, 0%, 97%);
  --nt-color-alabaster-light: var(--nt-color-alabaster);
  --nt-color-alabaster-lighter: var(--nt-color-alabaster-light);
  --nt-color-alabaster-lightest: var(--nt-color-alabaster-lighter);
  --nt-color-asparagus-darkest: var(--nt-color-asparagus-darker);
  --nt-color-asparagus-darker: var(--nt-color-asparagus-dark);
  --nt-color-asparagus-dark: hsl(91, 28%, 37%);
  --nt-color-asparagus: hsl(91, 28%, 55%);
  --nt-color-asparagus-light: hsl(91, 28%, 73%);
  --nt-color-asparagus-lighter: hsl(91, 28%, 88%);
  --nt-color-asparagus-lightest: hsl(91, 28%, 98%);
  --nt-color-danube-darkest: var(--nt-color-danube-darker);
  --nt-color-danube-darker: var(--nt-color-danube-dark);
  --nt-color-danube-dark: hsl(208, 54%, 35%);
  --nt-color-danube: hsl(208, 54%, 53%);
  --nt-color-danube-light: hsl(208, 54%, 71%);
  --nt-color-danube-lighter: hsl(208, 54%, 86%);
  --nt-color-danube-lightest: hsl(208, 54%, 98%);
  --nt-color-gold-darkest: var(--nt-color-gold-darker);
  --nt-color-gold-darker: var(--nt-color-gold-dark);
  --nt-color-gold-dark: hsl(41, 89%, 35%);
  --nt-color-gold: hsl(41, 89%, 53%);
  --nt-color-gold-light: hsl(41, 89%, 71%);
  --nt-color-gold-lighter: hsl(41, 89%, 86%);
  --nt-color-gold-lightest: hsl(41, 89%, 98%);
  --nt-color-nteract-darkest: var(--nt-color-nteract-darker);
  --nt-color-nteract-darker: var(--nt-color-nteract-dark);
  --nt-color-nteract-dark: var(--nt-color-nteract);
  --nt-color-nteract: #8518f2;
  --nt-color-nteract-light: #af8afa;
  --nt-color-nteract-lighter: #ccb3ff;
  --nt-color-nteract-lightest: var(--nt-color-nteract-lighter);
  --nt-color-red-darkest: var(--nt-color-red-darker);
  --nt-color-red-darker: var(--nt-color-red-dark);
  --nt-color-red-dark: hsl(0, 67%, 25%);
  --nt-color-red: hsl(0, 67%, 43%);
  --nt-color-red-light: hsl(0, 67%, 61%);
  --nt-color-red-lighter: hsl(0, 67%, 76%);
  --nt-color-red-lightest: hsl(0, 67%, 88%);
  --nt-color-grey-darkest: hsl(0, 0%, 10%);
  --nt-color-grey-darker: hsl(0, 0%, 17%);
  --nt-color-grey-dark: hsl(0, 0%, 40%);
  --nt-color-grey: hsl(0, 0%, 63%);
  --nt-color-grey-light: hsl(0, 0%, 90%);
  --nt-color-grey-lighter: hsl(0, 0%, 94%);
  --nt-color-grey-lightest: hsl(0, 0%, 98%);
  --nt-color-midnight-darkest: hsl(0, 0%, 0%);
  --nt-color-midnight-darker: hsl(0, 0%, 5%);
  --nt-color-midnight-dark: hsl(0, 0%, 10%);
  --nt-color-midnight: hsl(0, 0%, 15%);
  --nt-color-midnight-light: hsl(0, 0%, 51%);
  --nt-color-midnight-lighter: hsl(0, 0%, 75%);
  --nt-color-midnight-lightest: hsl(0, 0%, 85%);
  --nt-color-sky-darkest: var(--nt-color-sky-darker);
  --nt-color-sky-darker: var(--nt-color-sky-dark);
  --nt-color-sky-dark: hsl(208, 54%, 35%);
  --nt-color-sky: hsl(208, 54%, 53%);
  --nt-color-sky-light: hsl(208, 54%, 71%);
  --nt-color-sky-lighter: hsl(208, 54%, 86%);
  --nt-color-sky-lightest: hsl(208, 54%, 98%);
  --nt-color-slate-darkest: var(--nt-color-slate-darker);
  --nt-color-slate-darker: var(--nt-color-slate-dark);
  --nt-color-slate-dark: hsl(207, 29%, 14%);
  --nt-color-slate: hsl(207, 29%, 32%);
  --nt-color-slate-light: hsl(207, 29%, 50%);
  --nt-color-slate-lighter: hsl(207, 29%, 65%);
  --nt-color-slate-lightest: hsl(207, 29%, 77%);
  --nt-color-clementine-darkest: var(--nt-color-clementine-darker);
  --nt-color-clementine-darker: var(--nt-color-clementine-dark);
  --nt-color-clementine-dark: hsl(33, 75%, 34%);
  --nt-color-clementine: hsl(33, 75%, 52%);
  --nt-color-clementine-light: hsl(33, 75%, 70%);
  --nt-color-clementine-lighter: hsl(33, 75%, 85%);
  --nt-color-clementine-lightest: hsl(33, 75%, 97%);
  --nt-border-radius-none: 0;
  --nt-border-radius-s: 1px;
  --nt-border-radius-m: 2px;
  --nt-border-radius-l: 4px;
  --nt-border-width-none: 0;
  --nt-border-width-xs: 1px;
  --nt-border-width-s: 2px;
  --nt-border-width-m: 3px;
  --nt-border-width-l: 5px;
  --nt-font-size-none: 0;
  --nt-font-size-xxs: 10px;
  --nt-font-size-xs: 10px;
  --nt-font-size-s: 12px;
  --nt-font-size-m: 14px;
  --nt-font-size-l: 20px;
  --nt-font-size-xl: 25px;
  --nt-font-size-xxl: 30px;
  --nt-font-weight-light: 300;
  --nt-font-weight-normal: 400;
  --nt-font-weight-bold: 600;
  --nt-font-weight-bolder: 700;
  --nt-font-family-normal: 'Source Sans Pro', sans-serif;
  --nt-font-family-mono: 'Source Code Pro', courier;
  --nt-opacity-disabled: 0.4;
  --nt-opacity-faded: 0.3;
  --nt-spacing-none: 0;
  --nt-spacing-xxs: 1px;
  --nt-spacing-xs: 3px;
  --nt-spacing-s: 5px;
  --nt-spacing-m: 10px;
  --nt-spacing-l: 15px;
  --nt-spacing-xl: 20px;
  --nt-spacing-xxl: 25px;
  --nt-transition-duration-normal: 250ms;
  --nt-z-index-menu: 100;
  --nt-z-index-notification: 200;
  --nt-z-index-modal: 300;
  --nt-color-actionable-darkest: var(--nt-color-danube-darkest);
  --nt-color-actionable-darker: var(--nt-color-danube-darker);
  --nt-color-actionable-dark: var(--nt-color-danube-dark);
  --nt-color-actionable: var(--nt-color-danube);
  --nt-color-actionable-light: var(--nt-color-danube-light);
  --nt-color-actionable-lighter: var(--nt-color-danube-lighter);
  --nt-color-actionable-lightest: var(--nt-color-danube-lightest);
  --nt-color-brand-darkest: var(--nt-color-nteract-darkest);
  --nt-color-brand-darker: var(--nt-color-nteract-darker);
  --nt-color-brand-dark: var(--nt-color-nteract-dark);
  --nt-color-brand: var(--nt-color-nteract);
  --nt-color-brand-light: var(--nt-color-nteract-light);
  --nt-color-brand-lighter: var(--nt-color-nteract-lighter);
  --nt-color-brand-lightest: var(--nt-color-nteract-lightest);
  --nt-color-danger-darkest: var(--nt-color-red-darkest);
  --nt-color-danger-darker: var(--nt-color-red-darker);
  --nt-color-danger-dark: var(--nt-color-red-dark);
  --nt-color-danger: var(--nt-color-red);
  --nt-color-danger-light: var(--nt-color-red-light);
  --nt-color-danger-lighter: var(--nt-color-red-lighter);
  --nt-color-danger-lightest: var(--nt-color-red-lightest);
  --nt-color-info-darkest: var(--nt-color-danube-darkest);
  --nt-color-info-darker: var(--nt-color-danube-darker);
  --nt-color-info-dark: var(--nt-color-danube-dark);
  --nt-color-info: var(--nt-color-danube);
  --nt-color-info-light: var(--nt-color-danube-light);
  --nt-color-info-lighter: var(--nt-color-danube-lighter);
  --nt-color-info-lightest: var(--nt-color-danube-lightest);
  --nt-color-nav-darkest: var(--nt-color-slate-darkest);
  --nt-color-nav-darker: var(--nt-color-slate-darker);
  --nt-color-nav-dark: var(--nt-color-slate-dark);
  --nt-color-nav: var(--nt-color-slate);
  --nt-color-nav-light: var(--nt-color-slate-light);
  --nt-color-nav-lighter: var(--nt-color-slate-lighter);
  --nt-color-nav-lightest: var(--nt-color-slate-lightest);
  --nt-color-selected-darkest: var(--nt-color-sky-darkest);
  --nt-color-selected-darker: var(--nt-color-sky-darker);
  --nt-color-selected-dark: var(--nt-color-sky-dark);
  --nt-color-selected: var(--nt-color-sky);
  --nt-color-selected-light: var(--nt-color-sky-light);
  --nt-color-selected-lighter: var(--nt-color-sky-lighter);
  --nt-color-selected-lightest: var(--nt-color-sky-lightest);
  --nt-color-success-darkest: var(--nt-color-asparagus-darkest);
  --nt-color-success-darker: var(--nt-color-asparagus-darker);
  --nt-color-success-dark: var(--nt-color-asparagus-dark);
  --nt-color-success: var(--nt-color-asparagus);
  --nt-color-success-light: var(--nt-color-asparagus-light);
  --nt-color-success-lighter: var(--nt-color-asparagus-lighter);
  --nt-color-success-lightest: var(--nt-color-asparagus-lightest);
  --nt-color-textcontrast-darkest: var(--nt-color-alabaster-darkest);
  --nt-color-textcontrast-darker: var(--nt-color-alabaster-darker);
  --nt-color-textcontrast-dark: var(--nt-color-alabaster-dark);
  --nt-color-textcontrast: var(--nt-color-alabaster);
  --nt-color-textcontrast-light: var(--nt-color-alabaster-light);
  --nt-color-textcontrast-lighter: var(--nt-color-alabaster-lighter);
  --nt-color-textcontrast-lightest: var(--nt-color-alabaster-lightest);
  --nt-color-text-darkest: var(--nt-color-midnight-darkest);
  --nt-color-text-darker: var(--nt-color-midnight-darker);
  --nt-color-text-dark: var(--nt-color-midnight-dark);
  --nt-color-text: var(--nt-color-midnight);
  --nt-color-text-light: var(--nt-color-midnight-light);
  --nt-color-text-lighter: var(--nt-color-midnight-lighter);
  --nt-color-text-lightest: var(--nt-color-midnight-lightest);
  --nt-color-warning-darkest: var(--nt-color-clementine-darkest);
  --nt-color-warning-darker: var(--nt-color-clementine-darker);
  --nt-color-warning-dark: var(--nt-color-clementine-dark);
  --nt-color-warning: var(--nt-color-clementine);
  --nt-color-warning-light: var(--nt-color-clementine-light);
  --nt-color-warning-lighter: var(--nt-color-clementine-lighter);
  --nt-color-warning-lightest: var(--nt-color-clementine-lightest);
}
`;

class CSSVariables extends React.Component<{ children: React.ReactNode[] }, null> {
  render() {
    return (
      <React.Fragment>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        {this.props.children}
      </React.Fragment>
    );
  }
}

const Styles = CSSVariables;

export { Styles, CSSVariables };
