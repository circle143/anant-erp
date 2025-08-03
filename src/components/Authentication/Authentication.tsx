"use client";

import React, { useState } from "react";

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

				return <>{children}</>;
			}}
		</Authenticator>
	);
};

export default Authentication;
