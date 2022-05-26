import { Flex, HStack, Link as ChakraLink } from '@chakra-ui/react';
import type { User } from '@prisma/client';
import { Link } from '@remix-run/react';

export default function Nav({ user }: { user: User | null }) {
  return (
    <Flex mx="auto" w={500} as="header" py={7} mb={5} justify="space-between">
      <HStack spacing={4}>
        <ChakraLink as={Link} to="/">
          Home
        </ChakraLink>
        <ChakraLink as={Link} to="/page">
          Page
        </ChakraLink>
      </HStack>
      {user ? (
        <form action="/logout" method="post">
          <ChakraLink as="button" type="submit">
            Logout
          </ChakraLink>
        </form>
      ) : (
        <ChakraLink as={Link} to="/login">
          Login
        </ChakraLink>
      )}
    </Flex>
  );
}
