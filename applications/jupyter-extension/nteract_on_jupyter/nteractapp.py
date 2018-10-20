
from subprocess import Popen

from notebook.notebookapp import NotebookApp, flags
from traitlets import Unicode, Bool

import time


from . import EXT_NAME, PACKAGE_DIR
from .config import NteractConfig
from .extension import load_jupyter_server_extension
from .utils import cmd_in_new_dir

webpack_port = 8357

webpack_hot = {"address": 'http://localhost:{webpack_port}/'.format(webpack_port=webpack_port),
               "command": ["yarn", "workspace", "nteract-on-jupyter",
                           "run", "hot", "--port", str(webpack_port)]}
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
                p = Popen(webpack_hot["command"])
                self.log.info('waiting for the hot webpack server to start')
                # Wait a little bit to allow the initial command to run
                # NOTE: It would be better if we could run this on a thread and
                # inform the dev server when it has closed using proc.wait()
                # and an onExit callback
                time.sleep(3)
                exit_code = p.poll()
                if exit_code is None:
                    # The process is up, we're (possibly) good
                    pass
                else:
                    raise Exception(
                        "Webpack dev server exited - return code {exit_code}".format(exit_code=exit_code))

                # Now wait for webpack to have the initial bundle mostly ready
                time.sleep(5)


main = launch_new_instance = NteractApp.launch_instance

if __name__ == '__main__':
    main()
