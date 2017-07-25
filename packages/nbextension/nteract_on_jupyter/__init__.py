from .extension import load_jupyter_server_extension

def _jupyter_server_extension_paths():
    return [{
        "module": "nteract_on_jupyter"
}]
