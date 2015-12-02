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
    require('atom-package-deps').install('linter-lintr')

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
        fileText = textEditor.getText()
        return helpers.tempFile path.basename(filePath), fileText, (tmpFilename) =>
          parameters = ['--slave', '--restore', '--no-save', '-e']

          linters = atom.config.get('linter-lintr.linters')
          parameters.push('library(lintr);lint(commandArgs(TRUE), #{linters})',
              '--args', tmpFilename)

          execPath = atom.config.get('linter-lintr.executablePath')
          return helpers.exec(execPath, parameters).then (result) ->
            toReturn = []
            regex = /^.+?:(\d+):(\d+): ((?:error)|(?:warning|style)): (.+)/g

            while (match = regex.exec(result)) isnt null
              line = parseInt(match[1]) or 0
              col = parseInt(match[2]) or 0
              toReturn.push({
                type: if match[3] is 'error' then 'Error' else 'Warning'
                text: match[4]
                filePath
              })
            return toReturn
