try:
    from ._version import __version__
except ImportError:
    import warnings
    warnings.warn("Importing 'jupyterlab_mermaid_latest_extension' outside a proper installation.")
    __version__ = "dev"


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "jupyterlab_mermaid_latest_extension"
    }]
