import { PrimaryButton } from "@paperplane/buttons";
import { Input, SelectMenu, type SelectOption } from "@paperplane/forms";
import { useSwr } from "@paperplane/swr";
import { type SettingsGetApi, formatBytes, STORAGE_UNITS, TIME_UNITS, TIME_UNITS_ARRAY } from "@paperplane/utils";
import axios from "axios";
import { Form, Formik } from "formik";
import ms from "ms";
import type React from "react";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { array, number, object, string } from "yup";

interface Props {
	onSubmit: (...props: any) => void | Promise<void>;
	enableInviteModal: () => void;
}

export interface SettingsForm {
	authMode: "2fa" | "password";
	signUpMode: "closed" | "open" | "invite";

	storage: number;
	storageUnit: (typeof STORAGE_UNITS)[number];

	uploadSize: number;
	uploadSizeUnit: (typeof STORAGE_UNITS)[number];

	extensions: string[];
	extensionsMode: "block" | "pass";

	auditlog: number;
	auditlogUnit: (typeof TIME_UNITS_ARRAY)[number];
}

export const AdminSettingsForm: React.FC<Props> = ({ onSubmit, enableInviteModal }) => {
	const [initValues, setInitValues] = useState<SettingsForm>({
		authMode: "2fa",
		signUpMode: "closed",
		storage: 0,
		storageUnit: "GB",
		uploadSize: 0,
		uploadSizeUnit: "GB",
		extensions: [],
		extensionsMode: "block",
		auditlog: 31,
		auditlogUnit: "d"
	});
	const { data: settingsGetData } = useSwr<SettingsGetApi>("/api/admin/settings", undefined, (url) =>
		axios.get(url, { withCredentials: true }).then((res) => res.data)
	);

	useEffect(() => {
		const getStorage = (storage: number): string[] => {
			const res = formatBytes(storage);
			return res.split(/ +/g);
		};

		if (settingsGetData) {
			const storage = getStorage(settingsGetData.defaults.maxStorage);
			const upload = getStorage(settingsGetData.defaults.maxUploadSize);
			const audit = ms(settingsGetData.defaults.auditlog).split("");

			setInitValues({
				authMode: settingsGetData.defaults.authMode,
				signUpMode: settingsGetData.defaults.signUpMode,
				extensions: settingsGetData.defaults.extensions,
				extensionsMode: settingsGetData.defaults.extensionsMode,
				storage: Number(storage[0]),
				storageUnit: storage[1] as SettingsForm["storageUnit"],
				uploadSize: Number(upload[0]),
				uploadSizeUnit: upload[1] as SettingsForm["uploadSizeUnit"],
				auditlog: Number(audit.filter((str) => !isNaN(Number(str))).reduce((a, b) => a + b, "")),
				auditlogUnit: audit.filter((str) => isNaN(Number(str))).join("") as SettingsForm["auditlogUnit"]
			});
		}
	}, [settingsGetData]);

	const schema = object({
		storage: number().required("Storage is a required option").min(0, "Storage cannot be below 0"),
		storageUnit: string()
			.required()
			.oneOf(STORAGE_UNITS as unknown as string[]),
		uploadSize: number().required("Upload size is a required option").min(0, "Upload size cannot be below 0"),
		uploadSizeUnit: string()
			.required()
			.oneOf(STORAGE_UNITS as unknown as string[]),
		extensions: array(string()).min(0).required(),
		extensionsMode: string().required().oneOf(["block", "pass"]),
		auditlog: number().required("Audit log Duration is a required option").min(0, "Audit log duration cannot be below 0"),
		auditlogUnit: string()
			.required()
			.oneOf(TIME_UNITS_ARRAY as unknown as string[])
	});

	return (
		<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw]">
			<div>
				<h1 className="text-3xl">Settings</h1>
			</div>
			<Formik validationSchema={schema} initialValues={initValues} onSubmit={onSubmit} validateOnMount enableReinitialize>
				{(formik) => (
					<Form>
						<ul className="w-full mt-4 pr-2">
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">Authentication Mode</h2>
									<p className="text-base">
										Change the way people login to PaperPlane, this does not affect the{" "}
										<span className="bg-primary p-1 rounded-xl">Admin Panel</span> login strategy. This will always be a 2FA based
										authentication.
									</p>
								</div>
								<div className="bg-red p-2 rounded-xl my-4">
									⚠️ <strong>Warning</strong>: changing this may have unintended side-effects. This could also lead to accounts
									being compromised if not handled correctly. All accounts will start with the default password or back-up code:
									<span className="bg-main p-1 rounded-xl ml-1">paperplane-cdn</span> if they one or both are unset.
								</div>
								<div className="flex items-center gap-2 w-full">
									<div className="w-full">
										<SelectMenu
											type="tertiary"
											placeholder="Select a mode"
											className="w-full"
											options={["2fa", "password"].map((type) => ({ label: `Mode: ${type}`, value: type }))}
											onChange={(value) => formik.setFieldValue("authMode", (value as SelectOption).value)}
											value={{
												label: `Mode: ${formik.values.authMode}`,
												value: formik.values.authMode
											}}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.authMode && `* ${formik.errors.authMode}`}&#8203;
										</p>
									</div>
								</div>
							</li>
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">Sign Up</h2>
									<p className="text-base">
										Changes the way sign ups are handled. If set to <strong>closed</strong> the signup page is disabled (default).{" "}
										<strong>Open</strong> means the page is open and everyone can create an account (not recommended),{" "}
										<strong>invite</strong> will allow you to generate and hand out invite codes which are then required to sign
										up. These tokens are only usable once.
									</p>
								</div>
								<div className="flex items-center justify-between w-full max-sm:flex-col max-sm:items-start">
									<div className="w-1/4 max-sm:w-1/2">
										<SelectMenu
											type="tertiary"
											placeholder="Select a mode"
											className="w-full"
											options={["closed", "open", "invite"].map((type) => ({ label: `Mode: ${type}`, value: type }))}
											onChange={(value) => formik.setFieldValue("signUpMode", (value as SelectOption).value)}
											value={{
												label: `Mode: ${formik.values.signUpMode}`,
												value: formik.values.signUpMode
											}}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.signUpMode && `* ${formik.errors.signUpMode}`}&#8203;
										</p>
									</div>
									<div>
										<PrimaryButton type="button" onClick={enableInviteModal}>
											Open list of Invite Codes
										</PrimaryButton>
										<p className="text-red text-left text-small font-normal">&#8203;</p>
									</div>
								</div>
							</li>
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">Default Max Storage</h2>
									<p className="text-base">
										This allows you to set the storage limit for PaperPlane accounts when they are created. Note: this does not
										remove files from accounts if the limit is exceeded.
									</p>
								</div>
								<div className="flex items-center gap-2 w-full">
									<div className="w-3/4 max-sm:w-1/2">
										<Input
											type="tertiary"
											formType="number"
											inputMode="decimal"
											placeholder="Storage amount, 0=infinitive"
											className="w-full"
											value={formik.values.storage}
											onChange={(ctx) => formik.setFieldValue("storage", Number(ctx.currentTarget.value))}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.storage && `* ${formik.errors.storage}`}&#8203;
										</p>
									</div>
									<div className="w-1/4 max-sm:w-1/2">
										<SelectMenu
											type="tertiary"
											placeholder="Select a unit"
											className="w-full"
											options={STORAGE_UNITS.map((unit) => ({ value: unit, label: unit }))}
											onChange={(value) => formik.setFieldValue("storageUnit", (value as SelectOption).value)}
											value={{
												label: formik.values.storageUnit,
												value: formik.values.storageUnit
											}}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.storageUnit && `* ${formik.errors.storageUnit}`}&#8203;
										</p>
									</div>
								</div>
							</li>
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">Default Max Upload Size</h2>
									<p className="text-base">
										This allows you to set the Upload Size for PaperPlane accounts when they are created. Note: if you use a
										reverse-proxy like NGINX, make sure to configure an upload limit there too, otherwise this will not work.
									</p>
								</div>
								<div className="flex items-center gap-2 w-full">
									<div className="w-3/4 max-sm:w-1/2">
										<Input
											type="tertiary"
											formType="number"
											inputMode="decimal"
											placeholder="Upload size amount, 0=infinitive"
											className="w-full"
											value={formik.values.uploadSize}
											onChange={(ctx) => formik.setFieldValue("uploadSize", Number(ctx.currentTarget.value))}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.uploadSize && `* ${formik.errors.uploadSize}`}&#8203;
										</p>
									</div>
									<div className="w-1/4 max-sm:w-1/2">
										<SelectMenu
											type="tertiary"
											placeholder="Select a unit"
											className="w-full"
											options={STORAGE_UNITS.map((unit) => ({ value: unit, label: unit }))}
											onChange={(value) => formik.setFieldValue("uploadSizeUnit", (value as SelectOption).value)}
											value={{
												label: formik.values.uploadSizeUnit,
												value: formik.values.uploadSizeUnit
											}}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.uploadSizeUnit && `* ${formik.errors.uploadSizeUnit}`}&#8203;
										</p>
									</div>
								</div>
							</li>
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">Default (Dis)Allowed Extensions</h2>
									<p className="text-base">
										This will allow you to accept/block the upload of certain file extensions (e.x. .png). Please use the
										following format when using this: <strong>{".<extension>,.<extension>,...etc (e.x.: .png,.jpg)."}</strong>
									</p>
								</div>
								<div className="flex items-center gap-2 w-full">
									<div className="w-3/4 max-sm:w-1/2">
										<Input
											type="tertiary"
											formType="text"
											inputMode="text"
											placeholder=".<extension>,...etc (e.x.: .png,.jpg)"
											className="w-full"
											value={formik.values.extensions.join(",")}
											onChange={(ctx) => formik.setFieldValue("extensions", ctx.currentTarget.value.split(","))}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.extensions && `* ${formik.errors.extensions}`}&#8203;
										</p>
									</div>
									<div className="w-1/4 max-sm:w-1/2">
										<SelectMenu
											type="tertiary"
											placeholder="Select a mode"
											className="w-full"
											options={[
												{ label: "Mode: block", value: "block" },
												{ label: "Mode: pass", value: "pass" }
											]}
											onChange={(value) => formik.setFieldValue("extensionsMode", (value as SelectOption).value)}
											value={{
												label: `Mode: ${formik.values.extensionsMode}`,
												value: formik.values.extensionsMode
											}}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.extensionsMode && `* ${formik.errors.extensionsMode}`}&#8203;
										</p>
									</div>
								</div>
							</li>
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">Audit Log Duration</h2>
									<p className="text-base">
										This will determine the for how long the audit logs are visible. By default it is set to 1 month, you can use{" "}
										<strong>0</strong> to set it to infinitive (not recommended).
									</p>
								</div>
								<div className="flex items-center gap-2 w-full">
									<div className="w-3/4 max-sm:w-1/2">
										<Input
											type="tertiary"
											formType="number"
											inputMode="decimal"
											placeholder="Duration, 0=infinitive"
											className="w-full"
											value={formik.values.auditlog}
											onChange={(ctx) => formik.setFieldValue("auditlog", Number(ctx.currentTarget.value))}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.auditlog && `* ${formik.errors.auditlog}`}&#8203;
										</p>
									</div>
									<div className="w-1/4 max-sm:w-1/2">
										<SelectMenu
											type="tertiary"
											placeholder="Select a unit"
											className="w-full"
											options={TIME_UNITS}
											value={TIME_UNITS.find((unit) => unit.value === formik.values.auditlogUnit)}
											onChange={(value) => formik.setFieldValue("auditlogUnit", (value as SelectOption).value)}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.auditlogUnit && `* ${formik.errors.auditlogUnit}`}&#8203;
										</p>
									</div>
								</div>
							</li>
						</ul>
						<PrimaryButton type="button" className="mt-4" disabled={formik.isSubmitting || !formik.isValid} onClick={formik.submitForm}>
							{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Update Default Settings</>}
						</PrimaryButton>
					</Form>
				)}
			</Formik>
		</div>
	);
};