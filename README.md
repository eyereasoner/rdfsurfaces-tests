# RDF Surfaces tests

A test kit for [RDF Surfaces](https://w3c-cg.github.io/rdfsurfaces/).

## Install

Needs at least an installation of one of the RDF Surfaces implementations:

- [EYE](https://github.com/eyereasoner/eye)
- [Latar](https://github.com/KNowledgeOnWebScale/Latar)
- [tension.js](https://github.com/joachimvh/tension.js)

Edit the configuration file:

```
cp config.json-example config.json
```

## Run the tests

Clean old

```
./make_examples.sh clean
```

Run all tests

```
./make_examples.sh
```

## Run a test for a specific implementation of RDF Surfaces

Clean old

```
./bin/make_examples.js clean
```

Run all tests

```
./bin/make_examples.js lib/tension.js
```

where `lib/tension.js` is a handler for the specific implementation.

Run one test

```
./bin/make_examples.js lib/tension.js test/pure/beetle.n3s
```

## Test files

- Test files need to have `.n3s` extensions
- For a test to be a success one of need to be true:
   - Test produces `<urn:example:test> <urn:example:is> true .`
   - Test throws an inference fuse and the test file has the `:FAIL.n3s` extension (e.g. `mytest:FAIL.n3s`)
- For a test to be skipped (e.g. work in progress) use the `:SKIP.n3s` extension (e.g. `myother:SKIP.n3s`)

## Config

- test_dir : directory with test files
- test_ext : which file extensions to test
- history : activate the history of previous runs
  - history.path : path to history file
  - history.size : size of history
- eye : configuration of the `lib/eye.js` reasoner
- latar : configuration of the `lib/latar.js` reasoner
- tension : configuration of the `lib/tension.js` reasoner

## Contributors

When contributing new tests, please add your name (we use alphabetical ordening based on first name)

- Doerthe Arndt
- Jos De Roo
- Patrick Hochstenbach
