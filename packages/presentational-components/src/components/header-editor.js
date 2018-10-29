// @flow
import * as React from "react";
import {
  H1,
  Tag,
  EditableText,
  Button,
  Position,
  Tooltip
} from "@blueprintjs/core";
import { blueprintCSS } from "@nteract/styled-blueprintjsx";

// https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json#L67

const tagStyle = {
  marginRight: "5px",
  color: "#0366d6",
  background: "#f1f8ff"
};

const authorStyle = {
  marginRight: "5px",
  fontStyle: "italic",
  background: "#E5E5E5"
};

const authorStyleBlack = { ...authorStyle, color: "black" };

export type AuthorObject = {
  name: string
};
export type HeaderDataProps = {
  authors: Array<AuthorObject>,
  title: string,
  description: string,
  tags: Array<string>
};

export type HeaderEditorProps = {
  headerData: HeaderDataProps,
  editable: boolean,
  onChange: HeaderDataProps => void,
  theme: "light" | "dark"
};

export type HeaderEditorState = {
  editMode: "none" | "author" | "tag"
};

const addTagMessage = <span>Add a tag</span>;
const addAuthorMessage = <span>Add an author</span>;

export class HeaderEditor extends React.Component<
  HeaderEditorProps,
  HeaderEditorState
> {
  constructor(props: HeaderEditorProps) {
    super(props);

    this.state = {
      editMode: "none"
    };
  }
  static defaultProps = {
    editable: true,
    theme: "light",
    headerData: {
      authors: [],
      title: "",
      description: "",
      tags: []
    },
    onChange: () => {}
  };

  handleTitleChange = (newText: string) => {
    this.props.onChange({
      ...this.props.headerData,
      title: newText
    });
  }

  handleDescriptionChange = (newText: string) => {
    this.props.onChange({
      ...this.props.headerData,
      description: newText
    });
  }

  handleAuthorAdd = (e: string) => {
    const {onChange, headerData} = this.props;

    onChange({
      ...headerData,
      authors: [...headerData.authors, { name: e }]
    });
    this.handleCancel();
  }

  handleTagAdd = (e: string) => {
    const {onChange, headerData} = this.props;

    onChange({
      ...headerData,
      tags: [...headerData.tags, e]
    });
    this.handleCancel();
  }

  handleAddAuthorClick = () => this.setState({ editMode: "author" })

  handleAddTagClick = () => this.setState({ editMode: "tag" })

  handleCancel = () => this.setState({ editMode: "none" })

  handleTagRemove = (event: Event, {value}: {value: string}) => {
    const {onChange, headerData} = this.props;

    onChange({
      ...headerData,
      tags: headerData.tags.filter(p => p !== value)
    });
  }

  handleAuthorRemove = (event: Event, {value}: {value: AuthorObject}) => {
    const {onChange, headerData} = this.props;

    onChange({
      ...headerData,
      authors: headerData.authors.filter(p => p.name !== value.name)
    });
  }

  render() {
    // Otherwise assume they have their own editor component
    const { editable, headerData } = this.props;
    return (
      <header>
        <div style={{ background: "#EEE", padding: "10px" }}>
          <H1>
            <EditableText
              value={headerData.title}
              placeholder="Edit title..."
              disabled={!editable}
              onChange={this.handleTitleChange}
            />
          </H1>
          <div>
            {headerData.authors.length <= 0 ? null : "By "}
            {headerData.authors.map(t => (
              <Tag
                key={t.name}
                large={true}
                minimal={true}
                style={authorStyle}
                onRemove={editable ? this.handleAuthorRemove : null}
              >
                {t.name}
              </Tag>
            ))}
            {(this.state.editMode === "author" && (
              <Tag style={authorStyleBlack}>
                <EditableText
                  maxLength={40}
                  className="author-entry"
                  placeholder="Enter Author Name..."
                  selectAllOnFocus={true}
                  onConfirm={this.handleAuthorAdd}
                  onCancel={this.handleCancel}
                />
              </Tag>
            )) || (
              <Tooltip
                content={addAuthorMessage}
                position={Position.RIGHT}
                usePortal={false}
                disabled={!editable}
              >
                <Button
                  icon="add"
                  className="author-button"
                  onClick={this.handleAddAuthorClick}
                  minimal={true}
                  disabled={!editable}
                />
              </Tooltip>
            )}
          </div>

          <div>
            {headerData.tags.map(t => (
              <Tag
                key={t}
                style={tagStyle}
                value={t}
                onRemove={editable ? this.handleTagRemove : null}
              >
                {t}
              </Tag>
            ))}
            {(this.state.editMode === "tag" && (
              <Tag style={tagStyle}>
                <EditableText
                  maxLength={20}
                  placeholder="Enter Tag Name..."
                  selectAllOnFocus={true}
                  onConfirm={this.handleTagAdd}
                  onCancel={this.handleCancel}
                />
              </Tag>
            )) || (
              <Tooltip
                content={addTagMessage}
                position={Position.RIGHT}
                usePortal={false}
                disabled={!editable}
              >
                {
                  <Button
                    icon="add"
                    minimal={true}
                    onClick={this.handleAddTagClick}
                    disabled={!editable}
                  />
                }
              </Tooltip>
            )}
          </div>
          <div style={{ marginTop: "10px" }}>
            <EditableText
              maxLength={280}
              maxLines={12}
              minLines={3}
              multiline={true}
              placeholder="Edit description..."
              selectAllOnFocus={false}
              value={headerData.description}
              disabled={!editable}
              onChange={this.handleDescriptionChange}
            />
          </div>
        </div>
        <style jsx>{blueprintCSS}</style>
      </header>
    );
  }
}
