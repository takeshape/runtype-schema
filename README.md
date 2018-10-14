# runtype-schema

[![Coverage Status](https://coveralls.io/repos/github/amonks/runtype-schema/badge.svg?branch=master)](https://coveralls.io/github/amonks/runtype-schema?branch=master)

convert between [json-schema](https://json-schema.org) and [runtypes](https://github.com/pelotom/runtypes) definitions

runtype-schema exports two functions:

- jsonSchemaToRuntype: `(schema: JsonSchema6Definition): Runtype<any>`
- runtypeToJsonSchema: `(runtype: Runtype<any>): JsonSchema6Definition`
