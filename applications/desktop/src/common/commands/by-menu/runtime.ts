import { actions, createKernelRef } from "@nteract/core";
import { DesktopCommand, RequiresContent, RequiresKernelSpec } from "../types";
import { currentDocumentDirectory } from "../utils/directories";

export const KillKernel: DesktopCommand<RequiresContent> = {
  name: "KillKernel",
  *makeActionTemplates() {
    yield actions.killKernel.with({ restarting: false });
  },
};

export const InterruptKernel: DesktopCommand<RequiresContent> = {
  name: "InterruptKernel",
  *makeActionTemplates() {
    yield actions.interruptKernel;
  },
};

export const RestartKernel: DesktopCommand<RequiresContent> = {
  name: "RestartKernel",
  *makeActionTemplates() {
    yield actions.restartKernel.with({ outputHandling: "None" });
  },
};

export const RestartAndClearAll: DesktopCommand<RequiresContent> = {
  name: "RestartAndClearAll",
  *makeActionTemplates() {
    yield actions.restartKernel.with({ outputHandling: "Clear All" });
  },
};

export const RestartAndRunAll: DesktopCommand<RequiresContent> = {
  name: "RestartAsRunAll",
  *makeActionTemplates() {
    yield actions.restartKernel.with({ outputHandling: "Run All" });
  },
};

export const NewKernel: DesktopCommand<RequiresContent & RequiresKernelSpec> = {
  name: "NewKernel",
  *makeActionTemplates(store, { contentRef }) {
    yield actions.launchKernel.with({
      cwd: currentDocumentDirectory(store, contentRef),
      kernelRef: createKernelRef(),
      selectNextKernel: true,
    });
  },
};
