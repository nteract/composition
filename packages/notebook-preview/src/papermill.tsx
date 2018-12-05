import * as React from "react";

type PapermillMetadata = {
  status?: "pending" | "running" | "completed";
  // TODO: Acknowledge / use other papermill metadata
};

export const PapermillView = (props: PapermillMetadata) => {
  if (!props.status) {
    return null;
  }

  if (props.status === "running") {
    return (
      <React.Fragment>
        <div className="papermill">Executing with Papermill...</div>
        <style jsx>{`
          .papermill {
            width: 100%;
            background-color: #e8f2ff;
            padding-left: 10px;
            padding-top: 1em;
            padding-bottom: 1em;
            padding-right: 0;
            margin-right: 0;
            box-sizing: border-box;
          }
        `}</style>
      </React.Fragment>
    );
  }
  return null;
};
