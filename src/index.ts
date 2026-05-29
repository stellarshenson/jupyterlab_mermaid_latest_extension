import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './request';

/**
 * Initialization data for the jupyterlab_mermaid_latest_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_mermaid_latest_extension:plugin',
  description: 'Jupyterlab extension that brings the lates version of the mermaid library to the rendering in notebooks and markdown',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_mermaid_latest_extension is activated!');

    requestAPI<any>('hello', app.serviceManager.serverSettings)
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_mermaid_latest_extension server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
