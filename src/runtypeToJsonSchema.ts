import {Runtype, Reflect} from 'runtypes';
import {JSONSchema7Definition} from 'json-schema';

const isJsonScalar = (v: any) =>
  ['number', 'string', 'boolean', 'object'].includes(typeof v) &&
  (typeof v !== 'number' || (!Number.isNaN(v) && Number.isFinite(v))) &&
  (typeof v !== 'object' || v === null);

export const runtypeToJsonSchema = <T>(t: Runtype<T> | Reflect): JSONSchema7Definition => {
  const r = t.reflect;
  switch (r.tag) {
    case 'symbol':
    case 'function':
    case 'constraint':
    case 'instanceof':
    case 'brand':
      throw Error(`${r.tag} can't be converted to json schema`);

    case 'always':
      return true;
    case 'never':
      return false;
    case 'void':
      return {enum: [null]};

    case 'boolean':
    case 'number':
    case 'string':
      return {type: r.tag};

    case 'literal':
      if (!isJsonScalar(r.value)) throw Error(`can't make json schema for literal "${JSON.stringify(r.value)}"`);
      if (r.value === null) return {type: 'null'};
      return {enum: [r.value as any]};

    case 'array':
      return {
        type: 'array',
        items: runtypeToJsonSchema(r.element)
      };

    case 'record':
      return {
        type: 'object',
        required: Object.keys(r.fields),
        properties: Object.keys(r.fields).reduce<Record<string, JSONSchema7Definition>>(
          (props, f) => ({...props, [f]: runtypeToJsonSchema(r.fields[f])}),
          {}
        )
      };

    case 'partial':
      return {
        anyOf: [
          {type: 'string'},
          {type: 'number'},
          {type: 'boolean'},
          {type: 'array'},
          {
            type: 'object',
            properties: Object.keys(r.fields).reduce<Record<string, JSONSchema7Definition>>(
              (props, f) => ({
                ...props,
                [f]: runtypeToJsonSchema(r.fields[f])
              }),
              {}
            )
          }
        ]
      };

    case 'dictionary':
      return {
        type: 'object',
        additionalProperties: runtypeToJsonSchema(r.value)
      };

    case 'tuple':
      return {
        type: 'array',
        minItems: r.components.length,
        maxItems: r.components.length,
        items: r.components.map(runtypeToJsonSchema)
      };

    case 'union':
      return {
        anyOf: r.alternatives.map(runtypeToJsonSchema)
      };

    case 'intersect':
      return {
        allOf: r.intersectees.map(runtypeToJsonSchema)
      };

    default:
      // istanbul ignore next
      throw Error(`invalid runtype ${(r as any).tag}`);
  }
};
