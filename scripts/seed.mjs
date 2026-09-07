import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Copy .env.example to .env first.");
}

const sql = neon(process.env.DATABASE_URL);
await sql`
  INSERT INTO teachers (id, display_name, subject, active)
  VALUES
    ('11111111-1111-1111-1111-111111111111', 'Thầy Nguyễn Văn A', 'Toán học', true),
    ('22222222-2222-2222-2222-222222222222', 'Cô Trần Thị B', 'Ngữ văn', true),
    ('33333333-3333-3333-3333-333333333333', 'Thầy Lê Văn C', 'Vật lý', true),
    ('44444444-4444-4444-4444-444444444444', 'Cô Phạm Thị D', 'Tiếng Anh', true),
    ('55555555-5555-5555-5555-555555555555', 'Thầy Hoàng Văn E', 'Hóa học', true)
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    subject = EXCLUDED.subject,
    active = EXCLUDED.active
`;
console.log("Seeded TLTP teachers.");
