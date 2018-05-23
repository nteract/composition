# coding: utf-8
"""A tornado based nteract server."""

# Copyright (c) nteract development team.
# Distributed under the terms of the Modified BSD License.
import os

from notebook.utils import url_path_join as ujoin
from os.path import join as pjoin
from jupyter_core.paths import ENV_JUPYTER_PATH, jupyter_config_path

from . import PACKAGE_DIR
from ._version import __version__
from .config import NteractConfig
from .handlers import add_handlers



def load_jupyter_server_extension(nbapp):
    """Load the JupyterLab server extension.
    """
    here = PACKAGE_DIR
    nbapp.log.info('nteract extension loaded from %s' % here)

    app_dir = here  # bundle is part of the python package

    web_app = nbapp.web_app
    config = NteractConfig(parent=nbapp)

    # original
    # config.assets_dir = os.path.join(app_dir, 'static')
    config.assets_dir = app_dir

    config.page_url = '/nteract'
    config.dev_mode = False

    # Check for core mode.
    core_mode = ''
    if hasattr(nbapp, 'core_mode'):
        core_mode = nbapp.core_mode

    # Check for an app dir that is local.
    if app_dir == here or app_dir == os.path.join(here, 'build'):
        core_mode = True
        config.settings_dir = ''

    web_app.settings.setdefault('page_config_data', dict())
    web_app.settings['page_config_data']['token'] = nbapp.token
    web_app.settings['page_config_data']['ga_code'] = config.ga_code
    web_app.settings['page_config_data']['asset_url'] = config.asset_url

    web_app.settings['nteract_config'] = config

    add_handlers(web_app, config)
