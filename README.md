# runtype-schema

[![Coveralls github](https://img.shields.io/coveralls/github/amonks/runtype-schema.svg?style=flat-square)](https://coveralls.io/github/amonks/runtype-schema)
[![npm](https://img.shields.io/npm/v/runtype-schema.svg?style=flat-square)](https://npmjs.com/package/runtype-schema)
[![CircleCI branch](https://img.shields.io/circleci/project/github/amonks/runtype-schema/master.svg?style=flat-square)](https://circleci.com/gh/amonks/runtype-schema)

convert between [json-schema](https://json-schema.org) and [runtypes](https://github.com/pelotom/runtypes) definitions

runtype-schema exports two functions:

- jsonSchemaToRuntype: `(schema: JsonSchema6Definition): Runtype<any>`
- runtypeToJsonSchema: `(runtype: Runtype<any>): JsonSchema6Definition`
