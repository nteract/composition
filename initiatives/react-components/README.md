# React Components

The nteract notebook front-end utilizes React and contains several React
components, that include.

* Cell
* CodeCell
* MarkdownCell
* Output

These components can be isolated and used in a variety of settings by people
in a variety of ways. As a result, some effort should be put into seperating
these components out, documenting them well, and making them composable by the
developer community.

The primary things that need to be done with the nteract/nteract repo is to:

* Create a monorepo (export individual modules from the main app)
* Encourage components that don't know about dispatch (use callbacks)
