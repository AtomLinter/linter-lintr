module.exports =
  config:
    executablePath:
      type: 'string'
      default: 'R'
      description: 'Full path to binary (e.g. /usr/local/bin/R)'
    linters:
      type: 'string'
      default: 'default_linters'
      description: 'which linters to use on the code'

  activate: ->
    require('atom-package-deps').install()

  provideLinter: ->
    helpers = require('atom-linter')
    path = require('path')

    provider =
      name: 'lintr'
      grammarScopes: ['source.r']
      scope: 'file'
      lintOnFly: true
      lint: (textEditor) ->
        filePath = textEditor.getPath()
        fileText = textEditor.getText() + '\n'
        fileText += '\n' if fileText.slice(-1) isnt '\n'
        return helpers.tempFile path.basename(filePath), fileText, (tmpFilename) ->
          parameters = ['--vanilla', '--slave', '--no-restore', '--no-save', '-e']

          linters = atom.config.get('linter-lintr.linters')
          parameters.push("suppressPackageStartupMessages(library(lintr));lint(commandArgs(TRUE), #{linters})",
              '--args', tmpFilename)

          execPath = atom.config.get('linter-lintr.executablePath')
          return helpers.exec(execPath, parameters, {stream: 'stdout'}).then (result) ->
            toReturn = []
            regex = /.+?:(\d+):(\d+): ((?:error)|(?:warning|style)): (.+)/g

            while (match = regex.exec(result)) isnt null
              line = Number.parseInt(match[1]) - 1 or 0
              col = Number.parseInt(match[2]) - 1 or 0
              toReturn.push({
                type: if match[3] is 'error' then 'Error' else 'Warning'
                severity: if match[3] is 'error' then 'error' else 'warning'
                text: match[4]
                filePath
                range: helpers.rangeFromLineNumber(textEditor, line, col)
              })
            return toReturn
