import type React from "react";
import type { Props } from "./index";

export const Logo: React.FC<Props> = ({ height, width }) => {
	const logoWidth = width ?? height ?? 512;
	const logoHeight = height ?? width ?? 512;

	return (
		<svg width={logoWidth} height={logoHeight} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M511.999 206.899C512.317 320.132 419.507 413.903 305.193 414.219L305.404 488.452C305.435 501.115 295.166 511.412 282.463 511.442L80.7682 512C68.0649 512.03 57.7359 501.794 57.7056 489.13L56.4051 23.6092C56.3749 10.9457 66.6433 0.649029 79.3466 0.618878L301.835 0.000816565C416.876 -0.315772 511.666 91.4647 511.999 206.899Z"
				fill="#343434"
			/>
			<path
				d="M479.545 31.1169H479.53C477.262 31.1169 475.114 31.5843 473.148 32.4135L10.2499 215.477C4.53339 217.738 0.586317 223.03 0.0570133 229.151C-0.457167 235.271 2.53717 241.151 7.79996 244.332L116.731 310.408L99.0216 430.953C98.0689 437.421 101.124 443.843 106.765 447.19C109.335 448.712 112.209 449.481 115.082 449.481C118.5 449.481 121.918 448.411 124.776 446.285L221.88 374.193L345.889 449.406C348.46 450.974 351.378 451.758 354.327 451.758C356.233 451.758 358.153 451.426 359.998 450.733C364.656 448.999 368.271 445.245 369.783 440.526L494.759 52.8711C495.409 51.1224 495.757 49.2529 495.757 47.278C495.772 38.3533 488.513 31.1169 479.545 31.1169ZM479.53 47.2931L354.358 435.581L220.988 354.686L220.958 354.731L115.112 433.305L134.364 302.162L16.2537 230.523L479.53 47.2931Z"
				fill="#343434"
			/>
			<path d="M16.2388 230.523L479.53 47.2931L354.343 435.597L16.2388 230.523Z" fill="white" />
			<path d="M479.531 47.2931L220.943 354.731L115.098 433.305L134.349 302.162L479.531 47.2931Z" fill="#DCDCDC" />
		</svg>
	);
};
