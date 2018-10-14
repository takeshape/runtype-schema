import { JSONSchema6Definition } from "json-schema";
import { Runtype } from "runtypes";
import Ajv = require("ajv");
import { create } from "runtypes/lib/runtype";

const validator = new Ajv();

export const jsonSchemaToRuntype = <T>(
  schema: JSONSchema6Definition
): Runtype<T> => {
  const validate = validator.compile(schema);
  return create(function(v: any) {
    if (!validate(v)) throw Error(`v is not a valid ${JSON.stringify(schema)}`);
    return v;
  }, {});
};
