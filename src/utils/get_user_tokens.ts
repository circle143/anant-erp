import { fetchAuthSession } from "aws-amplify/auth";

const getAccessToken = async () => {
	return (await fetchAuthSession()).tokens?.accessToken.toString();
};

const getIdToken = async () => {
	return (await fetchAuthSession()).tokens?.idToken?.toString();
};
