'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

let path;
let helpers;

function loadDeps() {
  if (!helpers) {
    helpers = require('atom-linter');
  }
  if (!path) {
    path = require('path');
  }
}

export default {
  activate() {
    this.idleCallbacks = new Set();
    let depCallbackID;
    const installLinterLintrDeps = () => {
      this.idleCallbacks.delete(depCallbackID);
      require('atom-package-deps').install('linter-lintr');
      loadDeps();
    };
    depCallbackID = window.requestIdleCallback(installLinterLintrDeps);
    this.idleCallbacks.add(depCallbackID);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-lintr.executablePath', (value) => {
      this.executablePath = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-lintr.linters', (value) => {
      this.linters = value;
    }));
  },

  deactivate() {
    this.idleCallbacks.forEach(callbackID => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'lintr',
      grammarScopes: ['source.r'],
      scope: 'file',
      lintsOnChange: true,
      lint: async (textEditor) => {
        loadDeps();
        const filePath = textEditor.getPath();
        const fileText = textEditor.getText();
        let lintText = fileText;
        if (!lintText.endsWith('\n')) {
          lintText += '\n';
        }
        const parameters = [
          '--no-save', '--no-restore', '--no-site-file', '--no-init-file',
          '--slave',
          '-e',
          `suppressPackageStartupMessages(library(lintr));lint(commandArgs(TRUE), ${this.linters})`,
          '--args',
        ];
        const execOpts = {
          stream: 'stdout',
          ignoreExitCode: true,
          timeout: Infinity,
          uniqueKey: `linter-lintr::${filePath}`,
        };
        let result;
        await helpers.tempFile(path.basename(filePath), lintText, async (tmpFilename) => {
          parameters.push(tmpFilename);
          result = await helpers.exec(this.executablePath, parameters, execOpts);
        });
        if (textEditor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update
          return null;
        }
        if (result === null) {
          // A newer invocation has been initiated, tell Linter not to update
          return null;
        }
        const toReturn = [];
        const regex = /.+?:(\d+):(\d+): ((?:error)|(?:warning|style)): (.+)/g;

        let match = regex.exec(result);
        while (match !== null) {
          const line = (Number.parseInt(match[1], 10) - 1) || 0;
          const col = (Number.parseInt(match[2], 10) - 1) || 0;
          toReturn.push({
            severity: match[3] === 'error' ? 'error' : 'warning',
            excerpt: match[4],
            location: {
              file: filePath,
              position: helpers.generateRange(textEditor, line, col),
            },
          });
          match = regex.exec(result);
        }
        return toReturn;
      },
    };
  },
};
