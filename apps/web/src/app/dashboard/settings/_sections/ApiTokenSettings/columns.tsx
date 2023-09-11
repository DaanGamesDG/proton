/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Button } from "@paperplane/ui/button";
import { Checkbox } from "@paperplane/ui/checkbox";
import { DashboardSettingsGetApi, formatDate } from "@paperplane/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2Icon } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";

export const columns: ColumnDef<DashboardSettingsGetApi["tokens"][0]>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} aria-label="Select row" />
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: "name",
		header: "Name"
	},
	{
		accessorKey: "date",
		header: "Created At",
		cell: ({ row }) => {
			const date = row.getValue("date") as Date;
			return <p>{formatDate(date)}</p>;
		}
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { toast } = useToast();
			const name = row.getValue("name") as string;

			async function deleteToken() {
				try {
					await axios.delete("/api/dashboard/tokens", { data: { tokens: [name] } });
					toast({ title: "Token Deleted", description: `${name} has been deleted.` });
				} catch (err) {
					const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
					const error = _error || "n/a";

					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong",
						description: `There was a problem with your request: ${error}`,
						action: (
							<ToastAction altText="Try again" onClick={deleteToken}>
								Try again
							</ToastAction>
						)
					});
				}
			}

			return (
				<div>
					<Button variant="ghost" size="icon" aria-label="Delete Token" onClick={deleteToken}>
						<Trash2Icon />
					</Button>
				</div>
			);
		}
	}
];