# Packaging for Linux

links:

- [electron-builder documentation](https://github.com/electron-userland/electron-builder/wiki/Options#LinuxBuildOptions)
- [original pull request](https://github.com/nteract/nteract/pull/1299)


Follow the development environment setup in instructions  [README.md](./README.md)


Run `yarn dist` in the root of the repository. This will create package `deb` and AppImage packages in `applications/desktop/dist`.

```bash
$ yarn dist
$ ls -1 applications/desktop/dist/nteract*
applications/desktop/dist/nteract_0.11.6_amd64.deb
applications/desktop/dist/nteract-0.11.6.tar.gz
applications/desktop/dist/nteract-0.11.6-x86_64.AppImage
```

Yarn will by default produce packages suitable for the system it is running on.

Install the debian package using `dpkg` or by double-clicking on the file, eg:

```
sudo dpkg -i applications/desktop/dist/nteract_0.11.6_amd64.deb
```

That's it. nteract can be launched from the command line as `nteract` or via a
graphical launcher.
The mime-type `application/x-ipynb+json` is used to identify files that can be
opened with nteract.

## Package version numbers

While debugging packages it may be useful to alter the version number of nteract

```
$ cd applications/desktop
$ npm version patch
0.11.7
```

`npm version` alters the value of the `version` key in the root of `applications/desktop/package.json`. Make sure to revert the version number to an appropriate when finalizing your pull request.

## configuring package build types

Set the value of `build.target.linux` in `applications/desktop/package.json`

```
"target": [
    "deb",
    "AppImage",
    "tar.gz"
],
```


# Debugging the debian archive


`.deb` files are *ar* archives. To see the contents of the package, run:

```
ar xv nteract_0.0.15_amd64.deb
```

This will create two arcives, `data.tar.xz`, and `control.tar.gz`. The data
archive specifies what files will be install where. The control archive
contains package metadata that is used by package managers such as `dpkg` and
`apt-get`.

```
tar -xf data.tar.gz
tar -xf control.tar.gz
```
## Contents of the .deb

Installing the package will modify the following directories on the system:

- `/opt/nteract`
    - most of the package's resources will be here
    - Ubuntu would like this to be in `/usr/share/nteract` (`lintian` linter
    will complain)
- `/usr/share/applications`
    - `nteract.desktop` is added here. This files creates the graphical launcher
- `/usr/share/doc/nteract/`
    - `changelog.gz` a gzipped version of an auto-generated changelog (based on
        what?) **TODO** figure out how to control generation of this file
- `/usr/share/icons/hicolor/<size>/apps/`
        a number of different sized logos (`nteract.png`). Based on
        `build/icon.incs`?

## Linting .deb files

To check .deb files for errors, use eg. `lintian`:

```
lintian nteract_0.0.15_amd64.deb
```



# Observations


- Nteract logo in the Gnome action bar is a black icon on dark background. **TODO** figure out how to set light/dark     icon based on desktop environment theme (light/dark)
- [x] action bar drop-down menu works well.




```

## APPIMAGE env is not defined

Running nteract without arguments gives a warning "APPIMAGE env is not defined" if nteract was installed using `.deb` of `.tar.gz`. Both still work fine.

```
$ nteract
[...snip...]
[09:01:28.771] [warn] APPIMAGE env is not defined, current application is not an AppImage
```


# Workarounds and dependencies

Some section below were issues in an older version of the build system, and may not be applicable.

## Dependencies for .deb packaging

This section contains notes made during the initial setup of the `.deb`
packaging. Initially written for ubuntu 16.10.

apt-get packages:

```bash
# some packages that reduced build warnings
sudo apt-get install libcairo2-dev libjpeg-dev libgif-dev
# these are from some electron-build documentation
sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils
```



### Readline versions

If your system has `readline` v7 packaging will fail with:
```
/home/YourName/.cache/electron-builder/AppImage/AppImage-09-07-16-linux/xorriso: error while loading shared libraries: libreadline.so.6: cannot open shared object file: No such file or directory
```
[A workaround](https://github.com/electron-userland/electron-builder/issues/993#issuecomment-269283346) is to install `xorriso` on your system and symlink it into the
AppImage: `ln -sf `which xorriso` ~/.cache/electron-builder/AppImage/AppImage-09-07-16-linux/xorriso `
