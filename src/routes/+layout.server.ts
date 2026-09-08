import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals }) => {
  const user = locals.user;

  if (!user || typeof user.id !== "string") {
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      name: typeof user.name === "string" ? user.name : null,
      email: typeof user.email === "string" ? user.email : null,
      image: typeof user.image === "string" ? user.image : null,
    },
  };
};
