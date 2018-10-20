#!/bin/bash
# Get current path in Windows format
if command -v "cygpath" > /dev/null; then
  # We have cygpath to do the conversion
  CMD=$(cygpath "$(dirname "$0")/nteract.cmd" -a -w)
else
  # We don't have cygpath so try pwd -W
  pushd "$(dirname "$0")" > /dev/null
  CMD="$(pwd -W)/nteract.cmd"
  popd > /dev/null
fi
if [ "$(uname -o)" == "Msys" ]; then
  cmd.exe //C "$CMD" "$@" # Msys thinks /C is a Windows path...
else
  cmd.exe /C "$CMD" "$@" # Cygwin does not
fi
