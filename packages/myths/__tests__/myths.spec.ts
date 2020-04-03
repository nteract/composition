import { of } from "rxjs";
import { createMythicPackage, makeConfigureStore } from "../src";

describe("myths", () => {
  test("can create a mythic package and use it to alter state", () => {
    const iCanAdd = createMythicPackage("iCanAdd")<
      {
        sum: number;
      }
      >({
      initialState: {
        sum: 0,
      },
    });

    const addToSum =
      iCanAdd.createMyth("addToSum")<number>({
        reduce: (state, action) =>
          state.set("sum", state.get("sum") + action.payload),
      });

    const configureStore = makeConfigureStore<{}>()({
      packages: [
        iCanAdd,
      ],
    });

    const store = configureStore({});
    store.dispatch(addToSum.create(8));
    store.dispatch(addToSum.create(15));
    store.dispatch(addToSum.create(19));

    expect((store.getState() as any).__private__.iCanAdd.sum).toEqual(42);
  });

  test("can run epics", () => {
    const iCanAdd = createMythicPackage("iCanAdd")<
      {
        sum: number;
      }
      >({
      initialState: {
        sum: 0,
      },
    });

    const addToSum =
      iCanAdd.createMyth("addToSum")<number>({
        reduce: (state, action) =>
          state.set("sum", state.get("sum") + action.payload),
        andAlso: [
          {
            when: action => action.payload >= 10,
            dispatch: (action, _, addToSum_) =>
              of(addToSum_.create(-action.payload * 2)),
          },
        ],
      });

    const configureStore = makeConfigureStore<{}>()({
      packages: [
        iCanAdd,
      ],
    });

    const store = configureStore({});
    store.dispatch(addToSum.create(8));
    store.dispatch(addToSum.create(15));
    store.dispatch(addToSum.create(19));

    expect((store.getState() as any).__private__.iCanAdd.sum)
      .toEqual(8 + 15 + 19 - 15*2 - 19*2);
  });
});
