
from subprocess import Popen

from notebook.notebookapp import NotebookApp, flags
from traitlets import Unicode, Bool


from . import EXT_NAME, PACKAGE_DIR
from .config import NteractConfig
from .extension import load_jupyter_server_extension
from .utils import cmd_in_new_dir

webpack_hot = {"address": 'http://localhost:8080/',
               "command":["lerna", "run", "hot",
                          "--scope", "nteract-on-jupyter",
                          "--stream"]}
nteract_flags = dict(flags)
nteract_flags['dev'] = (
    {'NteractConfig': {'asset_url': webpack_hot['address']},
     'NteractApp': {'dev_mode': True}
    },
    "\n".join([
        "Start nteract in dev mode, serving assets built from your source code.",
        "This is a hot reloading server that watches for changes to your source,",
        "rebuilds the js files, and serves the new assets on:",
        "    {address}",
        "To access this server run:",
        "    `{command}`"]).format(address=webpack_hot["address"],
                                   command=" ".join(webpack_hot["command"])
        )
)

class NteractApp(NotebookApp):
    """Application for runing nteract on a jupyter notebook server.

    """
    default_url = Unicode('/nteract/edit',
                          help="nteract's default starting location")

    classes = [*NotebookApp.classes, NteractConfig]
    flags = nteract_flags

    dev_mode = Bool(False, config=True,
    help="""Whether to start the app in dev mode. Expects resources to be loaded
    from webpack's hot reloading server at {address}. Run
    `{command}`
    To serve your assets.
    This is only useful if NteractApp is installed editably e.g., using `pip install -e .`.
    """.format(address=webpack_hot["address"],
               command=" ".join(webpack_hot["command"])))


    def init_server_extensions(self):
        super(NteractApp, self).init_server_extensions()
        if self.dev_mode:
            msg = 'NteractApp server extension not enabled, loading in dev mode...'
            if not self.nbserver_extensions.get(EXT_NAME, False):
                self.log.warn(msg)
                load_jupyter_server_extension(self)
            with cmd_in_new_dir(PACKAGE_DIR):
                Popen(webpack_hot["command"])



main = launch_new_instance = NteractApp.launch_instance

if __name__ == '__main__':
    main()
