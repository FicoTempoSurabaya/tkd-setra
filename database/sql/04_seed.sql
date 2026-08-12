-- ============================================================
-- Project        : Online Test Web Application
-- File           : 04_seed.sql
-- Description    : Initial Data
-- Database       : PostgreSQL 17
-- Status         : FINAL
-- ============================================================

BEGIN;

-- ============================================================
-- ADMINISTRATOR
-- ============================================================
-- Password awal harus diganti dengan HASH Argon2 yang sebenarnya.
-- Contoh di bawah hanya placeholder.

INSERT INTO administrator (
    password_hash
)
VALUES (
    '$argon2id$v=19$m=16,t=2,p=1$cEVVaG5wTkxMa01nZ1Exdg$s1lkjkHkM1gzvJSD+iH68g'
);

-- ============================================================
-- SYSTEM SETTING
-- ============================================================

INSERT INTO setting (
    quiz_duration,
    instruction_content,
    success_content,
    timeout_content,
    maintenance_mode
)
VALUES (
    7200,

    '{
        "type":"doc",
        "content":[
            {
                "type":"paragraph",
                "content":[
                    {
                        "type":"text",
                        "text":"Silakan ubah halaman instruksi melalui Dashboard Administrator."
                    }
                ]
            }
        ]
    }'::jsonb,

    '{
        "type":"doc",
        "content":[
            {
                "type":"paragraph",
                "content":[
                    {
                        "type":"text",
                        "text":"Terima kasih telah menyelesaikan seluruh rangkaian tes."
                    }
                ]
            }
        ]
    }'::jsonb,

    '{
        "type":"doc",
        "content":[
            {
                "type":"paragraph",
                "content":[
                    {
                        "type":"text",
                        "text":"Mohon maaf, waktu pengerjaan telah habis."
                    }
                ]
            }
        ]
    }'::jsonb,

    FALSE
);

COMMIT;

-- ============================================================
-- END OF FILE
-- ============================================================