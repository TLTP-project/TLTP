export const logger = {
  info: (event: string, metadata?: Record<string, unknown>) => console.info(event, metadata),
  error: (event: string, metadata?: Record<string, unknown>) => console.error(event, metadata),
};
