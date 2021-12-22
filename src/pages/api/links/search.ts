import type { NextApiRequest, NextApiResponse } from "next";
import { chunk, parseQuery, sortLinksArray } from "../../../lib/utils";
import MiniSearch from "minisearch";
import { PrismaClient, Url } from "@prisma/client";

interface Data {
	pages: Url[];
	length: number;
}

const client = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const page = Number(parseQuery(req.query.page ?? "1"));
	const sortType = parseQuery(req.query.sortType ?? "default");
	const search = decodeURIComponent(parseQuery(req.query.search ?? ""));

	let links = await client.url.findMany();

	if (search.length > 0) {
		const searcher = new MiniSearch({
			fields: ["id", "url"],
			storeFields: ["id", "url", "date"]
		});

		searcher.addAll(links);
		const results = searcher.search(search);
		links = results.map((result) => links[result.id]);
	}

	const sorted = sortLinksArray(links, sortType);
	const chunks = chunk(sorted, 25);
	res.send({ pages: chunks[page - 1] ?? [], length: chunks.length });
}
