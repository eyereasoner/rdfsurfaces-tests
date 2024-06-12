# RDF Surfaces tests

A test kit for [RDF Surfaces](https://w3c-cg.github.io/rdfsurfaces/).

## Run the tests

Clean old

```
./make_examples.sh clean
```

Run all tests

```
./make_examples.sh
```

## Test files

- Test files need to have `.n3s` extensions
- For a test to be a success one of need to be true:
   - Test produces `<urn:example:test> <urn:example:is> true .`
   - Test throws an inference fuse and the test file has the `:FAIL.n3s` extension (e.g. `mytest:FAIL.n3s`)
- For a test to be skipped (e.g. work in progress) use the `:SKIP.n3s` extension (e.g. `myother:SKIP.n3s`)

## Contributors

When contributing new tests, please add your name (we use alphabetical ordening based on first name)

- Doerthe Arndt
- Jos De Roo
- Patrick Hochstenbach
