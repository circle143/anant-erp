"use client";

import React from "react";

import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";

import outputs from "../../amplifyconfiguration.json";
import Nav from "../Nav/Nav";

Amplify.configure(outputs);

import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { sessionStorage } from "aws-amplify/utils";

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);

interface AuthenticationProps {
	children: React.ReactNode;
}

const Authentication = ({ children }: AuthenticationProps) => {
	return (
		<Authenticator hideSignUp={true}>
			{({ signOut, user }) => (
				<>
					<Nav />
					{children}
				</>
			)}
		</Authenticator>
	);
};

export default Authentication;
