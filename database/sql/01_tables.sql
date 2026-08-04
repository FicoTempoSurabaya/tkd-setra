-- ============================================================
-- Project        : Online Test Web Application
-- File           : 01_tables.sql
-- Description    : Database Tables
-- Database       : PostgreSQL 17
-- Author         : OpenAI
-- Status         : FINAL
-- ============================================================

SET search_path TO public;

-- ============================================================
-- TABLE : administrator
-- ============================================================

CREATE TABLE administrator (
    administrator_id BIGINT GENERATED ALWAYS AS IDENTITY,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : participant
-- ============================================================

CREATE TABLE participant (
    participant_id BIGINT GENERATED ALWAYS AS IDENTITY,

    full_name VARCHAR(150) NOT NULL,

    birth_place VARCHAR(100) NOT NULL,

    birth_date DATE NOT NULL,

    nik VARCHAR(16) NOT NULL,

    address TEXT NOT NULL,

    whatsapp VARCHAR(20) NOT NULL,

    email VARCHAR(150) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : participant_test
-- ============================================================

CREATE TABLE participant_test (
    participant_test_id BIGINT GENERATED ALWAYS AS IDENTITY,

    participant_id BIGINT NOT NULL,

    public_token VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL,

    quiz_duration INTEGER NOT NULL,

    quiz_started_at TIMESTAMPTZ,

    quiz_finished_at TIMESTAMPTZ,

    current_quiz_question_id BIGINT,

    current_game_id BIGINT,

    current_game_started_at TIMESTAMPTZ,

    test_started_at TIMESTAMPTZ,

    test_finished_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : question
-- ============================================================

CREATE TABLE question (
    question_id BIGINT GENERATED ALWAYS AS IDENTITY,

    question_type VARCHAR(50) NOT NULL,

    question_order INTEGER NOT NULL,

    question_text TEXT NOT NULL,

    image_url TEXT,

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : question_option
-- ============================================================

CREATE TABLE question_option (
    question_option_id BIGINT GENERATED ALWAYS AS IDENTITY,

    question_id BIGINT NOT NULL,

    option_order INTEGER NOT NULL,

    option_text TEXT,

    image_url TEXT,

    is_correct BOOLEAN NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : game
-- ============================================================

CREATE TABLE game (
    game_id BIGINT GENERATED ALWAYS AS IDENTITY,

    game_type VARCHAR(50) NOT NULL,

    game_order INTEGER NOT NULL,

    title VARCHAR(255) NOT NULL,

    image_url TEXT,

    duration INTEGER NOT NULL,

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================

-- ============================================================
-- TABLE : search_word_item
-- ============================================================

CREATE TABLE search_word_item (
    search_word_item_id BIGINT GENERATED ALWAYS AS IDENTITY,

    game_id BIGINT NOT NULL,

    word_order INTEGER NOT NULL,

    word VARCHAR(10) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : quiz_answer
-- ============================================================

CREATE TABLE quiz_answer (
    quiz_answer_id BIGINT GENERATED ALWAYS AS IDENTITY,

    participant_test_id BIGINT NOT NULL,

    question_id BIGINT NOT NULL,

    question_option_id BIGINT NOT NULL,

    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================

-- ============================================================
-- TABLE : game_result
-- ============================================================

CREATE TABLE game_result (
    game_result_id BIGINT GENERATED ALWAYS AS IDENTITY,

    participant_test_id BIGINT NOT NULL,

    game_id BIGINT NOT NULL,

    duration INTEGER NOT NULL,

    total_steps INTEGER,

    total_found_words INTEGER,

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : search_word_found
-- ============================================================

CREATE TABLE search_word_found (
    search_word_found_id BIGINT GENERATED ALWAYS AS IDENTITY,

    game_result_id BIGINT NOT NULL,

    search_word_item_id BIGINT NOT NULL,

    found_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : setting
-- ============================================================

CREATE TABLE setting (
    setting_id BIGINT GENERATED ALWAYS AS IDENTITY,

    quiz_duration INTEGER NOT NULL,

    instruction_content JSONB NOT NULL,

    success_content JSONB NOT NULL,

    timeout_content JSONB NOT NULL,

    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- END OF FILE
-- ============================================================