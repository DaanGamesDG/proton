import type { GetServerSideProps, NextPage } from "next";
import { DashboardDeleteBanner, DashboardLayout, ShortUrlsDashboardToolbar, ShortUrlsTable } from "@paperplane/ui";
import { TertiaryButton } from "@paperplane/buttons";
import { useSwrWithUpdates } from "@paperplane/swr";
import { useEffect, useState } from "react";
import { getProtocol, UrlsApiRes, UrlsSort } from "@paperplane/utils";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";
import type { FormikHelpers } from "formik";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean }>(`${getProtocol()}${context.req.headers.host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-AUTH-KEY": context.req.cookies["PAPERPLANE-AUTH"] }
	});

	if (!stateRes.data.domain)
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};

	return {
		props: {}
	};
};

interface UrlEditValues {
	name: string;
	visible: boolean;
}

const ShortUrlsDashboard: NextPage = () => {
	const [data, setData] = useState<UrlsApiRes>({ entries: [], pages: 0 });
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<UrlsSort>(UrlsSort.DATE_NEW_OLD);

	const [selected, setSelected] = useState<string[]>([]);
	const onSelect = (fileName: string) => {
		if (selected.includes(fileName)) setSelected(selected.filter((str) => str !== fileName));
		else setSelected([...selected, fileName]);
	};

	const swr = useSwrWithUpdates<UrlsApiRes>(`/api/dashboard/urls?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}`);
	useEffect(() => {
		if (swr.data) setData(swr.data);
	}, [swr.data]);

	const cancel = () => setSelected([]);
	const success = async () => {
		const promise = async () => {
			try {
				await axios.delete("/api/dashboard/urls/bulk", { data: { urls: selected } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Removing passengers from the PaperPlane...",
				error: "Unable to remove the passengers :(",
				success: "Passengers removed from the plane!"
			});

			setSelected([]);
			await swr.mutate();
		} catch (error) {}
	};

	const deleteUrl = async (id: string) => {
		const promise = async () => {
			try {
				await axios.delete("/api/dashboard/urls/bulk", { data: { files: [id] } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Removing passengers from the PaperPlane...",
				error: "Unable to remove the passengers :(",
				success: "Passengers removed from the plane!"
			});

			await swr.mutate();
		} catch (error) {}
	};

	const updateUrl = async (id: string, values: UrlEditValues, helpers: FormikHelpers<UrlEditValues>) => {
		const promise = async () => {
			try {
				await axios.post(`/api/dashboard/urls/${id}`, values);
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				helpers.resetForm({
					values,
					errors: Object.keys(values)
						.map((key) => ({ [key]: error }))
						.reduce((a, b) => ({ ...a, ...b }), {})
				});

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Changing a passengers seat...",
				error: "Unable to change the seat :(",
				success: "Seating changed."
			});

			await swr.mutate();
			return true;
		} catch (error) {}

		return false;
	};

	if (swr.error && !swr.data) {
		console.log(swr.error);

		return (
			<DashboardLayout toastInfo={(str) => toast.info(str)}>
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-4xl text-center">An unexpected error occurred</h1>
					<p className="text-base text-center mt-4">Please try again later, if the issue persists contact a developer through Discord!</p>
					<p>(Press the HELP button for more information)</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout toastInfo={(str) => toast.info(str)} className="max-w-[1008px]">
			<div className="w-full flex justify-between items-center">
				<h1 className="text-4xl">Shorturls</h1>
				<TertiaryButton type="button">Create</TertiaryButton>
			</div>
			<ShortUrlsDashboardToolbar
				sort={sort}
				setSort={setSort}
				pages={swr.data?.pages ?? 0}
				page={page}
				setPage={setPage}
				setSearch={setSearch}
			/>
			<ShortUrlsTable
				onSelect={onSelect}
				selected={selected}
				urls={data.entries}
				deleteUrl={deleteUrl}
				updateUrl={updateUrl}
				toastSuccess={toast.success}
			/>
			<DashboardDeleteBanner items={selected} type="shorturl" cancel={cancel} success={success} />
		</DashboardLayout>
	);
};

export default ShortUrlsDashboard;
