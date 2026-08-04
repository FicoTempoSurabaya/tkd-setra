-- ============================================================
-- Project        : Online Test Web Application
-- File           : 03_indexes.sql
-- Description    : Database Indexes
-- Database       : PostgreSQL 17
-- Status         : FINAL
-- ============================================================

BEGIN;

-- ============================================================
-- PARTICIPANT
-- ============================================================

CREATE INDEX idx_participant_full_name
ON participant (full_name);

CREATE INDEX idx_participant_nik
ON participant (nik);

CREATE INDEX idx_participant_birth_date
ON participant (birth_date);

CREATE INDEX idx_participant_status
ON participant (created_at);

-- ============================================================
-- PARTICIPANT_TEST
-- ============================================================

CREATE INDEX idx_participant_test_participant_id
ON participant_test (participant_id);

CREATE INDEX idx_participant_test_public_token
ON participant_test (public_token);

CREATE INDEX idx_participant_test_status
ON participant_test (status);

CREATE INDEX idx_participant_test_test_started_at
ON participant_test (test_started_at);

-- ============================================================
-- QUESTION
-- ============================================================

CREATE INDEX idx_question_type
ON question (question_type);

CREATE INDEX idx_question_status
ON question (status);

CREATE INDEX idx_question_order
ON question (question_order);

-- ============================================================
-- QUESTION_OPTION
-- ============================================================

CREATE INDEX idx_question_option_question_id
ON question_option (question_id);

CREATE INDEX idx_question_option_order
ON question_option (option_order);

-- ============================================================
-- GAME
-- ============================================================

CREATE INDEX idx_game_type
ON game (game_type);

CREATE INDEX idx_game_status
ON game (status);

CREATE INDEX idx_game_order
ON game (game_order);

-- ============================================================
-- SEARCH_WORD_ITEM
-- ============================================================

CREATE INDEX idx_search_word_item_game_id
ON search_word_item (game_id);

CREATE INDEX idx_search_word_item_order
ON search_word_item (word_order);

-- ============================================================
-- QUIZ_ANSWER
-- ============================================================

CREATE INDEX idx_quiz_answer_participant_test_id
ON quiz_answer (participant_test_id);

CREATE INDEX idx_quiz_answer_question_id
ON quiz_answer (question_id);

CREATE INDEX idx_quiz_answer_question_option_id
ON quiz_answer (question_option_id);

CREATE INDEX idx_quiz_answer_answered_at
ON quiz_answer (answered_at);

-- ============================================================
-- GAME_RESULT
-- ============================================================

CREATE INDEX idx_game_result_participant_test_id
ON game_result (participant_test_id);

CREATE INDEX idx_game_result_game_id
ON game_result (game_id);

CREATE INDEX idx_game_result_status
ON game_result (status);

-- ============================================================
-- SEARCH_WORD_FOUND
-- ============================================================

CREATE INDEX idx_search_word_found_game_result_id
ON search_word_found (game_result_id);

CREATE INDEX idx_search_word_found_search_word_item_id
ON search_word_found (search_word_item_id);

-- ============================================================
-- SETTING
-- ============================================================
-- Tidak memerlukan INDEX.
-- Tabel ini hanya memiliki satu baris data.

COMMIT;

-- ============================================================
-- END OF FILE
-- ============================================================