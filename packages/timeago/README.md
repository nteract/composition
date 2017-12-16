![TimeAgo](http://naman.s3.amazonaws.com/react-timeago.png)

## Usage:

`@nteract/timeago` is a very simple component that takes a date prop and returns a span with live updating date in a time-ago format. The date will update only as often as needed. For timestamps below a minute away — every second, for timestamps up to 5 minutes away — every hour, and so on.

timeago does the minimum amount of updates necessary.

```jsx
<TimeAgo date="Aug 29, 2014" />
```

## Language support

`@nteract/timeago` comes with support for a large number of languages out of the box.
This support is based on the string objects taken from `jquery-timeago`

#### Usage:
To use any of the languages provided, other than the default english, you will have to
import the language strings and build a custom formatter.

```jsx
import TimeAgo from '@nteract/timeago'
import frenchStrings from '@nteract/timeago/lib/language-strings/fr'
import buildFormatter from '@nteract/timeago/lib/formatters/buildFormatter'

const formatter = buildFormatter(frenchStrings)

// in your react component
<TimeAgo date='Feb 1, 1966' formatter={formatter} />
```

And that's it. You can also customize the language strings or provide your own.
For maximum control you can write your own formatter function.

For best performance, I recommend that you build formatters that you're going to use once,
and pass them around.

## Props

#### `date` (required)
Date is a date in the past or the future. This can be a Date Object, A UTC date-string or number of milliseconds since epoch time.

#### `now` (optional)
A function that returns what `Date.now` returns. Useful for server-side rendering.

#### `live` (optional)
`@nteract/timeago` is live by default and will auto update its value. However, if you don't want this behaviour, you can set `live: false`.

#### `formatter` (optional)
A function that takes five arguments:
  - `value`: An integer value, already rounded off
  - `unit`: A string representing the unit in english. This could be one of:
    - 'second'
    - 'minute'
    - 'hour'
    - 'day'
    - 'week'
    - 'month'
    - 'year'
  - `suffix`: A string. This can be one of
    - 'ago'
    - 'from now'
  - `date`: The actual date you are trying to represent. Use this for a more custom format for showing your date.
  - `defaultFormatter`: (Optional) A default formatter function with pre-bound values. May be used as a fallback formatting option inside a custom formatting logic.

Here are some examples of what the formatter function will receive:

- `'5 minutes ago' => formatter(5, 'minute', 'ago')`
- `'1 year from now' => formatter(1, 'year', 'from now')`

The formatter function is a simple way to extend the functionality of React-Timeago to support any feature you may need from a fuzzy time display.
The formatter function is expected to return a string.
But it can also return any React component (or array of components) that would become the child of `@nteract/timeago`

The project comes with a set of languages and a formatter function builder based on those language strings.
You can customize the strings, or provide your own custom formatter function.

I recommend using the fantastic [L10ns](http://l10ns.org) for other internationalization needs.

#### `component` (optional) (default: 'time')
A string of ReactClass that is used to wrap the live updating string

#### `title` (optional)
If the component is left as the default 'time' component, a title attribute is passed to it.
You can customize this by passing a string, or a UTC date-string will be used based on
the given date.

#### `minPeriod` (optional) (default: 0)
The minimum number of seconds that the component should wait before updating. The component will still update if you pass new props.
Use this if, for example, you don't want to update every second for recent times.

#### `maxPeriod` (optional) (default: Infinity)
The opposite of `minPeriod`. Use this to force dates to update more often than the default behaviour.
For example, you can use this update a time every 5 minutes even after it is more than an hour old.

#### Anything Else? (optional)

As of v2.0 you can pass in any props. Any props not used by `@nteract/timeago` will be passed down to the resulting component.
This means that you can pass `className`, `styles`, `id`, `title`, `aria-label`, event handlers or anything else you want.

