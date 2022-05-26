import type { PropsWithChildren, ReactElement } from 'react';
import type { User } from '@prisma/client';
import { Box, Flex } from '@chakra-ui/react';
import Nav from './Nav';

type AppLayoutProps = {
  user: User | null;
};

export default function Layout({ user, children }: PropsWithChildren<AppLayoutProps>): ReactElement {
  return (
    <Flex justify="center">
      <Box minW={500}>
        <Nav user={user} />
        {children}
      </Box>
    </Flex>
  );
}
