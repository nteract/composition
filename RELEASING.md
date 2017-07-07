Let's package a release!

# All platform precursor

Cut a release using the `npm` workflow:

```
npm version {major, minor, patch}
npm publish
git push
git push --tags
```

Now, from GitHub go to [nteract's releases](https://github.com/nteract/nteract/releases) and make a release from the version you just published above. The name should follow our [naming guidelines](https://github.com/nteract/naming), namely that we use the last name of the next scientist in the list with an adjective in front.

Example:

```
Last release: Avowed Avogadro
Next Scientist: Babbage
Next release: Babbling Babbage
```

My favorite way to pick the alliterative adjectives is using the local dictionary and our friend `grep`:

```
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

## macOS

In order to build a signed copy, you will need to join the Apple developer program and get a certificate. The [Electron docs have a document on submitting your app to the app store](https://github.com/electron/electron/blob/master/docs/tutorial/mac-app-store-submission-guide.md), you only have to get through to the certificate step.

Once your certificate is all set up and your nteract dev environment is ready:

* Run `npm run dist:osx`

https://github.com/nteract/naming
