import type { GetServerSideProps } from "next";
import axios, { AxiosError } from "axios";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { PrimaryButton } from "@paperplane/buttons";
import { useEffect, useState } from "react";
import { getProtocol, SignUpGetApi } from "@paperplane/utils";
import { BackUpCodesModal, TwoFAGetApi } from "@paperplane/ui";
import { object, string } from "yup";
import { Form, Formik, FormikHelpers } from "formik";
import { PulseLoader } from "react-spinners";
import { useRouter } from "next/router";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { NextSeo } from "next-seo";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	try {
		const res = await axios.get<SignUpGetApi>(`${getProtocol()}${ctx.req.headers.host}/api/auth/signup`, {
			headers: { "X-PAPERPLANE-API": process.env.INTERNAL_API_KEY }
		});

		if (res.data.mode === "closed") return { notFound: true };
		if (res.data.type === "2fa")
			return {
				props: {
					domains: res.data.domains.map((dm) => ({ label: dm, value: dm })),
					mode: res.data.mode
				}
			};

		return {
			redirect: { destination: "/signup/password", permanent: true }
		};
	} catch (err) {
		console.log(err);
		return {
			notFound: true
		};
	}
};

interface Props {
	domains: SelectOption[];
	mode: SignUpGetApi["mode"];
}

export default function SignUp({ domains, mode }: Props) {
	const router = useRouter();
	const [selectedDomain, setSelectedDomain] = useState("");
	const isSubdomainDisabled = !selectedDomain.startsWith("*.");

	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [data, setData] = useState<TwoFAGetApi>();

	useEffect(() => {
		if (!data) {
			void axios.post("/api/auth/signup").then((res) => setData(res.data));

			const timeout = setTimeout(() => axios.post("/api/auth/signup").then((res) => setData(res.data)), 9e5);
			return () => clearTimeout(timeout);
		}

		return () => void 0;
	}, [data]);

	const schema = object({
		auth: string().required().length(6, "2FA code must be 6 characters long"),
		extension: string(),
		domain: string()
			.required()
			.oneOf(domains.map((dm) => dm.value)),
		invite: mode === "invite" ? string().required() : string()
	});

	const onClick = () => {
		setBackupCodes([]);
		void router.push("/login");
	};

	const downloadCodes = () => {
		const blob = new Blob([backupCodes.join("\n")], {
			type: "data:application/json;charset=utf-8"
		});
		saveAs(blob, "paperplane-backup-codes.txt");
	};

	const getDomain = (domain: string, extension: string) => {
		if (domain.startsWith("*.")) return `${extension}.${domain.replace("*.", "")}`;
		return domain;
	};

	const onSubmit = async (
		values: {
			auth: string;
			domain: string;
			extension: string;
			invite: string;
		},
		helpers: FormikHelpers<{
			auth: string;
			domain: string;
			extension: string;
			invite: string;
		}>
	) => {
		const promise = async () => {
			try {
				const res = await axios.patch<string[]>("/api/auth/signup", { ...values, key: data?.key });
				setBackupCodes(res.data);
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
				pending: "Creating new user...",
				error: "Failed to create new user :(",
				success: "New user created, please sign-in with your credentials to continue."
			});
		} catch (error) {}
	};

	return (
		<div className="grid place-items-center h-screen bg-login bg-cover bg-center">
			<NextSeo title="Sign Up" />
			<BackUpCodesModal isOpen={Boolean(backupCodes.length)} codes={backupCodes} onClick={onClick} downloadCodes={downloadCodes} />
			<div className="bg-main p-8 rounded-xl flex flex-col gap-y-8 items-center justify-center">
				<div>
					<h1 className="text-lg font-normal">Hello, time to create an account!</h1>
					<h2 className="text-xl">Let&apos;s get you settled!</h2>
				</div>
				<Formik
					validationSchema={schema}
					initialValues={{ auth: "", domain: "", extension: "", invite: "" }}
					onSubmit={onSubmit}
					validateOnMount
				>
					{(formik) => (
						<Form className="flex flex-col gap-y-8 items-center justify-center">
							<div className="w-full gap-y-2 flex flex-col">
								<h3 className="text-lg">Choose a domain</h3>
								<SelectMenu
									type="tertiary"
									options={domains}
									placeholder="Select a domain"
									value={{
										label: formik.values.domain,
										value: formik.values.domain
									}}
									onChange={(opt) => {
										setSelectedDomain((opt as SelectOption).value);
										formik.setFieldValue("domain", (opt as SelectOption).value);
									}}
									className="w-full"
								/>
								<p className="text-red text-left text-small font-normal">{formik.errors.domain && `* ${formik.errors.domain}`}</p>
							</div>
							<div className="w-full gap-y-2 flex flex-col">
								<h3 className="text-lg">Your custom subdomain</h3>
								<Input
									type="tertiary"
									placeholder={isSubdomainDisabled ? "Option not avaiable with this domain" : "Fill in your custom subdomain name"}
									disabled={isSubdomainDisabled}
									aria-disabled={isSubdomainDisabled}
									value={formik.values.extension}
									onChange={(ctx) => formik.setFieldValue("extension", ctx.currentTarget.value)}
								/>
								<p className="text-red text-left text-small font-normal">
									{formik.errors.extension && `* ${formik.errors.extension}`}
								</p>
							</div>
							{mode === "invite" && (
								<div className="w-full gap-y-2 flex flex-col">
									<h3 className="text-lg">Invite Code</h3>
									<Input
										type="tertiary"
										placeholder="Invite code here"
										value={formik.values.invite}
										onChange={(ctx) => formik.setFieldValue("invite", ctx.currentTarget.value)}
									/>
									<p className="text-red text-left text-small font-normal">{formik.errors.invite && `* ${formik.errors.invite}`}</p>
								</div>
							)}
							<div className="w-full flex gap-2 justify-center items-center max-sm:flex-col">
								<img
									src={`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(
										(data?.uri ?? "").replace("DOMAIN_PLACEHOLDER", getDomain(formik.values.domain, formik.values.extension))
									)}`}
									alt="2fa qr-code"
									className="w-24 h-24 bg-white rounded-xl"
								/>
								<p className="max-w-[325px]">
									Scan the QR code with chosen 2FA app and fill in the 6 digit code below. Alternatively, use the following code:{" "}
									<strong>{data?.secret}</strong>
								</p>
							</div>
							<div className="w-full gap-y-2 flex flex-col">
								<h3 className="text-lg">Two Factor Authentication</h3>
								<Input
									type="tertiary"
									placeholder="6 digit code here..."
									value={formik.values.auth}
									onChange={(ctx) => formik.setFieldValue("auth", ctx.currentTarget.value)}
								/>
								<p className="text-red text-left text-small font-normal">{formik.errors.auth && `* ${formik.errors.auth}`}</p>
							</div>
							<PrimaryButton
								type="button"
								className="w-full flex gap-x-3 items-center justify-center"
								disabled={formik.isSubmitting || !formik.isValid}
								onClick={formik.submitForm}
							>
								{formik.isSubmitting ? (
									<PulseLoader color="#fff" />
								) : (
									<>
										Sign Up <i className="fa-solid fa-right-to-bracket" />
									</>
								)}
							</PrimaryButton>
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);
}