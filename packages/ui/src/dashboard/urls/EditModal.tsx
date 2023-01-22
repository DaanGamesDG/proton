import { PrimaryButton } from "@paperplane/buttons";
import { Input } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import type { ApiUrl } from "@paperplane/utils";
import { Form, Formik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import ReactSwitch from "react-switch";
import { boolean, object, string } from "yup";

interface Props {
	isOpen: boolean;
	url: ApiUrl;

	onClick: () => void;
	onSubmit: (...props: any) => void;
}

export const UrlEditModal: React.FC<Props> = ({ isOpen, url, onClick, onSubmit }) => {
	const [initialValues, setInitialValues] = useState({ name: url.name, visible: url.visible });
	const schema = object({
		name: string()
			.required()
			.test({ test: (str) => (str ? !str.includes(".") && !str.includes("/") : false), message: "Name cannot include a . (dot) or / (slash)" }),
		visible: boolean().required()
	});

	useEffect(() => {
		setInitialValues({ name: url.name, visible: url.visible });
	}, [isOpen]);

	return (
		<Modal isOpen={isOpen} onClick={onClick}>
			<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw]">
				<div>
					<h1 className="text-3xl max-md:text-xl">Edit url details</h1>
					<p className="text-base max-w-[90%] max-md:text-small max-md:font-normal">
						Here you can edit the url name and toggle the visibility on or off.
					</p>
				</div>
				<Formik validationSchema={schema} initialValues={initialValues} onSubmit={onSubmit} enableReinitialize validateOnMount>
					{(formik) => (
						<Form>
							<ul className="w-full mt-4 max-h-[45vh] pr-2 overflow-y-auto max-sm:max-h-[35vh]">
								<li className="w-full">
									<h2 className="text-lg mb-2">Url name</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-full">
											<Input
												type="tertiary"
												placeholder="Url name here..."
												value={formik.values.name}
												className="w-full"
												onChange={(ctx) => formik.setFieldValue("name", ctx.currentTarget.value)}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.name && `* ${formik.errors.name}`}&#8203;
											</p>
										</div>
									</div>
								</li>
								<li className="w-full">
									<h2 className="text-lg mb-2">Visibility</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-fit">
											<ReactSwitch
												checkedIcon={false}
												uncheckedIcon={false}
												onChange={(checked) => formik.setFieldValue("visible", checked)}
												checked={formik.values.visible}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.visible && `* ${formik.errors.visible}`}&#8203;
											</p>
										</div>
									</div>
								</li>
							</ul>
							<PrimaryButton
								type="button"
								className="mt-4"
								disabled={formik.isSubmitting || !formik.isValid}
								onClick={formik.submitForm}
							>
								{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Update Url</>}
							</PrimaryButton>
						</Form>
					)}
				</Formik>
			</div>
		</Modal>
	);
};