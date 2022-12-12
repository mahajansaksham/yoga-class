import { Box } from "@chakra-ui/react";
import Header from "./components/Header";
import Subscription from "./components/Subscription";

function App() {
  return (
    <Box height="100vh" bg="gray.100">
      <Header />
      <Subscription />
    </Box>
  );
}

export default App;
