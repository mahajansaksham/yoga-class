import { FastifyPluginAsync } from "fastify";

import jwt from "jsonwebtoken";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.route({
    method: "POST",
    url: "/signup",
    onRequest: (request, reply, done) => {
      (request.query as any).signup = true;
      done();
    },
    preValidation: fastify.passport.authenticate("EMAIL_PASSWORD", {
      session: false,
    }),
    handler: (request) => jwt.sign(request.user!, process.env.JWT_SECRET!),
  });

  fastify.route({
    method: "POST",
    url: "/signin",
    preValidation: fastify.passport.authenticate(
      "EMAIL_PASSWORD",
      async (request, reply, error, user) => {
        if (error !== null) {
          return reply.badRequest(error.message);
        }
        await request.login(user, { session: false }).catch((loginError) => {
          return reply.badRequest(loginError?.message || loginError);
        });
      }
    ),
    handler: (request) => jwt.sign(request.user!, process.env.JWT_SECRET!),
  });

  fastify.get("/logout", async (request, reply) => {
    await request.logOut();
    return "Logged Out";
  });
};

export default root;
