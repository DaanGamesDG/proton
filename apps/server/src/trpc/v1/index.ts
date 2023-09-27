import { t } from "#trpc/lib.js";
import { AuthRoute } from "./auth/index.js";
import { dashboardRoute } from "./dashboard/index.js";

export const v1Route = t.router({
	auth: AuthRoute,
	dashboard: dashboardRoute
});
