
CREATE TYPE user_role AS ENUM (
    'admin',
    'procurement_officer',
    'vendor',
    'manager'
);
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   TEXT NOT NULL,              
    role            user_role NOT NULL,
    vendor_id       UUID NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ NULL,          
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_vendor_id ON users(vendor_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email_active ON users(email, is_active);
