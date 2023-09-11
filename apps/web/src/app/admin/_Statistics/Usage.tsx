import { formatBytes } from "@paperplane/utils";
import React from "react";

export interface ServiceProps {
	/** The total storage usage */
	storageUsage: number;

	/** The current CPU usage */
	cpuUsage: number;

	/** The current memory usage */
	memoryUsage: number;

	/** The total available memory */
	memoryTotal: number;
}

export const Usage: React.FC<ServiceProps> = ({ storageUsage, cpuUsage, memoryTotal, memoryUsage }) => {
	return (
		<div className="h-full flex flex-col justify-between max-md:w-full max-md:gap-2">
			<div className="dark:bg-zinc-900 bg-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl flex flex-col justify-center items-center min-w-[16rem] px-2 py-5 max-md:w-full">
				<h1 className="text-5 font-medium">Storage Usage</h1>
				<p className="text-4 font-light">
					<strong className="font-semibold">{formatBytes(storageUsage)}</strong> used
				</p>
			</div>
			<div className="dark:bg-zinc-900 bg-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl flex flex-col justify-center items-center min-w-[16rem] px-2 py-5 max-md:w-full">
				<h1 className="text-5 font-medium">Cpu Usage</h1>
				<p className="text-4 font-light">
					<strong className="font-semibold">{cpuUsage}%</strong> in use
				</p>
			</div>
			<div className="dark:bg-zinc-900 bg-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl flex flex-col justify-center items-center min-w-[16rem] px-2 py-5 max-md:w-full">
				<h1 className="text-5 font-medium">Memory Usage</h1>
				<p className="text-3 font-light">
					<strong className="font-semibold">{formatBytes(memoryUsage)}</strong> of the{" "}
					<strong className="font-semibold">{formatBytes(memoryTotal)}</strong> in use
				</p>
			</div>
		</div>
	);
};
