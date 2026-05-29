import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';
import { IMermaidManager } from '@jupyterlab/mermaid';

import { patchMermaidManager } from './manager';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_mermaid_latest_extension:plugin',
  description:
    'Replaces JupyterLab bundled Mermaid with the latest version via monkey-patch',
  autoStart: true,
  requires: [IMermaidManager],
  optional: [IThemeManager],
  activate: async (
    app: JupyterFrontEnd,
    manager: IMermaidManager,
    themes: IThemeManager | null
  ) => {
    console.log(
      'JupyterLab extension jupyterlab_mermaid_latest_extension is activated!'
    );
    await patchMermaidManager(manager, themes);
    console.log(
      `jupyterlab_mermaid_latest_extension: patched MermaidManager → mermaid ${manager.getMermaidVersion()}`
    );
  }
};

export default plugin;
