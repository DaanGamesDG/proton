import { TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu, type SelectOption } from "@paperplane/forms";
import { BinSortNames, BinSort } from "@paperplane/utils";
import type React from "react";
import { useEffect, useState } from "react";

interface Props {
	pages: number;
	page: number;
	setPage: (page: number) => void;

	setSearch: (search: string) => void;

	sort: BinSort;
	setSort: (sort: BinSort) => void;
}

export const PastebinDashboardToolbar: React.FC<Props> = ({ sort, setSort, page, pages, setPage, setSearch }) => {
	const sortOptions: SelectOption[] = Object.keys(BinSortNames).map((key) => ({
		value: key,
		label: BinSortNames[key as unknown as BinSort]
	}));
	const sortValue: SelectOption = { label: BinSortNames[sort], value: sort.toString() };

	const pageOptions: SelectOption[] = Array(pages)
		.fill(null)
		.map((_, key) => ({ label: `Page ${key + 1}`, value: key.toString() }));
	const pageValue: SelectOption = { label: `Page ${page + 1}`, value: page.toString() };

	const onSortChange = (option: any) => {
		if (typeof option !== "object") return;
		const { value } = option as SelectOption;

		setSort(Number(value));
	};

	const previousPage = () => setPage(page - 1);
	const nextPage = () => setPage(page + 1);
	const onPageChange = (option: any) => {
		if (typeof option !== "object") return;
		const { value } = option as SelectOption;

		setPage(Number(value));
	};

	const [_search, _setSearch] = useState("");
	const [timeout, setTimeoutFn] = useState<NodeJS.Timeout>();
	useEffect(() => {
		const newTimeout = setTimeout(() => {
			setSearch(_search);
			setTimeoutFn(undefined);
		}, 1e3);

		clearTimeout(timeout);
		setTimeoutFn(newTimeout);

		return () => clearTimeout(timeout);
	}, [_search]);

	return (
		<div className="w-full flex justify-between items-center mt-4 gap-4 flex-wrap max-[512px]:flex-col max-[512px]:flex-nowrap">
			<Input type="main" placeholder="Search for a pastebin" onInputCapture={(ctx) => _setSearch(ctx.currentTarget.value)} />
			<div className="flex gap-4">
				<TransparentButton type="button" onClick={previousPage}>
					<i className="fa-solid fa-angle-left text-lg" />
				</TransparentButton>
				<SelectMenu type="main" placeholder="page" options={pageOptions} value={pageValue} onChange={onPageChange} />
				<TransparentButton type="button" onClick={nextPage}>
					<i className="fa-solid fa-angle-right text-lg" />
				</TransparentButton>
			</div>
			<SelectMenu className="w-52" type="main" placeholder="Filter" options={sortOptions} value={sortValue} onChange={onSortChange} />
		</div>
	);
};