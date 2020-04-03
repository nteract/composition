import { of } from "rxjs";
import { configuration, ConfigurationBackend, setConfigAtKey } from "../src";
import { loadConfig } from "../src/myths/load-config";
import { mergeConfig } from "../src/myths/merge-config";
import { saveConfig } from "../src/myths/save-config";
import { setConfigBackend } from "../src/myths/set-config-backend";

const backend: ConfigurationBackend = {
  setup: () => of(loadConfig.create()),
  load: () => of(mergeConfig.create({ pets: "🐈🐈🐈🐕" })),
  save: jest.fn(),
};

describe("configuration", () => {
  test("calls the backend appropriately", () => {
    configuration.testMarbles(
      "abcd|",
      "ABC-|",
      {
        a: setConfigBackend.create(backend),
        b: setConfigAtKey.create({
          key: "catNames",
          value: ["Diamond", "Sapphire", "Onyx"],
        }),
        c: loadConfig.create(),
        d: saveConfig.create(),

        A: loadConfig.create(),
        B: saveConfig.create(),
        C: mergeConfig.create({ pets: "🐈🐈🐈🐕" }),
      },
      {
        backend,
        current: null,
      },
    );

    expect(backend.save).toBeCalledTimes(1);
  });
});
