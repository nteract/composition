// Extends the DefinitelyTyped definitions with properties needed by test-shim.ts

// Merges with definitions in @types/node
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces

declare namespace NodeJS {
  interface Image {
    prototype: HTMLImageElement;
    new (): HTMLImageElement;
  }

  interface Global {
    $: JQueryStatic;
    jQuery: JQueryStatic;
    Image: Image;
    Range: () => void;
    Blob: (content: any[], options: object) => Blob;

    window: {
      document: {
        // Codemirror Hack Polyfill
        createRange: () => any;
      };
      focus: () => void;
      Image: Image;
      URL: {
        prototype: URL;
        new (): URL;
        createObjectURL: () => void;
      };
    };
  }
}
