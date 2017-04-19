'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

const path = require('path');
const helpers = require('atom-linter');

export default {
  activate() {
    require('atom-package-deps').install('linter-lintr');

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-lintr.executablePath', (value) => {
      this.executablePath = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-lintr.linters', (value) => {
      this.linters = value;
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'lintr',
      grammarScopes: ['source.r'],
      scope: 'file',
      lintOnFly: true,
      lint: async (textEditor) => {
        const filePath = textEditor.getPath();
        const fileText = textEditor.getText();
        let lintText = fileText;
        if (!lintText.endsWith('\n')) {
          lintText += '\n';
        }
        const parameters = [
          '--vanilla', '--slave',
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
            type: match[3] === 'error' ? 'Error' : 'Warning',
            severity: match[3] === 'error' ? 'error' : 'warning',
            text: match[4],
            filePath,
            range: helpers.generateRange(textEditor, line, col),
          });
          match = regex.exec(result);
        }
        return toReturn;
      },
    };
  },
};
