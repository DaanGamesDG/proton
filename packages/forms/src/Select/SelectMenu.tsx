import type React from "react";
import ReactSelect, { Props } from "react-select";
import { getCleanProps } from "../utils";
import { SelectInput, SelectControl, SelectMenuComponent, SelectOption, SelectDropdownIndicator, SelectSingleValue } from "./custom";
import type { SelectOption as SelectOptionType } from "./types";
import { SelectMenuStyles } from "./utils";

export interface MenuProps {
	type: keyof typeof SelectMenuStyles;
}

type SelectMenuProps<Option = unknown> = Props<Option> & MenuProps;

export const SelectMenu: React.FC<SelectMenuProps<SelectOptionType>> = (props) => {
	const styles = SelectMenuStyles[props.type];

	return (
		<ReactSelect
			{...getCleanProps(props)}
			className={props.className}
			components={{
				Input: SelectInput,
				Control: (_props) => <SelectControl {..._props} type={props.type} />,
				Menu: (_props) => <SelectMenuComponent {..._props} type={props.type} />,
				Option: (_props) => <SelectOption {..._props} style={props.type} />,
				DropdownIndicator: (_props) => <SelectDropdownIndicator {..._props} type={props.type} />,
				SingleValue: SelectSingleValue,
				IndicatorSeparator: null
			}}
			classNames={{
				clearIndicator: () => "!text-white hover:!text-white-500",
				placeholder: () => "!text-white-600",
				multiValue: () => styles.multiValue,
				multiValueLabel: () => "!text-white",
				multiValueRemove: () => "!bg-transparent text-white hover:text-red transition-colors"
			}}
			styles={{
				input: (base) => ({ ...base, color: "#fff" })
			}}
		/>
	);
};