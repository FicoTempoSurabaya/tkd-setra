-- ============================================================
-- Project        : Online Test Web Application
-- File           : 02_constraints.sql
-- Description    : Primary Key, Foreign Key, Unique Constraint,
--                  and Check Constraint
-- Database       : PostgreSQL 17
-- Status         : FINAL
-- ============================================================

BEGIN;

-- ============================================================
-- PRIMARY KEY
-- ============================================================

ALTER TABLE administrator
    ADD CONSTRAINT pk_administrator
    PRIMARY KEY (administrator_id);

ALTER TABLE participant
    ADD CONSTRAINT pk_participant
    PRIMARY KEY (participant_id);

ALTER TABLE participant_test
    ADD CONSTRAINT pk_participant_test
    PRIMARY KEY (participant_test_id);

ALTER TABLE question
    ADD CONSTRAINT pk_question
    PRIMARY KEY (question_id);

ALTER TABLE question_option
    ADD CONSTRAINT pk_question_option
    PRIMARY KEY (question_option_id);

ALTER TABLE game
    ADD CONSTRAINT pk_game
    PRIMARY KEY (game_id);

ALTER TABLE search_word_item
    ADD CONSTRAINT pk_search_word_item
    PRIMARY KEY (search_word_item_id);

ALTER TABLE quiz_answer
    ADD CONSTRAINT pk_quiz_answer
    PRIMARY KEY (quiz_answer_id);

ALTER TABLE game_result
    ADD CONSTRAINT pk_game_result
    PRIMARY KEY (game_result_id);

ALTER TABLE search_word_found
    ADD CONSTRAINT pk_search_word_found
    PRIMARY KEY (search_word_found_id);

ALTER TABLE setting
    ADD CONSTRAINT pk_setting
    PRIMARY KEY (setting_id);

-- ============================================================
-- FOREIGN KEY
-- ============================================================

ALTER TABLE participant_test
    ADD CONSTRAINT fk_participant_test_participant
    FOREIGN KEY (participant_id)
    REFERENCES participant(participant_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE question_option
    ADD CONSTRAINT fk_question_option_question
    FOREIGN KEY (question_id)
    REFERENCES question(question_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE search_word_item
    ADD CONSTRAINT fk_search_word_item_game
    FOREIGN KEY (game_id)
    REFERENCES game(game_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE quiz_answer
    ADD CONSTRAINT fk_quiz_answer_participant_test
    FOREIGN KEY (participant_test_id)
    REFERENCES participant_test(participant_test_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE quiz_answer
    ADD CONSTRAINT fk_quiz_answer_question
    FOREIGN KEY (question_id)
    REFERENCES question(question_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE quiz_answer
    ADD CONSTRAINT fk_quiz_answer_question_option
    FOREIGN KEY (question_option_id)
    REFERENCES question_option(question_option_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE game_result
    ADD CONSTRAINT fk_game_result_participant_test
    FOREIGN KEY (participant_test_id)
    REFERENCES participant_test(participant_test_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE game_result
    ADD CONSTRAINT fk_game_result_game
    FOREIGN KEY (game_id)
    REFERENCES game(game_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE search_word_found
    ADD CONSTRAINT fk_search_word_found_game_result
    FOREIGN KEY (game_result_id)
    REFERENCES game_result(game_result_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE search_word_found
    ADD CONSTRAINT fk_search_word_found_search_word_item
    FOREIGN KEY (search_word_item_id)
    REFERENCES search_word_item(search_word_item_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

-- ============================================================
-- UNIQUE
-- ============================================================

ALTER TABLE participant
    ADD CONSTRAINT uq_participant_nik
    UNIQUE (nik);

ALTER TABLE participant
    ADD CONSTRAINT uq_participant_email
    UNIQUE (email);

ALTER TABLE participant_test
    ADD CONSTRAINT uq_participant_test_public_token
    UNIQUE (public_token);

ALTER TABLE question
    ADD CONSTRAINT uq_question_question_order
    UNIQUE (question_order);

ALTER TABLE game
    ADD CONSTRAINT uq_game_game_order
    UNIQUE (game_order);

-- ============================================================
-- CHECK CONSTRAINT
-- ============================================================

ALTER TABLE participant
    ADD CONSTRAINT ck_participant_nik
    CHECK (char_length(nik) = 16);

ALTER TABLE participant
    ADD CONSTRAINT ck_participant_whatsapp
    CHECK (char_length(whatsapp) BETWEEN 10 AND 20);

ALTER TABLE participant_test
    ADD CONSTRAINT ck_participant_test_status
    CHECK (
        status IN (
            'Belum Mulai',
            'Sedang Tes',
            'Selesai',
            'Waktu Habis'
        )
    );

ALTER TABLE question
    ADD CONSTRAINT ck_question_type
    CHECK (
        question_type IN (
            'Single Choice Question',
            'Yes/No Question',
            'Image Based Question',
            'Image Based Answer',
            'Likert Scale',
            'Semantic Differential Scale'
        )
    );

ALTER TABLE question
    ADD CONSTRAINT ck_question_status
    CHECK (
        status IN (
            'Aktif',
            'Non Aktif'
        )
    );

ALTER TABLE question
    ADD CONSTRAINT ck_question_order
    CHECK (question_order > 0);

ALTER TABLE question_option
    ADD CONSTRAINT ck_question_option_order
    CHECK (option_order > 0);

ALTER TABLE game
    ADD CONSTRAINT ck_game_type
    CHECK (
        game_type IN (
            'Image Sliding Puzzle',
            'Search Word'
        )
    );

ALTER TABLE game
    ADD CONSTRAINT ck_game_status
    CHECK (
        status IN (
            'Aktif',
            'Non Aktif'
        )
    );

ALTER TABLE game
    ADD CONSTRAINT ck_game_order
    CHECK (game_order > 0);

ALTER TABLE game
    ADD CONSTRAINT ck_game_duration
    CHECK (duration > 0);

ALTER TABLE search_word_item
    ADD CONSTRAINT ck_search_word_item_order
    CHECK (word_order > 0);

ALTER TABLE search_word_item
    ADD CONSTRAINT ck_search_word_item_word
    CHECK (
        char_length(word) BETWEEN 1 AND 10
    );

ALTER TABLE game_result
    ADD CONSTRAINT ck_game_result_duration
    CHECK (duration >= 0);

ALTER TABLE game_result
    ADD CONSTRAINT ck_game_result_steps
    CHECK (
        total_steps IS NULL
        OR total_steps >= 0
    );

ALTER TABLE game_result
    ADD CONSTRAINT ck_game_result_found_words
    CHECK (
        total_found_words IS NULL
        OR total_found_words >= 0
    );

ALTER TABLE game_result
    ADD CONSTRAINT ck_game_result_status
    CHECK (
        status IN (
            'Selesai',
            'Waktu Habis'
        )
    );

ALTER TABLE setting
    ADD CONSTRAINT ck_setting_quiz_duration
    CHECK (quiz_duration > 0);

COMMIT;

-- ============================================================
-- END OF FILE
-- ============================================================