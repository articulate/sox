# @articulate/sox
[![@articulate/sox](https://img.shields.io/npm/v/@articulate/sox.svg)](https://www.npmjs.com/package/@articulate/sox)
[![Build Status](https://travis-ci.org/articulate/sox.svg?branch=master)](https://travis-ci.org/articulate/sox)
[![Coverage Status](https://coveralls.io/repos/github/articulate/sox/badge.svg?branch=master)](https://coveralls.io/github/articulate/sox?branch=master)

Our super-special sockets stuff.

See the [client](https://github.com/articulate/sox/blob/master/docs/client.md) and [server](https://github.com/articulate/sox/blob/master/docs/server.md) documentation for details and examples.

## Contributing

Changes are tracked & published using [changesets](https://github.com/changesets/changesets).

### Adding a Changeset

1. Create a git branch. Make your desired changes.
1. Run `yarn changeset`. Follow the prompts & specify if your change is a
   major, minor, or patch change.
1. Add all the changes to `.changesets` & commit.
1. Create a Pull Request. Merge into the master branch when ready.

### Publishing to NPM

Changesets will create a "Release" pull request whenever unpublished changesets
are merged into main. When ready to publish to NPM, merge this pull request,
and changes will be automatically published.
