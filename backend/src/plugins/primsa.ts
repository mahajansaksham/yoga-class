import fp, { PluginMetadata } from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp<PluginMetadata>(async (fastify) => {
  const prisma = new PrismaClient();
  await prisma.$connect();

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async (server) => {
    await server.prisma.$disconnect();
  });
});

export const autoConfig: PluginMetadata = {
  name: "yoga:fastify-prisma",
  fastify: "^4.0.0",
};
