import json
import os

version_info = (0, 0, 0)
__version__ = "0.0.0"

here = os.path.dirname(__file__)

with open(os.path.join(here, "package.json")) as f:
    packageJSON = json.load(f)
    __version__ = packageJSON['version']

    version_info = tuple(__version__.split('.'))
