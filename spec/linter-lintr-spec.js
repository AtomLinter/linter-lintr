'use babel';

import { join } from 'path';

const badPath = join(__dirname, 'fixtures', 'bad.R');

describe('The lintr provider for Linter', () => {
  const lint = require(join('..', 'lib', 'main.coffee')).provideLinter().lint;

  beforeEach(() =>
    waitsForPromise(() =>
      atom.packages.activatePackage('linter-lintr')
    )
  );

  it('should be in the packages list', () =>
    expect(atom.packages.isPackageLoaded('linter-lintr')).toBe(true)
  );

  it('should be an active package', () =>
    expect(atom.packages.isPackageActive('linter-lintr')).toBe(true)
  );

  it('reports messages from lintr', () => {
    waitsForPromise(() =>
      atom.workspace.open(badPath).then(editor => lint(editor)).then((messages) => {
        expect(messages.length).toBeGreaterThan(0);

        // test only the first error
        expect(messages[0].type).toBe('Warning');
        expect(messages[0].severity).toBe('warning');
        expect(messages[0].html).not.toBeDefined();
        expect(messages[0].text).toBe('Use <-, not =, for assignment.');
        expect(messages[0].filePath).toBe(badPath);
        expect(messages[0].range).toEqual([[0, 4], [0, 5]]);
      })
    );
  });
});
