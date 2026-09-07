declare global {
  namespace App {
    interface Locals {
      session: Record<string, unknown> | null;
      user: Record<string, unknown> | null;
    }
  }
}

export {};
