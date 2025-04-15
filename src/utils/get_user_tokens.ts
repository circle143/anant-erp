import { fetchAuthSession } from "aws-amplify/auth";

export const getAccessToken = async () => {
	return (await fetchAuthSession()).tokens?.accessToken?.toString();
};

export const getIdToken = async () => {
	return (await fetchAuthSession()).tokens?.idToken?.toString(); 
};
export const decodeAccessToken = async () => {
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (!token) return null;

  const payloadBase64 = token.split(".")[1];
  const decodedPayload = JSON.parse(atob(payloadBase64));

  return decodedPayload;
};