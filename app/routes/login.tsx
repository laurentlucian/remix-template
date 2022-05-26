import type { ActionFunction, MetaFunction } from 'remix';
import { useActionData, useSearchParams, Form } from 'remix';
import { prisma as db } from '~/utils/db.server';
import { createUserSession, login, register } from '~/models/session.server';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';

export let meta: MetaFunction = () => {
  return {
    title: 'Login',
    description: '',
  };
};

function validateUsername(username: unknown) {
  if (typeof username !== 'string' || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};

export let action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
  let form = await request.formData();
  let loginType = form.get('loginType');
  let username = form.get('username');
  let password = form.get('password');
  let redirectTo = form.get('redirectTo') || '/';
  if (
    typeof loginType !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return { formError: `Form not submitted correctly.` };
  }

  let fields = { loginType, username, password };
  let fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, fields };

  switch (loginType) {
    case 'login': {
      let user = await login({ username, password });
      if (!user) {
        return {
          fields,
          formError: `Username/Password combination is incorrect`,
        };
      }
      return createUserSession(user.id, redirectTo);
    }
    case 'register': {
      let userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return {
          fields,
          formError: `User with username ${username} already exists`,
        };
      }
      const user = await register({ username, password });
      if (!user) {
        return {
          fields,
          formError: `Something went wrong trying to create a new user.`,
        };
      }
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return { fields, formError: `Login type invalid` };
    }
  }
};

export default function Login() {
  let actionData = useActionData<ActionData | undefined>();
  let [searchParams] = useSearchParams();

  return (
    <Stack>
      <Form method="post" aria-describedby={actionData?.formError ? 'form-error-message' : undefined}>
        <input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? undefined} />
        <FormControl mb={5} as="fieldset">
          <RadioGroup defaultValue="login">
            <HStack>
              <Radio
                name="loginType"
                value="login"
                defaultChecked={!actionData?.fields?.loginType || actionData?.fields?.loginType === 'login'}
              >
                Login
              </Radio>
              <Radio
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={actionData?.fields?.loginType === 'register'}
              >
                Register
              </Radio>
            </HStack>
          </RadioGroup>
        </FormControl>
        <FormControl mb={5} isInvalid={Boolean(actionData?.fieldErrors?.username)}>
          <FormLabel htmlFor="username-input">Username</FormLabel>
          <Input
            type="text"
            name="username"
            defaultValue={actionData?.fields?.username}
            aria-invalid={Boolean(actionData?.fieldErrors?.username)}
            aria-describedby={actionData?.fieldErrors?.username ? 'username-error' : undefined}
          />
          {actionData?.fieldErrors?.username ? (
            <FormErrorMessage role="alert">{actionData?.fieldErrors.username}</FormErrorMessage>
          ) : null}
        </FormControl>
        <FormControl isInvalid={Boolean(actionData?.fieldErrors?.password)}>
          <FormLabel htmlFor="password-input">Password</FormLabel>
          <Input
            name="password"
            defaultValue={actionData?.fields?.password}
            type="password"
            aria-invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
            aria-describedby={actionData?.fieldErrors?.password ? 'password-error' : undefined}
          />
          {actionData?.fieldErrors?.password ? (
            <FormErrorMessage role="alert">{actionData?.fieldErrors.password}</FormErrorMessage>
          ) : null}
        </FormControl>
        {actionData?.formError ? (
          <p className="form-validation-error" role="alert">
            {actionData?.formError}
          </p>
        ) : null}
        <Button mt={5} type="submit">
          Submit
        </Button>
      </Form>
    </Stack>
  );
}
