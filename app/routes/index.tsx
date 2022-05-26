import { Heading } from '@chakra-ui/react';
import type { User } from '@prisma/client';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from 'remix';
import { getUser } from '~/models/session.server';

export let loader: LoaderFunction = async ({ request }) => {
  let user = await getUser(request);
  let data: { user: User | null } = { user };
  return data;
};

export default function Index() {
  const data = useLoaderData();

  return <Heading size="lg">Hello {data?.user ? data.user.username : 'Anon'}</Heading>;
}
