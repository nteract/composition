# Why is nteract a monorepo?

> The tool for managing the monorepo in nteract is [Lerna](https://github.com/lerna/lerna)

nteract follows a monorepo approach, all officially maintained modules are in the same repo.

**Pros:**

* Single lint, build, test and release process.
* Easy to coordinate changes across modules.
* Single place to report issues.
* Easier to setup a development environment.
* Tests across modules are ran together which finds bugs that touch multiple modules easier.

**Cons:**

* Codebase looks more intimidating.
* Repo is bigger in size.
* [Can't `npm install` modules directly from GitHub](https://github.com/npm/npm/issues/2974)

## This is weird! Nobody in open source does this!

[React](https://github.com/facebook/react/tree/master/packages), [Meteor](https://github.com/meteor/meteor/tree/devel/packages), [Ember](https://github.com/emberjs/ember.js/tree/master/packages), [Babel](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) among others, do this.
