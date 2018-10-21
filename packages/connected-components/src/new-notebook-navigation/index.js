// @flow

/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-tabindex: 0 */

/**
 * Plan:
 *
 * Create a 1-dimensional grid of new notebook types for clicking
 * to create new notebooks
 *
 * Create a listing of running notebooks
 * Showcase the directory navigator
 */

import * as React from "react";
import { connect } from "react-redux";
import type {
  AppState,
  KernelspecRecord,
  KernelspecProps
} from "@nteract/core";
import * as Immutable from "immutable";

import { default as Logo } from "./logos";


export type AvailableNotebook = {
  kernelspec: KernelspecRecord | KernelspecProps
};

export type AvailableNotebooks =
  | Immutable.List<AvailableNotebook>
  | Array<AvailableNotebook>;

type NewNotebookProps = AvailableNotebook & {
  href?: string,
  onClick?: (ks: KernelspecRecord | KernelspecProps) => void
}

export class NewNotebook extends React.Component<NewNotebookProps> {
  static defaultProps = {
    onClick: () => {}
  }

  handleClick = () => {
    this.props.onClick(this.props.kernelspec);
  }

  render() {
    return (
      <React.Fragment>
        <div tabIndex={0} className="new-notebook" onClick={this.handleClick}>
          <div className="logo-box">
            <div className="logo">
              <Logo language={this.props.kernelspec.language} />
            </div>
          </div>
          <div className="text-box">
            <p className="display-name-short" title={this.props.kernelspec.language}>
              {this.props.kernelspec.language}
            </p>
            <p className="display-name-long" title={this.props.kernelspec.displayName}>
              {this.props.kernelspec.displayName}
            </p>
          </div>
        </div>
        <style jsx>{`
          .new-notebook :global(*) {
            color: var(--nt-color-midnight-light);
            cursor: pointer;
          }
  
          a {
            padding-top: 20px;
          }
  
          .new-notebook {
            font-family: var(--nt-font-family-normal);
            color: var(--nt-color-midnight-light);
            margin: 20px 20px 0 0;
            flex: 0 0 auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            height: 150px;
            width: 100px;
          }
  
          .new-notebook:hover {
            box-shadow: var(--theme-primary-shadow-hover);
          }
  
          .new-notebook:focus {
            box-shadow: var(--theme-primary-shadow-focus);
          }
          .logo {
            width: 2em;
            box-sizing: border-box;
            margin: 0 auto;
          }
  
          .logo-box {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 30px;
            background-color: var(--theme-app-bg);
            flex: 1;
          }
  
          .text-box {
            padding: 8px 6px 8px 6px;
            font-size: 0.8em;
            width: 100px;
            box-sizing: border-box;
            background-color: var(--theme-primary-bg);
            border-top: 1px solid var(--theme-app-border);
          }
  
          .display-name-short {
            text-transform: capitalize;
            margin: 0 5px 0 0;
            font-weight: 600;
            color: var(--theme-app-fg);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
  
          .display-name-long {
            margin: 0;
            color: var(--theme-primary-fg);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
  
          .new-notebook:hover .display-name-long,
          .new-notebook:focus .display-name-long {
            white-space: initial;
            overflow: initial;
            text-overflow: initial;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

const NotebookCollection = (props: { children: React.Node }) => (
  <div className="collection">
    {props.children}
    <style jsx>{`
      .collection {
        padding: 0 0 20px 0;
        box-sizing: border-box;
        min-width: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        -webkit-overflow-scrolling: touch;
        -ms-overflow-style: -ms-autohiding-scrollbar;
      }
    `}</style>
  </div>
);

export const PureNewNotebookNavigation = (props: {
  availableNotebooks: AvailableNotebooks,
  onClick?: (ks: KernelspecRecord | KernelspecProps) => void
}) => (
  <React.Fragment>
    <div className="banner">
      <div>Start a new notebook</div>
      <NotebookCollection>
        {props.availableNotebooks.map(an => (
          <NewNotebook
            kernelspec={an.kernelspec}
            key={an.kernelspec.name}
            onClick={props.onClick}
          />
        ))}
      </NotebookCollection>
    </div>
    <style jsx>{`
      .banner {
        background-color: var(--nt-color-grey-light);
        color: var(--nt-color-midnight);

        box-sizing: border-box;

        width: 100vw;
        padding-top: 20px;
        padding-left: 20px;
      }
    `}</style>
  </React.Fragment>
);

const mapStateToProps = (state: AppState) => {
  const availableKernels = state.core.entities.kernelspecs.byRef
    .flatMap(kss => {
      return kss.byName.map(ks => {
        return { kernelspec: ks };
      });
    })
    .sort((a, b) => {
      const langCompare = a.kernelspec.language.localeCompare(
        b.kernelspec.language
      );
      const displayCompare = a.kernelspec.displayName.localeCompare(
        b.kernelspec.displayName
      );

      // Effectively, group by language then sort by display name within
      let comparison = langCompare > 0 ? displayCompare : langCompare;

      return comparison;
    })
    .toList();

  return {
    availableNotebooks: availableKernels
  };
};

const mapDispatchToProps = () => ({});

export const NewNotebookNavigation = connect(
  mapStateToProps,
  mapDispatchToProps
)(PureNewNotebookNavigation);

export default NewNotebookNavigation;
