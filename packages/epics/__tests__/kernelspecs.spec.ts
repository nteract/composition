import { fetchKernelspecs } from "@nteract/actions";
import { of } from "rxjs";
import { toArray } from "rxjs/operators";
import { fetchKernelspecsEpic } from "../src/kernelspecs";

describe("fetchKernelspecsEpic", () => {
  test("calls kernelspecs.list with appropriate jupyter host config", done => {
    const action = fetchKernelspecs({
      kernelspecsRef: "fake",
      hostRef: "alsoFake"
    });
    const action$ = of(action);
    const state$ = {
      value: {
        app: {
          host: {
            type: "jupyter",
            kernelRef: null,
            id: null,
            selectedKernelRef: null,
            kernelspecsRef: null,
            defaultKernelName: null,
            activeKernelRefs: [],
            token: "x-x-x",
            serverUrl: "http://localhost:8888/",
            crossDomain: false
          }
        }
      }
    };

    const output$ = fetchKernelspecsEpic(action$, state$);
    output$.pipe(toArray()).subscribe(
      actions => {
        // Note that the epic has transformed the raw response into the shape
        // our state needs.
        expect(actions.length).toBe(1);
        expect(actions[0].type).toBe("CORE/FETCH_KERNELSPECS_FULFILLED");
        expect(actions[0].payload).toEqual({
          defaultKernelName: "python3",
          kernelspecs: {
            nteract: {
              argv: [
                "/Users/dtrump/venvs/nteract/bin/python",
                "-m",
                "ipykernel_launcher",
                "-f",
                "{connection_file}"
              ],
              displayName: "Python 3 (nteract)",
              env: {},
              interruptMode: "signal",
              language: "python",
              metadata: {},
              name: "nteract",
              resources: {
                "logo-32x32": "/kernelspecs/nteract/logo-32x32.png",
                "logo-64x64": "/kernelspecs/nteract/logo-64x64.png"
              }
            },
            python3: {
              argv: [
                "python",
                "-m",
                "ipykernel_launcher",
                "-f",
                "{connection_file}"
              ],
              displayName: "Python 3",
              env: {},
              interruptMode: "signal",
              language: "python",
              metadata: {},
              name: "python3",
              resources: {
                "logo-32x32": "/kernelspecs/python3/logo-32x32.png",
                "logo-64x64": "/kernelspecs/python3/logo-64x64.png"
              }
            }
          },
          kernelspecsRef: "fake",
          hostRef: "alsoFake"
        });
        done();
      },
      err => done.fail(err)
    );
  });
});
