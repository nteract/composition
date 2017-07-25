import json
import os
from tornado import web

from notebook.base.handlers import IPythonHandler, FileFindHandler
from jinja2 import FileSystemLoader
from notebook.utils import url_path_join as ujoin
from traitlets import HasTraits, Unicode, Bool

HERE = os.path.dirname(__file__)
FILE_LOADER = FileSystemLoader(HERE)

class NAppHandler(IPythonHandler):
    """Render the nteract view"""
    def initialize(self, config):
        self.nteract_config = config

    @web.authenticated
    def get(self):
        config = self.nteract_config
        settings_dir = config.settings_dir
        assets_dir = config.assets_dir

        base_url = self.settings['base_url']
        url = ujoin(base_url, config.page_url, '/static/')

        # Handle page config data.
        page_config = dict()
        page_config.update(self.settings.get('page_config_data', {}))
        page_config.setdefault('appName', config.name)
        page_config.setdefault('appVersion', config.version)

        mathjax_config = self.settings.get('mathjax_config',
                                           'TeX-AMS_HTML-full,Safe')

        config = dict(
            page_title=config.page_title,
            mathjax_url=self.mathjax_url,
            mathjax_config=mathjax_config,
            page_config=page_config,
            public_url=url
        )
        self.write(self.render_template('index.html', **config))

    def get_template(self, name):
        return FILE_LOADER.load(self.settings['jinja2_env'], name)



def add_handlers(web_app, config):
    """Add the appropriate handlers to the web app.
    """
    base_url = web_app.settings['base_url']
    url = ujoin(base_url, config.page_url)
    assets_dir = config.assets_dir


    package_file = os.path.join(assets_dir, 'package.json')
    with open(package_file) as fid:
        data = json.load(fid)

    config.version = (config.version or
                      data['version'])
    config.name = config.name or data['name']

    handlers = [
        (url + r'/?', NAppHandler, {
            'config': config
        }),
        (url + r"/static/(.*)", FileFindHandler, {
            'path': assets_dir
        }),

    ]

    web_app.add_handlers(".*$", handlers)
