// @flow

// We need to allow to allow escape from the modal from an inner element.
/* eslint jsx-a11y/no-noninteractive-tabindex: 0 */

// TODO: we can remove this if we knew an appropriate role for the modal shadow.
// We want to allow the user to click on the modal-backdrop to escape.
/* eslint jsx-a11y/no-static-element-interactions: 0 */

import React from "react";
import { connect } from "react-redux";
import { actions, selectors } from "@nteract/core";

import { modalCss } from "./styles";

type Props = {
  appVersion?: string,
  hostType?: string,
  closeModal: ?() => void
};

// We need to do this so that you can immediately `Escape` out of the dialog.
// Otherwise, we'd need to (a) put an event listener on the document or (b)
// require that the user clicks the content first before attempting to escape.
const focusOnRender = el => el && el.focus();

class PureAboutModal extends React.Component<Props> {
  handleKeyDown = (event: KeyboardEvent) => {
    const { closeModal } = this.props;
    const { key, metaKey, altKey, ctrlKey, repeat, shiftKey } = event;
    if (
      key === "Escape" &&
      !(metaKey || altKey || ctrlKey || repeat || shiftKey) &&
      closeModal
    ) {
      closeModal();
    }
  };
  handleOverlayClick = (event: Event) => {
    const { closeModal } = this.props;
    if (closeModal && event.target && event.target === event.currentTarget) {
      closeModal();
    }
  };
  render() {
    const { appVersion, hostType } = this.props;
    return (
      <div>
        <div
          className="modal--overlay"
          onClick={this.handleOverlayClick}
          onKeyDown={this.handleKeyDown}
          tabIndex={-1}
        >
          <dialog tabIndex={0} className="modal--content" ref={focusOnRender}>
            <div className="modal--content--header">
              <h2>About nteract on Jupyter</h2>
              <p>You are using an nteract-rendered notebook on Jupyter.</p>
            </div>
            <div className="modal--content--body">
              <p>
                <span className="modal--content--body--field">Version:</span>
                <span className="modal--content--body--value">
                  {appVersion}
                </span>
              </p>
              <p>
                <span className="modal--content--body--field">Host Type:</span>
                <span className="modal--content--body--value">{hostType}</span>
              </p>
            </div>
          </dialog>
        </div>
        <style jsx>{modalCss}</style>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  appVersion: selectors.appVersion(state),
  hostType: selectors.currentHostType(state)
});

const mapDispatchToProps = {
  closeModal: actions.closeModal
};

const AboutModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(PureAboutModal);

// We export this for testing purposes.
export { PureAboutModal };

export default AboutModal;
