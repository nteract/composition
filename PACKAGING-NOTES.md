# Packaging for Linux

links:

- [electron-builder documentation](https://github.com/electron-userland/electron-builder/wiki/Options#LinuxBuildOptions)
- [original pull request](https://github.com/nteract/nteract/pull/1299)

## Readline versions

If your system has `readline` v7 packaging will fail with:
```
/home/YourName/.cache/electron-builder/AppImage/AppImage-09-07-16-linux/xorriso: error while loading shared libraries: libreadline.so.6: cannot open shared object file: No such file or directory
```
[A workaround](https://github.com/electron-userland/electron-builder/issues/993#issuecomment-269283346) is to install `xorriso` on your system and symlink it into the
AppImage: `ln -sf `which xorriso` ~/.cache/electron-builder/AppImage/AppImage-09-07-16-linux/xorriso `


## Environment for .deb packaging

This section contains notes made during the initial setup of the `.deb`
packaging. Initially written for ubuntu 16.10.

apt-get packages:

```bash
sudo apt-get install npm nodejs
# some packages that reduced build warnings
sudo apt-get install libcairo2-dev libjpeg-dev libgif-dev
# these are from some electron-build documentation
sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils
```


Run `npm run dist` in the root of the repository. This will create package such
as `dist/nteract_0.0.15_amd64.deb`

Install the debian package using `dpkg` or by double-clicking on the file, eg:

```
sudo dpkg -i dist/nteract_0.0.15_amd64.deb
```

That's it. nteract can be launched from the command line as `nteract` or via a
graphical launcher.
The mime-type `application/x-ipynb+json` is used to identify files that can be
opened with nteract.


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

## Debugging the debian archive


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

### Linting .deb files

To check .deb files for errors, use eg. `lintian`:

```
lintian nteract_0.0.15_amd64.deb
```
