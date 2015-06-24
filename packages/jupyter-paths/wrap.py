dirs = ''
import os
import json
import glob
import sys

def get_runtimes():
  paths = []
  try:
    # Do they live in the future with Jupyter?
    import jupyter_core.paths
    jupyter_runtimes = jupyter_core.paths.jupyter_runtime_dir()
    paths.append(jupyter_runtimes)
  except ImportError as e:
    # Or are they in the old IPython setup?
    import IPython
    appy = IPython.terminal.ipapp.LocateIPythonApp()
    security_dirs = glob.glob('{basepath}/profile_*/security'.format(basepath=appy.ipython_dir))
    paths.extend(security_dirs)
  return paths

try:
  json.dump(get_runtimes(), sys.stdout)
except Exception as e:
  json.dump({'err': str(e)}, sys.stderr)

# Newline
print()
