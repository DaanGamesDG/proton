import type React from "react";
import type { Metadata } from "next";
import { PageProps, SearchParams, getProtocol, parseSearchParam } from "@paperplane/utils";
import axios from "axios";
import { headers } from "next/headers";
import { AuthForm } from "./AuthForm";

export const metadata: Metadata = {
	title: "Sign in to your account - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

async function getAuthMode() {
	const host = headers().get("host");
	const response = await axios.get<AuthApiResponse>(`${getProtocol()}${host}/api/auth/accounts`, {
		headers: { "X-PAPERPLANE-API": process.env.INTERNAL_API_KEY }
	});

	return { ...response.data, host: host! };
}

const Page: React.FC<PageProps<undefined, SearchParams<"user" | "type">>> = async ({ searchParams }) => {
	const mode = await getAuthMode();
	const user = parseSearchParam(searchParams.user) || mode.host;

	return (
		<>
			<div className="pr-16 max-sm:pr-0">
				<h1 className="text-lg font-normal">Welcome Back!</h1>
				<h2 className="text-xl">Sign in to your account</h2>
			</div>
			<AuthForm options={mode.options} mode={mode.mode} user={user} />
		</>
	);
};

export default Page;

interface AuthApiResponse {
	options: { value: string; label: string }[];
	mode: "2fa" | "password";
}
