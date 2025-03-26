"use client";

import React from "react";
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

import Nav from "../Nav/Nav";

Amplify.configure(getAmplifyConfig());

import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { sessionStorage } from "aws-amplify/utils";
import { getAmplifyConfig } from "@/utils/create_amplify_config";

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);

interface AuthenticationProps {
	children: React.ReactNode;
}

const Authentication = ({ children }: AuthenticationProps) => {
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
			{({ signOut, user }) => (
				<>
					<ApolloProvider client={client}>
						<Nav />
						{children}
					</ApolloProvider>
					
				</>
			)}
		</Authenticator>
	);
};

export default Authentication;
