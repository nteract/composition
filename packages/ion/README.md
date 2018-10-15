# ion

A React-backed UI Toolkit for nteract apps

> nteract React components, missing an Electron

```
npm install --save @nteract/ion
```

## Usage

```jsx
import { Tag } from "@nteract/ion";

const Tags = props => (
  <div>
    {props.tags.map(tag => (
      <Tag large minimal key={tag}>
        {tag}
      </Tag>
    ))}
  </div>
);
```

## Goals

1. Coalesce styled components across the nteract org into one nice UI kit that includes many of the basics like:

- Colors
- Typography
- Form elements
- Progress bars
- Buttons
- Button Groups
- Tooltips and Popovers
- Dropdown Menus
- Navigation Bars
- Dialogs and Alerts
- Navigation bars
- Notifications (in-app "toasts")
- Cards and Elevation
- Directory Listing

As well as common elements we support across nteract apps.

2. Develop an approachable, manageable and contributor-friendly JavaScript codebase.

As we go along, let's make a sketch file that has our components as we build them.

## More Background

We've been building a _lot_ of components inside the nteract monorepo. It's time to make an overall UI kit that ties together what we've been doing while helping us have one consistent style guide.

### Inspiration

- [Atlaskit](https://atlaskit.atlassian.com/)
- [Blueprint](http://blueprintjs.com/docs/)
- [Ant Design](https://ant.design/)

> Wait, so with all these other component libraries why should we build another?

We've been using some of the above component libraries already (antd being one of them). We've run into a few issues in using other component libraries:

- Their direction does not always match ours
  - Reliance on CSS imports as part of JS
  - Difficulty to override default styles when needed (and knowing when its truly necessary)
  - Sweeping Design changes impact all our components
- As we build new components on top of other component libraries we have to match their style. Since we don't necessarily know and work with their designers directly, there is commonly a mismatch (with no input from the original designers). This turns into either a point of friction or tending towards Frankenstein UIs that use many different styles together.
- We, by necessity, have to build our own components to match the domain area we're building for (literate interactive computing). These components need to match the style of other components we work with, as well as their own style guide.

All that being said, our component suite _can_ use components from other libraries. Our goal will be to make a seamless suite that can be used in various nteract apps. 😇

We're currently building on top of blueprint.js
