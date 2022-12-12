import fp, { PluginMetadata } from "fastify-plugin";
import * as yup from "yup";
import YupPassword from "yup-password";

const yupOptions = {
  strict: false,
  abortEarly: false, // return all errors
  stripUnknown: true, // remove additional properties
  recursive: true,
};

/**
 * This plugins adds custom ajv validation compiler
 */
export default fp(async (fastify) => {
  YupPassword(yup);
  fastify.setValidatorCompiler(({ schema }) => {
    return (data) => {
      try {
        const result = (schema as yup.AnySchema).validateSync(data, yupOptions);
        return { value: result };
      } catch (e: any) {
        let error = e;
        if (e?.inner) {
          error = e.inner.reduce((acc: any, { path, errors }: any) => {
            acc[path] = errors;
            return acc;
          }, {});
        }
        return { error };
      }
    };
  });

  fastify.setSchemaErrorFormatter(
    (errors, _dataVar) => new Error(JSON.stringify(errors) as any)
  );
});

export const autoConfig: PluginMetadata = {
  name: "yoga:fastify-validation-complier",
  fastify: "^4.0.0",
};
