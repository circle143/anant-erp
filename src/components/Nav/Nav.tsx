import { useAuthenticator } from "@aws-amplify/ui-react";
import React from "react";

const Nav = () => {
	const { user, signOut } = useAuthenticator((context) => [context.user]);

	return (
		<div>
			<button onClick={signOut}>Sign out</button>
		</div>
	);
};

export default Nav;
