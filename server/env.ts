import { z } from "zod";

const schema = z.object({
	PORT: z.coerce.number().int().positive().default(8080),
});

const result = schema.safeParse({
	...process.env,
	/** GitLab and GitHub deployments currently use NODE_PORT. */
	PORT: process.env.NODE_PORT || process.env.PORT
});

if (result.success === false) {
	const message = [
		"Invalid environment variables.",
		JSON.stringify(result.error.flatten().fieldErrors, null, 2),
	].join("\n");
	const error = new Error(message);
	delete error.stack;
	throw error;
}

export const env = result.data;