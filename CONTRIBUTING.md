Oh, hello there! You're probably reading this because you are interested in
contributing to nteract. That's great to hear! This document will help you
through your journey of open source. Love it, cherish it, take it out to
dinner, but most importantly: read it thoroughly!

## What do I need to know to help?

You'll need knowledge of JavaScript (ES6), React, RxJS, and Redux to help out
with this project. That's a whole lot of cool stuff! But don't worry, we've
got some resources to help you out.
* [Building a voting app with Redux and React](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html)
* [The RxJS Tutorial](https://xgrommx.github.io/rx-book/index.html)
* 

## How do I make a contribution?

Never made an open source contribution before? Wondering how contributions work
in the nteract world? Here's a quick rundown!

1. Find an issue that you are interested in addressing or a feature that you
would like to address.
2. Fork the repository associated with the issue to your local GitHub organization.
3. Clone the repository to your local machine using `git clone
https://github.com/github-username/repository-name.git`.
4. Create a new branch for your fix using `git checkout -b branch-name-here`.
5. Make the appropriate changes for the issue you are trying to address or the
feature that you want to add.
6. Add and commit the changed files using `git add` and `git commit`.
7. Push the changes to the remote repository using `git push origin
branch-name-here`.
8. Submit a pull request to the upstream repository.
9. Title the pull request per the requirements outlined in the section below.
10. Set the description of the pull request with a brief description of what you
did and any questions you might have about what you did.
11. Wait for the pull request to be reviewed by a maintainer.
12. Make changes to the pull request if the reviewing maintainer recommends them.
13. Celebrate your success after your pull request is merged! :tada:

## How should I write my commit messages and PR titles?

Great question! Here at nteract, we utilize the [conventional-changelog-standard]
(https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md)
for writing our commit messages and PR titles. Why do we do this? The standard
comes in really handy when we need to determine what kinds of information should
go into our release documentation (as the word changelog in the title might suggest!).
Good release messages means more informed users means a better project to use. Yay!

Note that this standard applies to both your commit messages and PR titles so you'll
need to draft the appropriate commit message when you run `git commit -m` or use the
interface on your visual git interface.

You can use the following verbs as part of your commit messages/PR titles.
* fix: For when you have fixed a bug.
* feat: For when you have added a new feature.
* chore: For when you've done a small chore on the repository such as updating
a script in package.json or changing your code based on feedback from the linter.
* docs: For when you've added documentation.

In addition to the active verb, you'll also need to include the affected component
in the commit message or PR title. The structure for this is as follows.
* If you've made the change to a React component, use the components name, such as
`CodeCell`.
* If you've made a change to the overall application, such as the Electron code, use
 the `app` name.
* If you've made a change to a reducer, use the name of the reducer, such as `document`
or `app`.
* If you've made a change to an epic, use the name of the epic exported, such as
`executeCellEpic`.

## How fast will my PR be merged?

Your pull request will be merged as soon as there are maintainers to review it and
after tests have passed. You might have to make some changes before your PR is merged
but as long as you adhere to the steps above and try your best, you should have no problem
getting your PR merged.

That's it! You're good to go!
