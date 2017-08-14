import { Notebook } from "../components/notebook";

export default props => {
  if (props.contents) {
    const contents = props.contents;
    switch (contents.type) {
      case "notebook":
        return <Notebook content={contents.content} />;
      default:
        return (
          <pre>
            {JSON.stringify(contents, null, 2)}
          </pre>
        );
    }
  }
};
