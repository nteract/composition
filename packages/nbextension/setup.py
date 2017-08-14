#!/usr/bin/env python
# -*- coding: utf-8 -*-

import setuptools
import json
import os

version = '0.0.0-dev'

here = os.path.dirname(__file__)

with open(os.path.join(here, "nteract_on_jupyter", "package.json")) as f:
    packageJSON = json.load(f)
    version = packageJSON['version']

setuptools.setup(
  name="nteract_on_jupyter",
  version=version,
  url="https://github.com/nteract/nteract",
  author="nteract contributors",
  author_email="jupyter@googlegroups.com",
  description="Extension for the jupyter notebook server and nteract",
  packages=setuptools.find_packages(),
  include_package_data=True,
  zip_safe=False,
  install_requires=[]
)
