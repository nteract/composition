from traitlets import HasTraits, Unicode, Bool

class Config(HasTraits):
    """The nteract application configuration object
    """
    name = Unicode('nteract',
        help='The name of nteract, which is configurable for some reason')

    page_url = Unicode('/nteract',
        help='The base URL for nteract web')

    version = Unicode('',
        help='The version of nteract web')

    settings_dir = Unicode('',
        help='The settings directory')

    assets_dir = Unicode('',
        help='The assets directory')

    dev_mode = Bool(False,
        help='Whether the application is in dev mode')
