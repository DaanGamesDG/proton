import type { Response, Request } from "express";
import ms from "ms";
import { Auth } from "../../lib/Auth.js";
import type { CreateUserFormBody, Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const domains = await server.prisma.signupDomain.findMany();

	if (req.method === "GET") {
		res.send({
			defaults: {
				extensions: server.envConfig.extensionsList,
				extensionsMode: server.envConfig.extensionsMode,
				maxStorage: server.envConfig.maxStorage,
				maxUploadSize: server.envConfig.maxUpload,
				auditlog: server.envConfig.auditLogDuration
			},
			domains: domains.map((domain) => domain.domain)
		});

		return;
	}

	if (req.method === "POST") {
		const data = req.body as Required<CreateUserFormBody>;
		if (!data.domain || !domains.map((domain) => domain.domain).includes(data.domain)) {
			res.status(400).send({ message: "Invalid sign-up domain provided" });
			return;
		}

		const DOMAIN_REGEX = /[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?/g;
		const extensionRes = (data.extension ?? "").match(DOMAIN_REGEX) ?? [];
		data.extension = extensionRes[0] ?? "";

		if (data.domain.startsWith("*.") && !data.extension.length) {
			res.status(400).send({ message: "Invalid sign-up subdomain provided" });
			return;
		}

		if (!["block", "pass"].includes(data.extensionsMode)) {
			res.status(400).send({ message: "Invalid extensionMode provided" });
			return;
		}

		const auditlog = ms(data.auditlog);
		if (isNaN(auditlog)) {
			res.status(400).send({ message: "Invalid auditlog duration provided" });
			return;
		}

		data.extensions = data.extensions.filter((ext) => ext.startsWith(".") && !ext.endsWith("."));
		const domain = data.domain.startsWith("*.") ? `` : data.domain;

		await server.domains.create({
			disabled: false,
			domain,
			extensionsList: data.extensions.join(","),
			extensionsMode: data.extensionsMode,
			maxStorage: data.storage,
			maxUploadSize: data.uploadSize,
			auditlogDuration: data.auditlog
		});

		res.sendStatus(204);
		return;
	}

	if (req.method === "PUT") {
		// TODO: Add PUT method
	}
}

export const methods: RequestMethods[] = ["get", "post"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];
