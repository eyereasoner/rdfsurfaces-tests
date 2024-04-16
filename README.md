# RDF Surfaces tests

A test kit for [RDF Surfaces](https://w3c-cg.github.io/rdfsurfaces/).

## Test files

- Test files need to have `.n3s` extensions
- For a test to be a success on of need to be true:
   - Test produces `<urn:example:test> <urn:example:is> true .`
   - Test throws an inference fuse and the test file has the `:FAIL.n3s` extension
- For a test to be skipped (e.g. work in progress) use the `:SKIP.n3s` extension

## Contributors

When contributing new tests, please add your name (we use alphabetical ordening based on first name)

- Jos De Roo
- Patrick Hochstenbach
