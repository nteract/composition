// @flow
import * as React from "react";

import { areComponentsEqual } from "react-hot-loader";

type NavSectionProps = {
  children: React.ChildrenArray<null | string | number | React.Element<any>>
};

export class NavSection extends React.Component<NavSectionProps, null> {
  render() {
    return (
      <ul>
        {React.Children.map(this.props.children, child => {
          if (child === null) {
            return null;
          }
          return <li className="nav-item">{child}</li>;
        })}
        <style jsx>{`
          ul {
            margin: 0 auto;
            padding: 0px 0px;
            display: flex;
            justify-content: space-between;
          }
          li {
            display: flex;
            padding: 0px 0px;
            margin: 0px var(--nt-spacing-xl) 0px 0px;
          }
        `}</style>
      </ul>
    );
  }
}

type NavProps = {
  children: React.ChildrenArray<React.Element<any>>
};

export class Nav extends React.Component<NavProps, null> {
  render() {
    return (
      <header className="nteract-nav">
        <ul>
          {React.Children.map(this.props.children, child => {
            return <li className="top-nav-item">{child}</li>;
          })}
        </ul>

        <style jsx>{`
          header {
            background-color: var(--theme-title-bar-bg, rgb(250, 250, 250));
            padding: var(--nt-spacing-m) var(--nt-spacing-xl);
            box-sizing: border-box;
          }

          /** When we have a nav section that ends up on the right, reverse the padding order **/
          .top-nav-item:not(:first-child):last-child > :global(ul > li) {
            margin: 0px 0px 0px var(--nt-spacing-xl);
          }

          ul {
            display: flex;
            justify-content: space-between;
            padding: 0px 0px;
            margin: 0 auto;
          }
          header > ul {
          }
          li {
            display: flex;
            box-sizing: border-box;
            padding: 0px 0px;
          }
        `}</style>
      </header>
    );
  }
}

export default Nav;
