import json
import os
from tornado import web

HTTPError = web.HTTPError

import notebook


from notebook.base.handlers import (
    IPythonHandler,
    FileFindHandler,
    FilesRedirectHandler,
    path_regex,
)

from notebook.utils import url_escape

from jinja2 import FileSystemLoader
from notebook.utils import url_path_join as ujoin
from traitlets import HasTraits, Unicode, Bool

HERE = os.path.dirname(__file__)
FILE_LOADER = FileSystemLoader(HERE)

class PlayHandler(IPythonHandler):
    """Render the play view"""
    def initialize(self, play_config):
        self.play_config = play_config

    @web.authenticated
    def get(self, path="/"):
        config = self.play_config
        assets_dir = config.assets_dir

        base_url = self.settings['base_url']
        url = ujoin(base_url, config.page_url, '/static/')

        # Handle page config data.

        jinja_config = dict(
            page_title=config.page_title,
            page_config={},
            public_url=url,
            contents_path=path,
        )
        self.write(self.render_template('index.html', **jinja_config))

    def get_template(self, name):
        return FILE_LOADER.load(self.settings['jinja2_env'], name)
