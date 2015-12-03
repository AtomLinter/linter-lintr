'use babel';

describe('The lintr provider for Linter', () => {
  beforeEach(() => {
    return waitsForPromise(() => {
      return atom.packages.activatePackage('linter-lintr')
    });
  });

  it('should be in the packages list', () => {
    return expect(atom.packages.isPackageLoaded('linter-lintr')).toBe(true);
  });

  it('should be an active package', () => {
    return expect(atom.packages.isPackageActive('linter-lintr')).toBe(true);
  });
});
