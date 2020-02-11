# @nteract/mythic-notifications

This package implements a notification system based on `blueprintjs`, using the `myths` framework.

## Installation

```
$ yarn add @nteract/mythic-notifications
```

```
$ npm install --save @nteract/mythic-notifications
```

## Usage

Initialize the package by including the `notifications` package in your store and rendering the `<NotificationsRoot/>`:

```javascript
import { notifications, NotificationRoot } from "@nteract/mythic-notifications";
import { makeConfigureStore } from "@nteract/myths";

export const configureStore = makeConfigureStore({
  packages: [notifications],
});

export const App = () =>
    <>
      {/* ... */}
      <NotificationRoot darkTheme={false} />
    </>
```

Then dispatch actions made by `sendNotification.create`:

```javascript
import { sendNotification } from "@nteract/mythic-notifications";

store.dispatch(sendNotification.create({
  title: "Hello World!",
  message: <em>Hi out there!</em>,
  level: "info",
}));
```

## API

```typescript
import { IconName } from "@blueprintjs/core";

export interface NotificationMessage {
  key?: string;
  icon?: IconName;
  title?: string;
  message: string | JSX.Element;
  level: "error" | "warning" | "info" | "success" | "in-progress";
  action?: {
    icon?: IconName;
    label: string;
    callback: () => void;
  };
}
```

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:mythic-notifications` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
