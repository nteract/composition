// @flow
import * as React from "react";

type Props = {
  children: *
};

const Wrapper = (props: Props) => (
  <React.Fragment>
    {props.children}
    {/* prettier-ignore */}
    <style jsx global>{`
        .rc-menu {
          outline: none;
          margin: 0;
          padding-left: 0;
          list-style: none;
          border: 1px solid var(--theme-app-border);
          box-shadow: none;
          color: var(--theme-menu-fg);
        }
        .rc-menu-hidden {
          display: none;
        }
        .rc-menu-collapse {
          overflow: hidden;
        }
        .rc-menu-collapse-active {
          transition: height 0.3s ease-out;
        }
        .rc-menu-item-group-list {
          margin: 0;
          padding: 0;
        }
        .rc-menu-item-group-title {
          color: #999;
          line-height: 1.5;
          padding: 8px 10px;
          border-bottom: 1px solid #dedede;
        }
        .rc-menu-item-active,
        .rc-menu-submenu-active > .rc-menu-submenu-title {
          background-color: var(--theme-menu-bg-focus);
        }
        .rc-menu-item-selected {
          background-color: var(--theme-menu-bg-focus);
          transform: translateZ(0);
        }
        .rc-menu-submenu-selected {
          background-color: var(--theme-menu-bg-focus);
        }
        .rc-menu > li.rc-menu-submenu {
          padding: 0;
        }
        .rc-menu-horizontal.rc-menu-sub,
        .rc-menu-vertical.rc-menu-sub,
        .rc-menu-vertical-left.rc-menu-sub,
        .rc-menu-vertical-right.rc-menu-sub {
          min-width: 160px;
          margin-top: 0;
        }
        .rc-menu-item,
        .rc-menu-submenu-title {
          margin: 0;
          position: relative;
          display: block;
          padding: 7px 7px 7px 16px;
          white-space: nowrap;
          font-size: var(--nt-font-size-m);
          user-select: none;
        }
        .rc-menu-item.rc-menu-item-disabled,
        .rc-menu-submenu-title.rc-menu-item-disabled,
        .rc-menu-item.rc-menu-submenu-disabled,
        .rc-menu-submenu-title.rc-menu-submenu-disabled {
          color: #777 !important;
        }
        .rc-menu > .rc-menu-item-divider {
          height: 1px;
          margin: 1px 0;
          overflow: hidden;
          padding: 0;
          line-height: 0;
          background-color: #e5e5e5;
        }
        .rc-menu-submenu-popup {
          position: absolute;
        }
        .rc-menu-submenu > .rc-menu {
          background-color: var(--theme-menu-bg);
        }
        .rc-menu .rc-menu-submenu-title .anticon,
        .rc-menu .rc-menu-item .anticon {
          width: 14px;
          height: 14px;
          margin-right: 8px;
          top: -1px;
        }
        .rc-menu-submenu,
        .rc-menu-item,
        .rc-menu-submenu-title {
          /*
           * TODO: the app should be structured in such a way that a separate stacking
           * context is created and we don't need to battle it out for z-index in this
           * way...
        */
          z-index: 1000;
        }
        .rc-menu-horizontal {
          background-color: var(--theme-menu-bg);
          border: none;
          border-bottom: 1px solid var(--theme-app-border);
          box-shadow: none;
          padding: 0 var(--nt-spacing-xs);
        }
        .rc-menu-horizontal > .rc-menu-item,
        .rc-menu-horizontal > .rc-menu-submenu > .rc-menu-submenu-title {
          padding: 8px 15px;
        }
        .rc-menu-horizontal > .rc-menu-submenu,
        .rc-menu-horizontal > .rc-menu-item {
          float: left;
        }
        .rc-menu-horizontal > .rc-menu-submenu-active,
        .rc-menu-horizontal > .rc-menu-item-active {
          background-color: #f3f5f7;
        }
        .rc-menu-horizontal:after {
          content: "\\20";
          display: block;
          height: 0;
          clear: both;
        }
        .rc-menu-vertical,
        .rc-menu-vertical-left,
        .rc-menu-vertical-right,
        .rc-menu-inline {
          padding: 12px 0;
        }
        .rc-menu-vertical > .rc-menu-item,
        .rc-menu-vertical-left > .rc-menu-item,
        .rc-menu-vertical-right > .rc-menu-item,
        .rc-menu-inline > .rc-menu-item,
        .rc-menu-vertical > .rc-menu-submenu > .rc-menu-submenu-title,
        .rc-menu-vertical-left > .rc-menu-submenu > .rc-menu-submenu-title,
        .rc-menu-vertical-right > .rc-menu-submenu > .rc-menu-submenu-title,
        .rc-menu-inline > .rc-menu-submenu > .rc-menu-submenu-title {
          padding: 8px 40px 8px 10px;
        }
        .rc-menu-vertical .rc-menu-submenu-arrow,
        .rc-menu-vertical-left .rc-menu-submenu-arrow,
        .rc-menu-vertical-right .rc-menu-submenu-arrow,
        .rc-menu-inline .rc-menu-submenu-arrow {
          display: inline-block;
          font: normal normal normal 14px/1 FontAwesome;
          font-size: inherit;
          vertical-align: baseline;
          text-align: center;
          text-transform: none;
          text-rendering: auto;
          position: absolute;
          right: 16px;
          line-height: 1.5em;
        }
        .rc-menu-vertical .rc-menu-submenu-arrow:before,
        .rc-menu-vertical-left .rc-menu-submenu-arrow:before,
        .rc-menu-vertical-right .rc-menu-submenu-arrow:before,
        .rc-menu-inline .rc-menu-submenu-arrow:before {
          content: "\\f0da";
        }
        .rc-menu-inline .rc-menu-submenu-arrow {
          transform: rotate(90deg);
          transition: transform 0.3s;
        }
        .rc-menu-inline
          .rc-menu-submenu-open
          > .rc-menu-submenu-title
          .rc-menu-submenu-arrow {
          transform: rotate(-90deg);
        }
        .rc-menu-vertical.rc-menu-sub,
        .rc-menu-vertical-left.rc-menu-sub,
        .rc-menu-vertical-right.rc-menu-sub {
          padding: 0;
        }
        .rc-menu-sub.rc-menu-inline {
          padding: 0;
          border: none;
          border-radius: 0;
          box-shadow: none;
        }
        .rc-menu-sub.rc-menu-inline > .rc-menu-item,
        .rc-menu-sub.rc-menu-inline
          > .rc-menu-submenu
          > .rc-menu-submenu-title {
          padding-top: 8px;
          padding-bottom: 8px;
          padding-right: 0;
        }
        .rc-menu-open-slide-up-enter,
        .rc-menu-open-slide-up-appear {
          animation-duration: 0.3s;
          animation-fill-mode: both;
          transform-origin: 0 0;
          opacity: 0;
          animation-timing-function: cubic-bezier(0.08, 0.82, 0.17, 1);
          animation-play-state: paused;
        }
        .rc-menu-open-slide-up-leave {
          animation-duration: 0.3s;
          animation-fill-mode: both;
          transform-origin: 0 0;
          opacity: 1;
          animation-timing-function: cubic-bezier(0.6, 0.04, 0.98, 0.34);
          animation-play-state: paused;
        }
        .rc-menu-open-slide-up-enter.rc-menu-open-slide-up-enter-active,
        .rc-menu-open-slide-up-appear.rc-menu-open-slide-up-appear-active {
          animation-name: rcMenuOpenSlideUpIn;
          animation-play-state: running;
        }
        .rc-menu-open-slide-up-leave.rc-menu-open-slide-up-leave-active {
          animation-name: rcMenuOpenSlideUpOut;
          animation-play-state: running;
        }
        @keyframes rcMenuOpenSlideUpIn {
          0% {
            opacity: 0;
            transform-origin: 0% 0%;
            transform: scaleY(0);
          }
          100% {
            opacity: 1;
            transform-origin: 0% 0%;
            transform: scaleY(1);
          }
        }
        @keyframes rcMenuOpenSlideUpOut {
          0% {
            opacity: 1;
            transform-origin: 0% 0%;
            transform: scaleY(1);
          }
          100% {
            opacity: 0;
            transform-origin: 0% 0%;
            transform: scaleY(0);
          }
        }
        .rc-menu-open-zoom-enter,
        .rc-menu-open-zoom-appear {
          opacity: 0;
          animation-duration: 0.3s;
          animation-fill-mode: both;
          transform-origin: 0 0;
          animation-timing-function: cubic-bezier(0.08, 0.82, 0.17, 1);
          animation-play-state: paused;
        }
        .rc-menu-open-zoom-leave {
          animation-duration: 0.3s;
          animation-fill-mode: both;
          transform-origin: 0 0;
          animation-timing-function: cubic-bezier(0.6, 0.04, 0.98, 0.34);
          animation-play-state: paused;
        }
        .rc-menu-open-zoom-enter.rc-menu-open-zoom-enter-active,
        .rc-menu-open-zoom-appear.rc-menu-open-zoom-appear-active {
          animation-name: rcMenuOpenZoomIn;
          animation-play-state: running;
        }
        .rc-menu-open-zoom-leave.rc-menu-open-zoom-leave-active {
          animation-name: rcMenuOpenZoomOut;
          animation-play-state: running;
        }
        @keyframes rcMenuOpenZoomIn {
          0% {
            opacity: 0;
            transform: scale(0, 0);
          }
          100% {
            opacity: 1;
            transform: scale(1, 1);
          }
        }
        @keyframes rcMenuOpenZoomOut {
          0% {
            transform: scale(1, 1);
          }
          100% {
            opacity: 0;
            transform: scale(0, 0);
          }
        }
      `}
    </style>
  </React.Fragment>
);

export default Wrapper;
