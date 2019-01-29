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

from . import PACKAGE_DIR
from .config import NteractConfig

FILE_LOADER = FileSystemLoader(PACKAGE_DIR)

class NAppHandler(IPythonHandler):
    """Render the nteract view"""
    def initialize(self, config, page):
        self.nbconfig = config
        self.page = page

    @web.authenticated
    def get(self, path="/"):
        nteract_config = NteractConfig(config=self.nbconfig)
        settings_dir = nteract_config.settings_dir
        assets_dir = nteract_config.assets_dir

        base_url = self.settings['base_url']
        url = ujoin(base_url, nteract_config.page_url, '/static/')

        # Handle page config data.
        page_config = dict()
        page_config.update(self.settings.get('page_config_data', {}))
        page_config.setdefault('appName', nteract_config.name)
        page_config.setdefault('appVersion', nteract_config.version)

        mathjax_config = self.settings.get('mathjax_config',
                                           'TeX-AMS_HTML-full,Safe')

        asset_url = nteract_config.asset_url

        if asset_url is "":
            asset_url = base_url

        # Ensure there's a trailing slash
        if not asset_url.endswith('/'):
            asset_url = asset_url + '/'

        filename = path.split("/")[-1]
        if filename:
            page_title = '{filename} - nteract'.format(filename=filename)
        else:
            page_title = 'nteract'

        try:
            from bookstore.bookstore_config import BookstoreSettings, validate_bookstore
            bookstore_settings = BookstoreSettings(config=self.nbconfig)
            bookstore_enabled = validate_bookstore(bookstore_settings)

        except ImportError:
            print("Bookstore module not installed.")
            bookstore_enabled = False

        index_config = dict(
            ga_code=nteract_config.ga_code,
            asset_url=asset_url,
            page_title=page_title,
            mathjax_url=self.mathjax_url,
            mathjax_config=mathjax_config,
            page_config=page_config,
            public_url=url,
            contents_path=path,
            page=self.page,
            bookstore_enabled=bookstore_enabled,
        )
        self.write(self.render_template('index.html', **index_config))

    def get_template(self, name):
        return FILE_LOADER.load(self.settings['jinja2_env'], name)


def add_handlers(web_app):
# def add_handlers(nbapp, nteract_config):
    """Add the appropriate handlers to the web app.
    """
    base_url = web_app.settings['base_url']
    config = web_app.settings["config"]
    nteract_config = config.NteractConfig

    url = ujoin(base_url, nteract_config.page_url)
    assets_dir = nteract_config.assets_dir

    package_file = os.path.join(assets_dir, 'package.json')
    with open(package_file) as fid:
        data = json.load(fid)
    nteract_config.version = (nteract_config.version or data['version'])
    nteract_config.name = nteract_config.name or data['name']


    handlers = [
        # TODO Redirect to /tree
        (url + r'/?', NAppHandler, {
            'config': config,
            'page': 'tree'
        }),
        (url + r"/tree%s" % path_regex, NAppHandler, {
            'config': config,
            'page': 'tree',
        }),
        (url + r"/edit%s" % path_regex, NAppHandler, {
            'config': config,
            'page': 'edit',
        }),
        (url + r"/view%s" % path_regex, NAppHandler, {
            'config': config,
            'page': 'view'
        }),
        (url + r"/static/(.*)", FileFindHandler, {
            'path': assets_dir
        }),
    ]

    web_app.add_handlers(".*$", handlers)
