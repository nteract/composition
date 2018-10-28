# TypeScript Ambient Types

If you need to import a package without types available, first you should try
to install `@types/foo` to see if that exists. If it doesn't or it's
unmaintained, you can create your own typings here.

To add new typings for a package, create a folder with the package name and
place a file called `index.d.ts` inside of it. Any types your export there will
be used whenever you try to import the package elsewhere.

In general, avoid adding types here that are simply shared between packages.
It's better to have the types owned by a particular package and then import
them into other packages. If you only rely on a package for its types you can
always add it as a devDependency only.
