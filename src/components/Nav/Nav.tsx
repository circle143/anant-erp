import { getAccessToken } from "@/utils/get_user_tokens";
import { useAuthenticator } from "@aws-amplify/ui-react";
import React from "react";

const Nav = () => {
	const { user, signOut } = useAuthenticator((context) => [context.user]);

	return (
		<div>
			<button onClick={signOut}>Sign out</button>
			<button
				onClick={async () => {
					navigator.clipboard.writeText(
						(await getAccessToken()) ?? ""
					);
				}}
			>
				get access token
			</button>
		</div>
	);
};

export default Nav;
