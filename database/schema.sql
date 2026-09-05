CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'JUDGE',
    'USER'
);

CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);

CREATE TYPE draw_status AS ENUM (
    'DRAFT',
    'READY',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE number_status AS ENUM (
    'ELIGIBLE',
    'LUCKY',
    'WON',
    'EXCLUDED'
);

CREATE TYPE selection_type AS ENUM (
    'LUCKY',
    'RANDOM'
);


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    phone VARCHAR(30) UNIQUE,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'USER',

    status user_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- EKUB
-- ============================================================

CREATE TABLE ekubs (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    contribution_amount NUMERIC(12,2) NOT NULL,

    status VARCHAR(30) DEFAULT 'ACTIVE',

    created_by BIGINT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ekub_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);


-- ============================================================
-- EKUB MEMBERS
-- ============================================================

CREATE TABLE ekub_members (
    id BIGSERIAL PRIMARY KEY,

    ekub_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    status VARCHAR(30) DEFAULT 'ACTIVE',

    joined_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_member_ekub
        FOREIGN KEY (ekub_id)
        REFERENCES ekubs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_member_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT unique_ekub_member
        UNIQUE (ekub_id, user_id)
);


-- ============================================================
-- CYCLES
-- ============================================================

CREATE TABLE cycles (
    id BIGSERIAL PRIMARY KEY,

    ekub_id BIGINT NOT NULL,

    cycle_number INTEGER NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE,

    contribution_amount NUMERIC(12,2) NOT NULL,

    status VARCHAR(30) DEFAULT 'UPCOMING',

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cycle_ekub
        FOREIGN KEY (ekub_id)
        REFERENCES ekubs(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_ekub_cycle
        UNIQUE (ekub_id, cycle_number)
);


-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,

    cycle_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    due_date DATE NOT NULL,

    payment_date TIMESTAMP WITH TIME ZONE,

    status VARCHAR(30) DEFAULT 'PENDING',

    payment_reference VARCHAR(100),

    payment_method VARCHAR(50),

    recorded_by BIGINT,

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES cycles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_payment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_payment_recorder
        FOREIGN KEY (recorded_by)
        REFERENCES users(id)
);


-- ============================================================
-- DRAWS
-- ============================================================

CREATE TABLE draws (
    id BIGSERIAL PRIMARY KEY,

    ekub_id BIGINT NOT NULL,

    cycle_id BIGINT,

    draw_number INTEGER NOT NULL,

    title VARCHAR(200),

    status draw_status NOT NULL DEFAULT 'DRAFT',

    min_number INTEGER NOT NULL DEFAULT 1,

    max_number INTEGER NOT NULL DEFAULT 80,

    lucky_spin_count INTEGER NOT NULL DEFAULT 7,

    current_spin INTEGER NOT NULL DEFAULT 0,

    total_winners INTEGER NOT NULL DEFAULT 0,

    created_by BIGINT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    started_at TIMESTAMP WITH TIME ZONE,

    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_draw_ekub
        FOREIGN KEY (ekub_id)
        REFERENCES ekubs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_draw_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES cycles(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_draw_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT valid_number_range
        CHECK (
            min_number >= 1
            AND max_number <= 80
            AND min_number < max_number
        ),

    CONSTRAINT valid_lucky_count
        CHECK (lucky_spin_count >= 0),

    CONSTRAINT unique_ekub_draw
        UNIQUE (ekub_id, draw_number)
);


-- ============================================================
-- DRAW NUMBERS
-- ============================================================
-- Every draw gets numbers 1-80.
--
-- They ALWAYS remain visible on the wheel.
--
-- status determines whether the number CAN be selected.
-- ============================================================

CREATE TABLE draw_numbers (
    id BIGSERIAL PRIMARY KEY,

    draw_id BIGINT NOT NULL,

    number INTEGER NOT NULL,

    status number_status NOT NULL DEFAULT 'ELIGIBLE',

    is_visible BOOLEAN NOT NULL DEFAULT TRUE,

    is_lucky BOOLEAN NOT NULL DEFAULT FALSE,

    lucky_order INTEGER,

    won_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_draw_number_draw
        FOREIGN KEY (draw_id)
        REFERENCES draws(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_draw_number
        CHECK (number >= 1 AND number <= 80),

    CONSTRAINT unique_draw_number
        UNIQUE (draw_id, number)
);


-- ============================================================
-- DRAW RESULTS
-- ============================================================
-- Stores every selected number.
--
-- Example:
--
-- position 1 → 27
-- position 2 → 65
-- position 3 → 7
-- ...
-- position 8 → 42
--
-- Number 42 is selected randomly after lucky numbers finish.
-- ============================================================

CREATE TABLE draw_results (
    id BIGSERIAL PRIMARY KEY,

    draw_id BIGINT NOT NULL,

    draw_number_id BIGINT NOT NULL,

    user_id BIGINT,

    number INTEGER NOT NULL,

    position INTEGER NOT NULL,

    selection_type selection_type NOT NULL,

    spin_number INTEGER NOT NULL,

    selected_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_result_draw
        FOREIGN KEY (draw_id)
        REFERENCES draws(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_number
        FOREIGN KEY (draw_number_id)
        REFERENCES draw_numbers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT unique_result_position
        UNIQUE (draw_id, position),

    CONSTRAINT unique_result_number
        UNIQUE (draw_id, number),

    CONSTRAINT unique_result_spin
        UNIQUE (draw_id, spin_number),

    CONSTRAINT valid_position
        CHECK (position > 0),

    CONSTRAINT valid_spin
        CHECK (spin_number > 0)
);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT,

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(100),

    entity_id BIGINT,

    old_data JSONB,

    new_data JSONB,

    ip_address INET,

    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_status
ON users(status);

CREATE INDEX idx_draws_status
ON draws(status);

CREATE INDEX idx_draw_numbers_draw
ON draw_numbers(draw_id);

CREATE INDEX idx_draw_numbers_status
ON draw_numbers(draw_id, status);

CREATE INDEX idx_draw_numbers_lucky
ON draw_numbers(draw_id, is_lucky);

CREATE INDEX idx_draw_results_draw
ON draw_results(draw_id);

CREATE INDEX idx_draw_results_position
ON draw_results(draw_id, position);

CREATE INDEX idx_draw_results_number
ON draw_results(draw_id, number);

CREATE INDEX idx_audit_entity
ON audit_logs(entity_type, entity_id);