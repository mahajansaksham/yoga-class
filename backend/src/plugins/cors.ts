import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
/**
 * This plugins adds cors
 *
 * @see https://github.com/fastify/fastify-cors
 */
export default fp(async (fastify) => {
  fastify.register(fastifyCors, { origin: "*" });
});
