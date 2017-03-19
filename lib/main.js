'use babel';

/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { CompositeDisposable } from 'atom';
/* eslint-enable import/no-extraneous-dependencies, import/extensions */

// Internal variables
let executablePath;
let linters;

export default {
  activate() {
    require('atom-package-deps').install('linter-lintr');

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.config.observe('linter-lintr.executablePath', (value) => {
        executablePath = value;
      }),
    );
    this.subscriptions.add(
      atom.config.observe('linter-lintr.linters', (value) => {
        linters = value;
      }),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    const helpers = require('atom-linter');
    const path = require('path');

    return {
      name: 'lintr',
      grammarScopes: ['source.r'],
      scope: 'file',
      lintOnFly: true,
      lint(textEditor) {
        const filePath = textEditor.getPath();
        const fileText = textEditor.getText();
        let lintText = fileText;
        if (!lintText.endsWith('\n')) {
          lintText += '\n';
        }
        return helpers.tempFile(path.basename(filePath), lintText, (tmpFilename) => {
          const parameters = [
            '--vanilla', '--slave',
            '-e',
            `suppressPackageStartupMessages(library(lintr));lint(commandArgs(TRUE), ${linters})`,
            '--args', tmpFilename,
          ];

          return helpers.exec(executablePath, parameters, { stream: 'stdout' }).then((result) => {
            if (textEditor.getText() !== fileText) {
              // Editor contents have changed, tell Linter not to update
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
          });
        });
      },
    };
  },
};
