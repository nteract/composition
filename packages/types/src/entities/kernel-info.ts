import { JSONType } from "@nteract/commutable";
import * as Immutable from "immutable";

export interface HelpLink {
  text: string;
  url: string;
}
export const makeHelpLinkRecord = Immutable.Record<HelpLink>({
  text: "",
  url: "#"
});
export type HelpLinkRecord = Immutable.RecordOf<HelpLink>;

//
// The kernel info object is determined by making a kernel_info_request to the
// kernel after it has been started
// Documentation comes from http://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-info
//
// We've adapted to both camelCase instead of snake_case here as well as flattened
// the structure. The original naming is labeled `SPEC`
//
export interface KernelInfo {
  // Version of the messaging protocol.
  // The first integer indicates major version.  It is incremented when
  // there is any backward incompatible change.
  // The second integer indicates minor version.  It is incremented when
  // there is any backward compatible change.
  // SPEC: protocol_version
  protocolVersion: string; // E.g. 1.2.3

  // The kernel implementation name
  // (e.g. 'ipython' for the IPython kernel)
  implementation: string;

  // Implementation version number.
  // The version number of the kernel's implementation
  // (e.g. IPython.__version__ for the IPython kernel)
  // SPEC: implementation_version
  implementationVersion: string;

  // A banner of information about the kernel,
  // which may be displayed in console environments.
  banner: string;

  // Optional: A list of dictionaries, each with keys 'text' and 'url'.
  // These can be displayed in the help menu for the UI.
  // NOTE: To make it easy to use the KernelInfo type as a plain object in
  //       actions, we allow this type to be an array of plain objects or the
  //       fully immutable variety
  // SPEC: help_links
  helpLinks?: HelpLink[] | Immutable.List<HelpLinkRecord>;

  // This section is all from the language_info object, flattened to the top
  // level here

  // Name of the programming language that the kernel implements.
  //  Kernel included in IPython returns 'python'.
  // SPEC: language_info.name
  languageName: string; // language_info.name on the spec

  // Language version number.
  // It is Python version number (e.g., '2.7.3') for the kernel
  // included in IPython.
  // SPEC: language_info.version
  languageVersion: string;

  // mimetype for script files in this language
  // SPEC: language_info.mimetype
  mimetype: string;

  // Extension including the dot, e.g. '.py'
  // SPEC: language_info.file_extension
  fileExtension: string;

  // Pygments lexer, for highlighting
  // Only needed if it differs from the 'name' field.
  // SPEC: language_info.pygments_lexer
  pygmentsLexer: string;

  // Codemirror mode, for for highlighting in the notebook.
  // Only needed if it differs from the 'name' field.
  // SPEC: language_info.codemirror_mode
  codemirrorMode?: string | object | Immutable.Map<string, JSONType>;

  // Nbconvert exporter, if notebooks written with this kernel should
  // be exported with something other than the general 'script'
  // exporter.
  // SPEC: language_info.nbconvert_exporter
  nbconvertExporter: string;
}

export type KernelInfoRecord = Immutable.RecordOf<KernelInfo>;

// NOTE: This is not exported as the "makeXRecord" for KernelInfo so that we
//       don't have nullables and can rely on the proper types. The developer is
//       required to pass a fully instantiated KernelInfo into
//       makeKernelInfoRecord below.
const kernelInfoRecordMaker = Immutable.Record<KernelInfo>({
  protocolVersion: "0.0.0", // E.g. 1.2.3
  implementation: "",
  implementationVersion: "",
  banner: "",
  helpLinks: Immutable.List(),
  languageName: "",
  languageVersion: "",
  mimetype: "",
  fileExtension: "",
  pygmentsLexer: "",
  codemirrorMode: "text/plain",
  nbconvertExporter: ""
});

export function makeKernelInfoRecord(kernelInfo: KernelInfo): KernelInfoRecord {
  return kernelInfoRecordMaker(kernelInfo);
}
