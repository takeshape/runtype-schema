import * as runtype from "runtypes";
import Ajv = require("ajv");
import fc from "fast-check";

const validator = new Ajv();

import { runtypeToJsonSchema } from "./src/runtypeToJsonSchema";
import { jsonSchemaToRuntype } from "./src/jsonSchemaToRuntype";

const validJson = fc.jsonObject;
const jsonScalar = () =>
  fc
    .oneof<string | number | boolean | null>(
      fc.constant(null),
      fc.string(),
      fc.double(),
      fc.nat(),
      fc.boolean()
    )
    .filter(
      v => typeof v !== "number" || (!Number.isNaN(v) && Number.isFinite(v))
    );

const testdata: Array<{
  name: string;
  runtype?: runtype.Runtype;
  runtypeGenerator?: fc.Arbitrary<runtype.Runtype>;
}> = [
  {
    name: "string",
    runtype: runtype.String
  },
  { name: "number", runtype: runtype.Number },
  { name: "boolean", runtype: runtype.Boolean },
  { name: "always", runtype: runtype.Always },
  { name: "never", runtype: runtype.Never },
  { name: "void", runtype: runtype.Void },
  {
    name: "literal",
    runtype: runtype.Literal(null),
    runtypeGenerator: jsonScalar().map(s => runtype.Literal(s as any))
  },
  {
    name: "array",
    runtype: runtype.Array(runtype.Literal(null)),
    runtypeGenerator: jsonScalar().map(v => runtype.Array(runtype.Literal(v)))
  },
  {
    name: "record",
    runtype: runtype.Record({
      a: runtype.Literal("a"),
      b: runtype.Literal("b")
    }),
    runtypeGenerator: fc.tuple(jsonScalar(), jsonScalar()).map(([a, b]) =>
      runtype.Record({
        a: runtype.Literal(a),
        b: runtype.Literal(b)
      })
    )
  },
  {
    name: "partial",
    runtype: runtype.Partial({
      a: runtype.Literal("a"),
      b: runtype.Literal("b")
    }),
    runtypeGenerator: fc
      .tuple(jsonScalar(), jsonScalar())
      .map(([a, b]) =>
        runtype.Partial({ a: runtype.Literal(a), b: runtype.Literal(b) })
      )
  },
  {
    name: "dictionary",
    runtype: runtype.Dictionary(runtype.Number),
    runtypeGenerator: jsonScalar().map(v =>
      runtype.Dictionary(runtype.Literal(v))
    )
  },
  {
    name: "tuple",
    runtype: runtype.Tuple(runtype.Literal("a"), runtype.Literal("b"))
  },
  {
    name: "union",
    runtype: runtype.Union(runtype.Number, runtype.String)
  },
  {
    name: "intersect",
    runtype: runtype.Intersect(runtype.String, runtype.Number)
  }
];

const invalidTestdata: {
  name: string;
  runtype: runtype.Runtype<any>;
}[] = [
  { name: "symbol", runtype: runtype.Symbol },
  { name: "function", runtype: runtype.Function },
  {
    name: "constraint",
    runtype: runtype.Constraint(runtype.String, s => s.length > 5)
  },
  { name: "instance of", runtype: runtype.InstanceOf(Object) },
  { name: "brand", runtype: runtype.Brand("brand", runtype.String) },
  { name: "invalid literal", runtype: runtype.Literal([] as any) }
];

describe("runtype to json schema", () => {
  describe("invalid types", () => {
    invalidTestdata.forEach(({ name, runtype: r }) => {
      test(name, () => {
        expect(() => runtypeToJsonSchema(r)).toThrow();
      });
    });
  });

  testdata.forEach(({ name, runtype: r, runtypeGenerator }) => {
    describe(name, () => {
      if (r) {
        test("snapshot", () => {
          const schema = runtypeToJsonSchema(r);
          expect(schema).toMatchSnapshot(name);
        });
      }

      if (r || runtypeGenerator) {
        describe("compatibility", () => {
          if (r) {
            test("given runtype gives same result on any value", () => {
              const schema = runtypeToJsonSchema(r);
              const r2 = jsonSchemaToRuntype(schema);
              try {
                const validate = validator.compile(schema);
                fc.assert(
                  fc.property(validJson(), v => {
                    expect(validate(v)).toBe(r.guard(v));
                    expect(r2.guard(v)).toBe(r.guard(v));
                  })
                );
              } catch (e) {
                console.log(JSON.stringify(schema, null, 2));
                throw e;
              }
            });
          }

          if (runtypeGenerator) {
            test("generated runtype gives same result on any value", () => {
              fc.assert(
                fc.property(runtypeGenerator, fc.jsonObject(), (r, v) => {
                  const schema = runtypeToJsonSchema(r);
                  const r2 = jsonSchemaToRuntype(schema);
                  const validate = validator.compile(schema);
                  expect(validate(v)).toBe(r.guard(v));
                  expect(r2.guard(v)).toBe(r.guard(v));
                })
              );
            });
          }
        });
      }
    });
  });
});
