-- Drop existing tables in correct order (foreign keys first)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS applications;

-- Applications table
CREATE TABLE applications (
    id uuid PRIMARY KEY default gen_random_uuid(),
    app_name VARCHAR NOT NULL,
    app_key VARCHAR NOT NULL,
    allowed_domains JSON, -- Array of strings

    -- timestamps
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL
);

-- Users table
CREATE TABLE users (
    id uuid PRIMARY KEY default gen_random_uuid(),
    display_name VARCHAR,
    email VARCHAR,
    avatar_path VARCHAR,

    application_id uuid NOT NULL REFERENCES applications(id) on delete cascade,

    -- User stats
    is_banned BOOLEAN NOT NULL default false,

    -- timestamps
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL
);

-- Comments table
CREATE TABLE comments (
    id uuid PRIMARY KEY default gen_random_uuid(),
    owner_resource_identifier VARCHAR NOT NULL,
    body VARCHAR NOT NULL,

    -- Reference to users table
    user_id uuid NOT NULL REFERENCES users(id),

    -- Nested comments support
    parent_id uuid REFERENCES comments(id),

    -- Associations
    app_id uuid NOT NULL REFERENCES applications(id),

    -- Timestamps
    created_at BIGINT NOT NULL,
    edited_at BIGINT
);

-- Indexes
CREATE INDEX idx_applications_app_key ON applications(app_key);

CREATE INDEX idx_users_application_id ON users(application_id);
CREATE INDEX idx_users_email ON users(application_id, email);

CREATE INDEX idx_comments_by_page ON comments(app_id, owner_resource_identifier);
CREATE INDEX idx_comments_by_user ON comments(user_id);
CREATE INDEX idx_comments_by_parent ON comments(parent_id);