'use babel';

describe('The lintr provider for Linter', () => {
  beforeEach(() => {
    waitsForPromise(() => {
      return Promise.all([
        atom.packages.activatePackage('linter-lintr')
        atom.packages.activatePackage('language-r')
      ]);
    });
  });

  it('should be in the packages list', () => {
    return expect(atom.packages.isPackageLoaded('linter-lintr')).toBe(true);
  });

  it('should be an active package', () => {
    return expect(atom.packages.isPackageActive('linter-lintr')).toBe(true);
  });
});
