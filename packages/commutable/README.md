# com·mut·a·ble

> /kəˈmyo͞otəbəl/
>
> 1. (of a place or journey) allowing regular commuting to and from work.
> 2. **capable of being exchanged or converted.**

`commutable` is a library for Jupyter Notebook operations, helping to enable
history stored as a series of immutable notebooks.

## Principles

* **A notebook document is immutable**. It is never mutated in-place.
* Changes to a notebook document are encapsulated into **operations** that take a previous version and return a new one.
* History is represented as a **list of states**, with past on one end, the present on the other, and an index that can back up into 'undo states'.
* Modifying a notebook document causes any **future states to be thrown away**.

Credits to [Tom MacWright](http://www.macwright.org/2015/05/18/practical-undo.html) for the outline.

## Installation

```
npm install --save @nteract/commutable
```

## Docs

Check out our [docs](https://nteract.github.io/docs/commutable/) for getting started.

