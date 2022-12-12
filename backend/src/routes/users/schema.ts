import * as yup from "yup";

export const SubscriptionBody = yup.object({
  batch: yup
    .string()
    .oneOf(["SIX_TO_SEVEN", "SEVEN_TO_EIGHT", "EIGHT_TO_NINE", "FIVE_TO_SIX"])
    .required(),
});

export const PaymentBody = yup.object({
  mode: yup.string().required(),
});

export type SubscriptionBody = yup.InferType<typeof SubscriptionBody>;
export type PaymentBody = yup.InferType<typeof PaymentBody>;
