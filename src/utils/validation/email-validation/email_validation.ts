import { object, string } from "yup";

let emailSchema = object({
	email: string().email().required(),
});

export const validateEmail = (email: string) => {
	try {
		emailSchema.validateSync(
			{ email },
			{
				abortEarly: false,
			}
		);
		return true;
	} catch (err) {
		throw new Error("Invalid email provided.");
	}
};
