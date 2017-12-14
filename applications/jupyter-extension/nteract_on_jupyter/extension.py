# coding: utf-8
"""A tornado based nteract server."""

# Copyright (c) nteract development team.
# Distributed under the terms of the Modified BSD License.
import os

from notebook.utils import url_path_join as ujoin
from os.path import join as pjoin
from jupyter_core.paths import ENV_JUPYTER_PATH, jupyter_config_path

from ._version import __version__

from .config import Config

from .handlers import add_handlers


def get_app_dir(app_dir=None):
    """Get the configured nteract app directory.
    """
    app_dir = app_dir or os.environ.get('NTERACT_DIR')
    app_dir = app_dir or pjoin(ENV_JUPYTER_PATH[0], 'nteract')
    return os.path.realpath(app_dir)


def load_jupyter_server_extension(nbapp):
    """Load the JupyterLab server extension.
    """
    # Print messages.
    here = os.path.dirname(__file__)
    nbapp.log.info('nteract extension loaded from %s' % here)

    #app_dir = get_app_dir()
    #if hasattr(nbapp, 'app_dir'):
    #    app_dir = get_app_dir(nbapp.app_dir)

    app_dir = here  # bundle is part of the python package

    web_app = nbapp.web_app
    config = Config()

    # original
    # config.assets_dir = os.path.join(app_dir, 'static')
    config.assets_dir = app_dir

    config.page_title = 'nteract'
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

    add_handlers(web_app, config)
