// @flow
import * as React from "react";
import { MODAL_TYPES } from "./constants";
import AboutModal from "./about-modal";
import { connect } from "react-redux";
import { selectors } from "@nteract/core";

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
    return Modal ? <Modal /> : null;
  }
}

import type { MapStateToProps } from "react-redux";

const mapStateToProps: MapStateToProps<*, *, *> = (state: *) => ({
  modalType: selectors.modalType(state)
});

export { MODAL_TYPES };

export default connect(mapStateToProps)(ModalController);
