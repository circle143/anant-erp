"use client";

import React, { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getAccessToken } from "@/utils/get_user_tokens";

import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";

import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { sessionStorage } from "aws-amplify/utils";
import { getAmplifyConfig } from "@/utils/create_amplify_config";
import Loader from "../Loader/Loader";
Amplify.configure(getAmplifyConfig());
cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);

interface AuthenticationProps {
  children: React.ReactNode;
}

const Authentication = ({ children }: AuthenticationProps) => {
  const [loading, setLoading] = useState(true);

  const httpLink = createHttpLink({
    uri: "https://byepbna5h1.execute-api.ap-south-1.amazonaws.com/",
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = (await getAccessToken()) ?? "";
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => {
        if (loading) {
          // simulate loading (you can remove setTimeout if not needed)
          setTimeout(() => setLoading(false), 1000);
          return (
            <div>
              <Loader />
            </div>
          );
        }

        return <ApolloProvider client={client}>{children}</ApolloProvider>;
      }}
    </Authenticator>
  );
};

export default Authentication;
