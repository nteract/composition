from traitlets import HasTraits, Unicode, Bool
from traitlets.config import Configurable

class NteractConfig(Configurable):
    """The nteract application configuration object
    """
    name = Unicode('nteract',
        help='The name of nteract, configurable so it can be set dynamically').tag(config=True)

    page_url = Unicode('/nteract',
        help='The base URL for nteract web').tag(config=True)

    version = Unicode('',
        help='The version of nteract web').tag(config=True)

    settings_dir = Unicode('',
        help='The settings directory').tag(config=True)

    assets_dir = Unicode('',
        help='The assets directory').tag(config=True)

    asset_url = Unicode('',
        help='Remote URL for loading assets').tag(config=True)

    ga_code = Unicode('',
        help="Google Analytics tracking code").tag(config=True)
