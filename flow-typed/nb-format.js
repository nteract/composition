declare type KernelSpec = {
  name: string,
  files?: Array<string>,
  resourcesDir?: string,
  spec: {
    argv: Array<string>,
    display_name: string,
    language: string,
    env: { [key: string]: string }
  }
};

declare type KernelSpecs = {
  [key: string]: KernelSpec
};

declare type NotebookTypes = "unknown" | "directory" | "notebook" | "file";
