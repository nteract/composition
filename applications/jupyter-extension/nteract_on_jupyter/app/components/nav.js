/* @flow strict */
import * as React from "react";
import { NotebookMenu } from "@nteract/connected-components";
import type { ContentRef } from "@nteract/core";

type NavSectionProps = {
  children: React.Node
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

type StickyHeaderProps = {
  children: React.ChildrenArray<React.Element<*>>
}

export class StickyHeader extends React.Component<StickyHeaderProps, {}> {
  render() {
    return (
      <header>
        {this.props.children}
        <style jsx>{`
          header {
            top: 0;
            left: 0;
            width: 100%;
            // TODO: Need to remove this once header is in a separate div
            z-index: 2;
            display: var(--sticky-header-display, flex);
            flex-direction: var(--sticky-header-flex-direction, column);
            background-color: var(--theme-title-bar-bg, rgb(250, 250, 250));
            padding: var(--sticky-header-spacing-m, 0) var(--sticky-header-spacing-xl, 0);
            height: var(--sticky-header-height, 80px)
            box-sizing: border-box;
          }
        `}</style>
      </header>
    );
  }
}

type NavProps = {
  children: React.ChildrenArray<React.Element<*>>,
  contentRef: ContentRef
};

export class Nav extends React.Component<NavProps, null> {
  render() {
    return (
      <StickyHeader>
        <div className="nteract-nav">
          <ul>
            {React.Children.map(this.props.children, child => {
              return <li className="top-nav-item">{child}</li>;
            })}
          </ul>
        </div>
        <div>
          <NotebookMenu contentRef={this.props.contentRef} />
        </div>

        <style jsx>{`
          /** When we have a nav section that ends up on the right, reverse the padding order **/
          .top-nav-item:not(:first-child):last-child > :global(ul > li) {
            margin: 0px 0px 0px var(--nt-spacing-xl);
          }

          ul {
            display: flex;
            justify-content: space-between;
            padding: 10px 20px;
            margin: 0 auto;
            width: 100%;
          }
          header > ul {
          }
          li {
            display: flex;
            box-sizing: border-box;
            padding: 0px 0px;
          }
        `}</style>
      </StickyHeader>
    );
  }
}

export default Nav;
