# coding: utf-8
"""A tornado based nteract server."""

# Copyright (c) nteract development team.
# Distributed under the terms of the Modified BSD License.
import os
import json

from notebook.utils import url_path_join as ujoin
from os.path import join as pjoin
from jupyter_core.paths import ENV_JUPYTER_PATH, jupyter_config_path
from traitlets import Unicode, Bool, default
from traitlets.config import LoggingConfigurable

from ._version import __version__


from notebook.base.handlers import (
    path_regex,
    FileFindHandler,
    RedirectWithParams
)


from .handlers import PlayHandler

class PlayConfig(LoggingConfigurable):
    """The nteract application configuration object
    """

    version = Unicode(
        '',
        help='The version of play web'
    )

    @default('version')
    def _version_default(self):
        package_file = os.path.join(self.assets_dir, 'package.json')
        with open(package_file) as fid:
            data = json.load(fid)
        return data['version']

    page_title = Unicode(
        'Play',
        help='Title of the page play is rendered in'
    )
    assets_dir = Unicode(
        os.path.dirname(__file__),
        help='The assets directory'
    )

    page_url = Unicode(
        '/play',
        help='URL under which play is mounted'
    )

    dev_mode = Bool(False,
        help='Whether the application is in dev mode')


def load_jupyter_server_extension(nbapp):
    """Load the JupyterLab server extension.
    """
    # Print messages.
    here = os.path.dirname(__file__)
    nbapp.log.info('play extension loaded from %s' % here)

    config = PlayConfig(parent=nbapp)

    base_url = nbapp.web_app.settings['base_url']

    base_app = ujoin(base_url, config.page_url)

    handlers = [
        # show the "tree" by default
        (base_app + r'/?', RedirectWithParams, {
            'url': base_app + '/v/',
            'permanent': False
        }),

        # /play/v/contents/path/file.py for editing
        (base_app + r"/v%s" % path_regex, PlayHandler, {
            'play_config': config
        }),

        (base_app + r"/static/(.*)", FileFindHandler, {
            'path': config.assets_dir
        })
    ]

    nbapp.web_app.add_handlers(".*$", handlers)
