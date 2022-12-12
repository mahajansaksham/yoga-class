import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useGlobalContext } from "../context/global";

export default function Header() {
  const { user } = useGlobalContext();

  return (
    <Box as="section">
      <Box as="nav" boxShadow="sm" p="4" bg="white">
        <Flex justify="space-between" flex="1">
          <Heading>Yoga Class</Heading>
          {user === null ? (
            <HStack spacing="3">
              <LoginModal />
              <SignupModal />
            </HStack>
          ) : (
            <Text>{user.name}</Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
}

function LoginModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { login } = useGlobalContext();
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: ({ email, password }) => login(email, password).then(onClose),
  });

  return (
    <>
      <Button variant="ghost" onClick={onOpen}>
        Sign in
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <form onSubmit={formik.handleSubmit}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Login</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box
                py={{ base: "0", sm: "8" }}
                px={{ base: "4", sm: "10" }}
                bg="bg-surface"
                borderRadius={{ base: "none", sm: "xl" }}
              >
                <Stack spacing="6">
                  <Stack spacing="5">
                    <FormControl>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input
                        variant="flushed"
                        id="email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="email">Password</FormLabel>
                      <Input
                        variant="flushed"
                        id="password"
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                      />
                    </FormControl>
                  </Stack>
                </Stack>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={formik.isSubmitting}
              >
                Sign in
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
}

function SignupModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { signup } = useGlobalContext();
  const formik = useFormik({
    initialValues: { email: "", password: "", name: "", age: 0, weight: 0 },
    onSubmit: (values) => signup(values).then(onClose),
  });

  return (
    <>
      <Button colorScheme="facebook" onClick={onOpen}>
        Sign up
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <form onSubmit={formik.handleSubmit}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Sign Up</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box
                py={{ base: "0", sm: "8" }}
                px={{ base: "4", sm: "10" }}
                bg="bg-surface"
                borderRadius={{ base: "none", sm: "xl" }}
              >
                <Stack spacing="6">
                  <Stack spacing="3">
                    <FormControl>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input
                        variant="flushed"
                        id="email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <Input
                        variant="flushed"
                        id="password"
                        name="password"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                      />
                    </FormControl>

                    <HStack spacing="3">
                      <FormControl>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <Input
                          variant="flushed"
                          id="name"
                          type="text"
                          name="name"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel htmlFor="age">Age</FormLabel>
                        <Input
                          variant="flushed"
                          id="age"
                          type="number"
                          name="age"
                          value={formik.values.age}
                          onChange={formik.handleChange}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel htmlFor="weight">Weight</FormLabel>
                      <FormHelperText>in kgs</FormHelperText>
                      <Input
                        variant="flushed"
                        id="weight"
                        type="number"
                        name="weight"
                        value={formik.values.weight}
                        onChange={formik.handleChange}
                      />
                    </FormControl>
                  </Stack>
                </Stack>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={formik.isSubmitting}
              >
                Sign in
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
}
