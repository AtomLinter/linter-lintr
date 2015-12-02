# linter-lintr
[![Build Status](https://travis-ci.org/AtomLinter/linter-lintr.svg)](https://travis-ci.org/AtomLinter/linter-lintr)

linter-lintr is a [lintr][] provider for [linter](https://github.com/atom-community/linter).

## Installation
To use this plugin `R` and `lintr` will need to be installed on your
system. If it is not already installed, you can install
[lintr][] by typing the following in your R session:
```R
install.package("lintr")
```

You can then install this package from within Atom or by typing:
```ShellSession
$ apm install linter-lintr
```
_Note: If the `linter` package is not currently installed, it will be installed
for you._

### Settings
You can configure linter-lintr like any [Atom](https://atom.io/) package by
editing the settings in *Atom -> Preferences -> Packages -> linter-lintr*.

Or if you prefer you can use Atom *config.cson* file *~/.atom/config.cson*
(click *Open Your Config* in *Atom* menu).

If you installed `R` in a location not in your `$PATH`, the Settings panel
will let you specify where it lives. For example:

```cson
'linter-lintr':
  'executableDir': '/usr/local/bin/'
```
[lintr]: https://cran.r-project.org/web/packages/lintr/index.html
