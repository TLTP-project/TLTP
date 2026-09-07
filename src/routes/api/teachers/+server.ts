import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { listActiveTeachers } from "$lib/server/repository";

export const GET: RequestHandler = async () => json({ teachers: await listActiveTeachers() });
