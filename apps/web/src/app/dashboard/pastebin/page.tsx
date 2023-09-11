import type React from "react";
import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { getAuthenticationState } from "../_lib/utils";
import { redirect } from "next/navigation";
import { PastebinTable } from "./PastebinTable";

export const metadata: Metadata = {
	title: "Pastebin - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const Page: React.FC = async () => {
	const host = headers().get("host");
	const cookie = cookies().get("PAPERPLANE-AUTH");
	const authenticationState = await getAuthenticationState(host!, cookie?.value);
	if (!authenticationState.domain) redirect("/login");

	return (
		<>
			<div className="w-full">
				<h1 className="text-11 font-bold max-sm:text-center">Pastebin</h1>
			</div>
			<PastebinTable />
		</>
	);
};

export default Page;