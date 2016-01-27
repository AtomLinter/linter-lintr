'use babel';

describe('The lintr provider for Linter', () => {
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
});
