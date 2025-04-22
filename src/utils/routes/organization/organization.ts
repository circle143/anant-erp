import { validateEmail } from "@/utils/validation/email-validation/email_validation";
import {
	AddUserToOrganizationRequestBodyInput,
	CreateOrganizationRequestBodyInput,
	GetAllOrganizationsInput,
	GetAllOrganizationUsersInput,
	RemoveUserFromOrganizationInput,
	UpdateOrganizationDetailsRequestBodyInput,
	UpdateOrganizationStatusInput,
	UpdateOrganizationStatusRequestBodyInput,
	UpdateOrganizationUserRoleInput,
	UpdateOrganizationUserRoleRequestBodyInput,
} from "./types";

function getBasePath() {
	return "/organization";
}

export const organization = {
	createOrganization: {
		getEndpoint: () => {
			return getBasePath() + "/";
		},
		getReqBody: (input: CreateOrganizationRequestBodyInput) => {
			validateEmail(input.email);
			return JSON.stringify(input);
		},
		requestMethod: "POST",
	},
	updateOrganizationStatus: {
		getEndpoint: (input: UpdateOrganizationStatusInput) => {
			return getBasePath() + `/${input.organizationID}/status`;
		},
		getReqBody: (input: UpdateOrganizationStatusRequestBodyInput) => {
			return JSON.stringify(input.status);
		},
		requestMethod: "PATCH",
	},
	getAllOrganizations: {
		getEndpoint: (input: GetAllOrganizationsInput | null = null) => {
			if (!input || input.cursor.trim().length == 0) return getBasePath();
			return getBasePath() + `?cursor=${input.cursor}`;
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	addUserToOrganization: {
		getEndpoint: () => {
			return getBasePath() + "/user";
		},
		getReqBody: (input: AddUserToOrganizationRequestBodyInput) => {
			validateEmail(input.email);
			return JSON.stringify(input);
		},
		requestMethod: "POST",
	},
	updateOrganizationDetails: {
		getEndpoint: () => {
			return getBasePath() + "/details";
		},
		getReqBody: (input: UpdateOrganizationDetailsRequestBodyInput) => {
			const { name, logo, gst } = input;
			if (!name && !logo && !gst) {
				throw new Error(
					"Require at least one of the values to update."
				);
			}

			return JSON.stringify(input);
		},
		reqestMethod: "PATCH",
	},
	updateOrganizationUserRole: {
		getEndpoint: (input: UpdateOrganizationUserRoleInput) => {
			validateEmail(input.email);
			return getBasePath() + `/user/${input.email}`;
		},
		getReqBody: (input: UpdateOrganizationUserRoleRequestBodyInput) => {
			return JSON.stringify(input);
		},
		requestMethod: "PATCH",
	},
	getAllOrganizationUsers: {
		getEndpoint: (input: GetAllOrganizationUsersInput | null = null) => {
			if (!input || input.cursor.trim().length == 0) return getBasePath();
			return getBasePath() + `/users?cursor=${input.cursor}`;
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	removeUserFromOrganization: {
		getEndpoint: (Input: RemoveUserFromOrganizationInput) => {
			validateEmail(Input.email);
			return getBasePath() + `/user/${Input.email}`;
		},
		getReqBody: () => {
			// no request body requried
		},
		requestMethod: "DELETE",
	},
	getCurrentUserOrganization: {
		getEndpoint: () => {
			return getBasePath() + "/self";
		},
		getReqBody: () => {
			// no request body requried
		},
		requestMethod: "GET",
	},
};
