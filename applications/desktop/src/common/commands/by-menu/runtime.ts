import { actions, createKernelRef } from "@nteract/core";
import { DesktopCommand, ReqContent, ReqKernelSpec } from "../types";
import { currentDocumentDirectory } from "../utils/directories";

export const KillKernel: DesktopCommand<ReqContent> = {
  name: "KillKernel",
  props: {
    contentRef: "required",
  },
  makeAction: actions.killKernel.with({ restarting: false }),
};

export const InterruptKernel: DesktopCommand<ReqContent> = {
  name: "InterruptKernel",
  props: {
    contentRef: "required",
  },
  makeAction: actions.interruptKernel,
};

export const RestartKernel: DesktopCommand<ReqContent> = {
  name: "RestartKernel",
  props: {
    contentRef: "required",
  },
  makeAction: actions.restartKernel.with({ outputHandling: "None" }),
};

export const RestartAndClearAll: DesktopCommand<ReqContent> = {
  name: "RestartAndClearAll",
  props: {
    contentRef: "required",
  },
  makeAction: actions.restartKernel.with({ outputHandling: "Clear All" }),
};

export const RestartAndRunAll: DesktopCommand<ReqContent> = {
  name: "RestartAndRunAll",
  props: {
    contentRef: "required",
  },
  makeAction: actions.restartKernel.with({ outputHandling: "Run All" }),
};

export const NewKernel: DesktopCommand<ReqContent & ReqKernelSpec> = {
  name: "NewKernel",
  props: {
    contentRef: "required",
    kernelSpec: "required",
  },
  *makeActions(store, props) {
    yield actions.launchKernel({
      cwd: currentDocumentDirectory(store, props.contentRef),
      kernelRef: createKernelRef(),
      selectNextKernel: true,
      ...props,
    });
  },
};
