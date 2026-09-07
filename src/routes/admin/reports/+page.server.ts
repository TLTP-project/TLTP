import type { PageServerLoad } from "./$types";
import { getReports } from "@/features/reports";

export const load: PageServerLoad = async () => ({ reports: await getReports() });
