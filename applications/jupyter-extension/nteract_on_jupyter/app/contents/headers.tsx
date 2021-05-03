import { H4 } from "@blueprintjs/core";
import * as actions from "@nteract/actions";
import { ContentRef } from "@nteract/core";
import { ErrorIcon, LoadingIcon, SavingIcon } from "./iron-icons";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import urljoin from "url-join";

import { EditableTitleOverlay } from "../components/editable-title-overlay";
import LastSaved from "../components/last-saved";
import { Nav, NavSection } from "../components/nav";
import { ThemedLogo } from "../components/themed-logo";

/* Returns a header for the Directory view, which only consists of the Nav. */
export interface DirectoryHeaderProps {
  appBase: string;
}

export const DirectoryHeader: React.SFC<DirectoryHeaderProps> = props => (
  <Nav>
    <NavSection>
      {props.appBase ? (
        <a href={urljoin(props.appBase)} role="button" title="Home">
          <ThemedLogo />
        </a>
      ) : null}
    </NavSection>
  </Nav>
);

/*
 * Returns a header for a Notebook/File/Dummy view, which consists of the Nav
 * and the NotebookMenu components.
 */
export interface FileHeaderProps {
  appBase: string;
  baseDir: string;
  changeContentName: (value: actions.ChangeContentName["payload"]) => {};
  contentRef: ContentRef;
  displayName: string;
  error?: object | null;
  loading: boolean;
  saving: boolean;
  children?: React.ReactNode;
}

export interface State {
  isDialogOpen: boolean;
}

class FileHeader extends React.PureComponent<FileHeaderProps, State> {
  static defaultProps: Partial<FileHeaderProps> = {
    children: null
  };

  constructor(props: FileHeaderProps) {
    super(props);

    this.state = {
      isDialogOpen: false
    };
  }

  // Determine the file handler
  getFileHandlerIcon = () => {
    return this.props.saving ? (
      <SavingIcon />
    ) : this.props.error ? (
      <ErrorIcon />
    ) : this.props.loading ? (
      <LoadingIcon />
    ) : (
      ""
    );
  };

  getFileExtension = (filename: string): string | null | undefined => {
    const dot = /[.]/.exec(filename);
    const ext = /[^.]+$/.exec(filename);

    return dot && ext ? ext[0] : undefined;
  };

  addFileExtension = (filename: string): string => {
    const { displayName } = this.props;
    const fileExtension = this.getFileExtension(filename);
    const prevFileExtension = this.getFileExtension(displayName);

    if (fileExtension) {
      return filename;
    } else if (prevFileExtension) {
      // Get file extension from props.displayName
      return `${filename}.${prevFileExtension}`;
    } else {
      // Assume `.ipynb` file
      return `${filename}.ipynb`;
    }
  };

  openDialog = (): void => this.setState({ isDialogOpen: true });
  closeDialog = (): void => this.setState({ isDialogOpen: false });

  // Handles onConfirm callback for EditableText component
  confirmTitle = (value: string): void => {
    if (value !== this.props.displayName) {
      this.props.changeContentName({
        contentRef: this.props.contentRef,
        filepath: `/${value ? this.addFileExtension(value) : ""}`,
        prevFilePath: `/${this.props.displayName}`
      });
    }

    this.setState({ isDialogOpen: false });
  };

  render(): JSX.Element {
    const themeLogoLink = urljoin(this.props.appBase, this.props.baseDir);
    const icon = this.getFileHandlerIcon();

    return (
      <React.Fragment>
        <Nav>
          <NavSection>
            <a href={themeLogoLink} role="button" title="Home">
              <ThemedLogo />
            </a>
            <div>
              <H4 style={{lineHeight:"72px", fontWeight: 400}} onClick={this.openDialog}>{this.props.displayName}</H4>
              <EditableTitleOverlay
                defaultValue={this.props.displayName}
                isOpen={this.state.isDialogOpen}
                onCancel={this.closeDialog}
                onSave={this.confirmTitle}
              />
            </div>
          </NavSection>
          <NavSection>
            <span className="icon">{icon}</span>
            <LastSaved contentRef={this.props.contentRef} />
          </NavSection>
        </Nav>
        {this.props.children}
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeContentName: (payload: actions.ChangeContentName["payload"]) =>
    dispatch(actions.changeContentName(payload))
});

export const ConnectedFileHeader = connect(
  null,
  mapDispatchToProps
)(FileHeader);

export default ConnectedFileHeader;
