'use babel';

import { join } from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, it } from 'jasmine-fix';

const badPath = join(__dirname, 'fixtures', 'bad.R');
const { lint } = require('../lib/main.js').provideLinter();

describe('The lintr provider for Linter', () => {
  beforeEach(async () => atom.packages.activatePackage('linter-lintr'));

  it('should be in the packages list', () =>
    expect(atom.packages.isPackageLoaded('linter-lintr')).toBe(true));

  it('should be an active package', () =>
    expect(atom.packages.isPackageActive('linter-lintr')).toBe(true));

  it('reports messages from lintr', async () => {
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);
    expect(messages.length).toBeGreaterThan(0);

    // test only the first error
    expect(messages[0].type).toBe('Warning');
    expect(messages[0].severity).toBe('warning');
    expect(messages[0].html).not.toBeDefined();
    expect(messages[0].text).toBe('Use <-, not =, for assignment.');
    expect(messages[0].filePath).toBe(badPath);
    expect(messages[0].range).toEqual([[0, 4], [0, 14]]);
  });
});
