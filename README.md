# jupyterlab_mermaid_latest_extension

[![GitHub Actions](https://github.com/stellarshenson/jupyterlab_mermaid_latest_extension/actions/workflows/build.yml/badge.svg)](https://github.com/stellarshenson/jupyterlab_mermaid_latest_extension/actions/workflows/build.yml)
[![npm version](https://img.shields.io/npm/v/jupyterlab_mermaid_latest_extension.svg)](https://www.npmjs.com/package/jupyterlab_mermaid_latest_extension)
[![PyPI version](https://img.shields.io/pypi/v/jupyterlab_mermaid_latest_extension.svg)](https://pypi.org/project/jupyterlab_mermaid_latest_extension/)
[![Total PyPI downloads](https://static.pepy.tech/badge/jupyterlab_mermaid_latest_extension)](https://pepy.tech/project/jupyterlab_mermaid_latest_extension)
[![JupyterLab 4](https://img.shields.io/badge/JupyterLab-4-orange.svg)](https://jupyterlab.readthedocs.io/en/stable/)
[![Brought To You By KOLOMOLO](https://img.shields.io/badge/Brought%20To%20You%20By-KOLOMOLO-00ffff?style=flat)](https://kolomolo.com)
[![Donate PayPal](https://img.shields.io/badge/Donate-PayPal-blue?style=flat)](https://www.paypal.com/donate/?hosted_button_id=B4KPBJDLLXTSA)

> [!TIP]
> This extension is part of the [stellars_jupyterlab_extensions](https://github.com/stellarshenson/stellars_jupyterlab_extensions) metapackage. Install all Stellars extensions at once: `pip install stellars_jupyterlab_extensions`

JupyterLab extension that brings the latest version of the Mermaid diagram library to notebook and markdown rendering. JupyterLab ships with an older bundled Mermaid version - this extension replaces it with the current release so you get access to the newest diagram types, syntax features, and bug fixes.

## Features

- **Latest Mermaid version** - always renders diagrams with the newest Mermaid release, independent of JupyterLab's bundled version
- **Notebook support** - render Mermaid diagrams in code cell outputs and markdown cells
- **Markdown file support** - Mermaid fenced code blocks in `.md` files render as diagrams
- **Server extension** - Python backend component for version management and configuration

## Installation

Requires JupyterLab 4.0.0 or higher.

```bash
pip install jupyterlab_mermaid_latest_extension
```

## Uninstall

```bash
pip uninstall jupyterlab_mermaid_latest_extension
```
