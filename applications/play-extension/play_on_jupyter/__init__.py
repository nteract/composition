from .extension import load_jupyter_server_extension

def _jupyter_server_extension_paths():
    return [{
        "module": "play_on_jupyter"
    }]
