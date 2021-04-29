import {JSONSchema6Definition, JSONSchema7Definition} from 'json-schema';
import {Runtype} from 'runtypes';
import {create} from 'runtypes/lib/runtype';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export function createAjv(): Ajv {
  const ajv = new Ajv();
  addFormats(ajv);
  return ajv;
}

const validator = createAjv();

export const jsonSchemaToRuntype = <T>(schema: JSONSchema6Definition | JSONSchema7Definition): Runtype<T> => {
  const validate = validator.compile(schema);
  // @ts-expect-error
  return create((v: any) => {
    if (!validate(v)) {
      throw Error(`v is not a valid ${JSON.stringify(schema)}`);
    }
    return v;
  }, {});
};
