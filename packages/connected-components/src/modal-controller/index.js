// @flow
import * as React from "react";
import { connect } from "react-redux";
import { selectors } from "@nteract/core";

import { MODAL_TYPES } from "./constants";
import AboutModal from "./about-modal";

class ModalController extends React.Component<*, *> {
  getModal = () => {
    const { modalType } = this.props;
    switch (modalType) {
      case MODAL_TYPES.ABOUT:
        return AboutModal;
      default:
        return null;
    }
  };
  render() {
    const Modal = this.getModal();
    // $FlowFixMe
    return Modal ? <Modal /> : null;
  }
}

const mapStateToProps = (state: Object) => ({
  modalType: selectors.modalType(state)
});

export { MODAL_TYPES };

export default connect(mapStateToProps)(ModalController);
