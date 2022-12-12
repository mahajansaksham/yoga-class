import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Radio,
  RadioGroup,
  Select,
  Text,
} from "@chakra-ui/react";
import { SyntheticEvent } from "react";
import { Batch, useGlobalContext, BatcMapping } from "../context/global";

export default function Subscription() {
  const { user, subscribe, updateSubscription, payment } = useGlobalContext();

  if (user === null) {
    return (
      <Center height="80vh">
        <Text fontWeight="semibold" fontSize="2xl">
          Please Sign up/Log in
        </Text>
      </Center>
    );
  }

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as any);
    subscribe(formData.get("batch") as any);
  }

  function handleUpdate(e: SyntheticEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as any);
    updateSubscription(formData.get("batch") as any);
  }

  function handlePayment(e: SyntheticEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as any);
    payment(formData.get("mode") as any);
  }

  if (user?.subscription === null) {
    return (
      <Center height="80vh" flexDir="column" gap="3">
        <Text fontWeight="semibold" fontSize="2xl">
          No Subscription
        </Text>

        <Divider />
        <Text>Select on of the following batches to subscribe</Text>

        <Flex justifyContent="center" alignItems="center">
          <form onSubmit={handleSubmit}>
            <Select name="batch">
              <option value={Batch.SIX_TO_SEVEN}>6 am - 7 am</option>
              <option value={Batch.SEVEN_TO_EIGHT}>7 am - 8 am</option>
              <option value={Batch.EIGHT_TO_NINE}>8 am - 9 am</option>
              <option value={Batch.FIVE_TO_SIX}>5 pm - 6 pm</option>
            </Select>

            <Button type="submit" mt="3" colorScheme="green">
              Subscribe
            </Button>
          </form>
        </Flex>
      </Center>
    );
  }

  const paymentDue =
    user.subscription.lastPaymentDate === null ||
    new Date(user.subscription.lastPaymentDate).getMonth() !==
      new Date().getMonth();

  return (
    <Center height="80vh" flexDir="column" gap="5">
      <Text fontWeight="semibold" fontSize="2xl">
        Subscription - {BatcMapping[user!.subscription.batch]}
      </Text>
      <Divider />
      <Text fontWeight="semibold">Update Batch</Text>
      <Flex justifyContent="center" alignItems="center">
        <form onSubmit={handleUpdate}>
          <Select name="batch" defaultValue={user?.subscription.batch}>
            <option value={Batch.SIX_TO_SEVEN}>6 am - 7 am</option>
            <option value={Batch.SEVEN_TO_EIGHT}>7 am - 8 am</option>
            <option value={Batch.EIGHT_TO_NINE}>8 am - 9 am</option>
            <option value={Batch.FIVE_TO_SIX}>5 pm - 6 pm</option>
          </Select>

          <Button w="full" type="submit" mt="3" colorScheme="green">
            Update
          </Button>
        </form>
      </Flex>

      <Divider />

      {paymentDue ? (
        <>
          <Text>Payment is due</Text>
          <Flex justifyContent="center" alignItems="center">
            <form onSubmit={handlePayment}>
              <Select name="mode">
                <option value="UPI">UPI</option>
                <option value="Card">Debit/Credit Card</option>
              </Select>
              <Button w="full" type="submit" mt="3" colorScheme="green">
                Pay
              </Button>
            </form>
          </Flex>
        </>
      ) : (
        <Text fontWeight="semibold">Payment for the month has been done</Text>
      )}
    </Center>
  );
}
