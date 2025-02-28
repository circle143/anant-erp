import { fetchAuthSession } from "aws-amplify/auth";

export const getAccessToken = async () => {
	return (await fetchAuthSession()).tokens?.accessToken?.toString();
};

export const getIdToken = async () => {
	return (await fetchAuthSession()).tokens?.idToken?.toString();
};
