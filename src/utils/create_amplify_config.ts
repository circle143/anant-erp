export const getAmplifyConfig = () => {
	const identityPoolId = process.env.NEXT_PUBLIC_IDENTITY_POOL_ID;
	const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
	const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
	const domain = process.env.NEXT_PUBLIC_DOMAIN;

	return {
		aws_project_region: "ap-south-1",
		aws_cognito_identity_pool_id: identityPoolId,
		aws_cognito_region: "ap-south-1",
		aws_user_pools_id: userPoolId,
		aws_user_pools_web_client_id: clientId,
		oauth: {
			domain: domain,
		},
		aws_cognito_username_attributes: ["EMAIL"],
		aws_cognito_social_providers: [],
		aws_cognito_signup_attributes: [],
		aws_cognito_mfa_configuration: "OFF",
		aws_cognito_mfa_types: [],
		aws_cognito_password_protection_settings: {
			passwordPolicyMinLength: 8,
			passwordPolicyCharacters: [
				"REQUIRES_LOWERCASE",
				"REQUIRES_UPPERCASE",
				"REQUIRES_NUMBERS",
				"REQUIRES_SYMBOLS",
			],
		},
		aws_cognito_verification_mechanisms: ["EMAIL"],
		aws_user_files_s3_bucket: "anant-objects",
		aws_user_files_s3_bucket_region: "ap-south-1",
	};
};
