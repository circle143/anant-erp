// create organization
export interface CreateOrganizationRequestBodyInput {
	name: string; // organization name
	email: string; // organization admin email, should be valid email
}

// update organization status
export enum OrganizationStatus {
	ACTIVE = "active",
	INACTIVE = "inactive",
	ARCHIVE = "archive",
}

export interface UpdateOrganizationStatusInput {
	organizationID: string; // id of organization to update
}

export interface UpdateOrganizationStatusRequestBodyInput {
	status: OrganizationStatus; // organization status
}

// get all organizations
export interface GetAllOrganizationsInput {
	cursor: string; // next page cursor
}

// add user to organization
export interface AddUserToOrganizationRequestBodyInput {
	email: string; // should be valid email
}

// update organization details
export interface UpdateOrganizationDetailsRequestBodyInput {
	// require at least one of the value
	name?: string;
	logo?: string; // s3 bucket path
	gst?: string;
}

// update organization user role
export enum UserRole {
	ORGADMIN = "org-admin",
	ORGUSER = "org-user",
}

export interface UpdateOrganizationUserRoleInput {
	email: string; // user to update email, should be valid email
}

export interface UpdateOrganizationUserRoleRequestBodyInput {
	role: UserRole;
}

// get all organization users
export interface GetAllOrganizationUsersInput {
	cursor: string; // next page cursor
}

// remove user from organization
export interface RemoveUserFromOrganizationInput {
	email: string; // valid email address
}

// get my organization
