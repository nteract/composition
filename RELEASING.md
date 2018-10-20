# :package: Let's package a release!

## All platform precursor

To be able to publish a release you'll need to generate a GitHub access token by going to <https://github.com/settings/tokens/new>. The access token should have the `repo` scope/permission. Once you have the token, assign it to an environment variable (on macOS/linux):

```bash
export GH_TOKEN="<YOUR_TOKEN_HERE>"
```

## macOS

In order to build a signed copy with working auto-update, you will need to join the Apple developer program and get a certificate. The [Electron docs have a document on submitting your app to the app store](https://github.com/electron/electron/blob/master/docs/tutorial/mac-app-store-submission-guide.md), you only have to get through to the certificate step.

## Release Process

1.  Make sure the release is working by running `yarn dist` and testing the built app inside the `./applications/desktop/dist/` folder. You can build for all platforms using `yarn dist:all`.

1.  Double check that publish will really work by running `yarn verifyBeforePublish` first

1.  Run `npx lerna publish` to publish everything, which also runs the verification steps. You will have to pick versions for everything.

1.  Run the following to ship the built desktop app

```
yarn ship:desktop
```

1.  From GitHub go to [nteract's releases](https://github.com/nteract/nteract/releases), verify everything works and edit the release notes. The name should follow our [naming guidelines](https://github.com/nteract/naming), namely that we use the last name of the next scientist in the list with an adjective in front.
    Example:

```bash
Last release: Avowed Avogadro
Next Scientist: Babbage
Next release: Babbling Babbage
```

My favorite way to pick the alliterative adjectives is using the local dictionary and our friend `grep`:

```bash
$ cat /usr/share/dict/words | grep "^babb"
babbitt
babbitter
babblative
babble
babblement
babbler
babblesome
babbling
babblingly
babblish
babblishly
babbly
babby
```

5.  Once you're ready click "Publish release". On Mac and Windows the update will be automatically downloaded and installed.
