import { Authenticator } from "@fastify/passport";
import fastifySecureSession from "@fastify/secure-session";
import { Subscription, User } from "@prisma/client";
import { hash, verify } from "argon2";
import { preValidationHookHandler } from "fastify";
import fp, { PluginMetadata } from "fastify-plugin";
import jwt from "jsonwebtoken";
import { Strategy as LocalStrategy } from "passport-local";
import { omit } from "ramda";

export const THIRTY_DAY_IN_MILI_SECONDS = 2592000000;

const isLoggedIn: preValidationHookHandler = (request, reply, done) => {
  const token = request.headers.authorization;
  console.log(request.headers);
  if (token === undefined) {
    return reply.unauthorized("No token provided");
  }

  jwt.verify(token.split(" ")[1]!, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return reply.unauthorized("Invalid token");
    }
    request.user = decoded as any;
    done();
  });
};

export default fp<PluginMetadata>(async (fastify) => {
  await fastify.register(fastifySecureSession, {
    cookieName: "yoga-class-session",
    key: [Buffer.from(process.env.COOKIE_KEY!, "hex")],
    cookie: {
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: THIRTY_DAY_IN_MILI_SECONDS,
    },
  });

  const fastifyPassport = new Authenticator();
  await fastify.register(fastifyPassport.initialize());
  await fastify.register(fastifyPassport.secureSession());

  fastifyPassport.use(
    "EMAIL_PASSWORD",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true, session: false },
      (request, email, password, done) => {
        process.nextTick(async () => {
          try {
            const user = await fastify.prisma.user.findUnique({
              where: { email },
              include: { subscription: true },
            });
            const isSignup = request.query.signup;

            if (user === null) {
              if (!isSignup) {
                return done("Incorrect Credentials", null);
              }

              const passwordHash = await hash(password);
              const newUser = await fastify.prisma.user.create({
                data: {
                  email: email,
                  age: request.body.age,
                  name: request.body.name,
                  weight: request.body.weight,
                  passwordHash,
                },
              });

              return done(null, omit(["passwordHash"], newUser));
            }

            if (isSignup) {
              done("User Already Exists", null);
            }

            const isPasswordValid = await verify(user.passwordHash, password);
            if (!isPasswordValid) {
              return done("Incorrect Credentials", null);
            }

            return done(null, omit(["passwordHash"], user));
          } catch (error) {
            console.error(error, "Local Auth");
            return done("Something went wrong. Please try again!", null);
          }
        });
      }
    )
  );

  fastifyPassport.registerUserSerializer(async (user) => JSON.stringify(user));
  fastifyPassport.registerUserDeserializer((session: string) =>
    JSON.parse(session)
  );

  fastify.decorate("passport", fastifyPassport);
  fastify.decorate("isLoggedIn", isLoggedIn);
});

type AuthUser = Omit<
  User & { subscription: Subscription | null },
  "passwordHash"
>;

declare module "fastify" {
  interface FastifyInstance {
    passport: Authenticator;
    isLoggedIn: preValidationHookHandler;
  }

  interface PassportUser extends AuthUser {}
}

export const autoConfig: PluginMetadata = {
  name: "yoga:fastify-passport",
  fastify: "^4.0.0",
  dependencies: ["yoga:fastify-prisma"],
};
