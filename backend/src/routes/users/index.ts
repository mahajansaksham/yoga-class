import { Batch } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import { omit } from "ramda";
import { PaymentBody, SubscriptionBody } from "./schema";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addHook("preValidation", fastify.isLoggedIn);

  fastify.route({
    method: "GET",
    url: "/me",
    handler: (request, reply) =>
      fastify.prisma.user
        .findUnique({
          where: { id: request.user!.id },
          include: { subscription: true },
        })
        .then((user) => omit(["passwordhash"], user)),
  });

  fastify.route<{ Body: SubscriptionBody }>({
    method: "POST",
    url: "/me/subscribe",
    schema: { body: SubscriptionBody },
    handler: async (request, reply) => {
      const user = (await fastify.prisma.user.findUnique({
        where: { id: request.user!.id },
        include: { subscription: true },
      }))!;

      if (user.subscription !== null) {
        return reply.badRequest("User Already Subscribed");
      }

      await fastify.prisma.subscription.create({
        data: { batch: request.body.batch as Batch, userId: user.id },
      });

      return reply.status(201).send("Done");
    },
  });

  fastify.route<{ Body: SubscriptionBody }>({
    method: "PATCH",
    url: "/me/subscribe",
    schema: { body: SubscriptionBody },
    handler: async (request, reply) => {
      const user = (await fastify.prisma.user.findUnique({
        where: { id: request.user!.id },
        include: { subscription: true },
      }))!;

      if (user.subscription === null) {
        return reply.badRequest("User is not Subscribed");
      }

      await fastify.prisma.subscription.update({
        where: { userId: request.user!.id },
        data: { batch: request.body.batch as Batch },
      });

      return reply.status(200).send("Done");
    },
  });

  const CompletePayment: any = async (request: any, reply: any) => {
    const user = (await fastify.prisma.user.findUnique({
      where: { id: request.user!.id },
      include: { subscription: true },
    }))!;

    if (user.subscription === null) {
      return reply.badRequest("User is not Subscribed");
    }

    if (
      user.subscription.lastPaymentDate !== null &&
      new Date(user.subscription.lastPaymentDate).getMonth() ===
        new Date().getMonth()
    ) {
      return reply.badRequest("Already paid for the month");
    }

    await fastify.prisma.payment.create({
      data: { mode: request.body.mode, subscriptionId: user.subscription.id },
    });

    await fastify.prisma.subscription.update({
      where: { userId: request.user!.id },
      data: { lastPaymentDate: new Date() },
    });

    return reply.status(200).send("Done");
  };

  //? Process Payment Endpoint
  fastify.route<{ Body: PaymentBody }>({
    method: "POST",
    url: "/me/payment",
    schema: { body: PaymentBody },
    handler: CompletePayment,
  });
};

export default root;
