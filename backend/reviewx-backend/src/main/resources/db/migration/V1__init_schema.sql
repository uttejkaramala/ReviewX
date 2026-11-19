-- 1. Users table (ready for future authentication)
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Finding Categories lookup table
CREATE TABLE finding_categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL
);

-- 3. Severity Levels lookup table
CREATE TABLE severity_levels (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    priority_order INT NOT NULL UNIQUE
);

-- 4. Code Reviews table
CREATE TABLE code_reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    submitted_code TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED'
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    summary TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Review Findings table
CREATE TABLE review_findings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES code_reviews(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES finding_categories(id),
    severity_id BIGINT NOT NULL REFERENCES severity_levels(id),
    title VARCHAR(200) NOT NULL,
    explanation TEXT NOT NULL,
    suggested_fix TEXT NULL,
    file_path VARCHAR(500) NULL,
    line_number INT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes on foreign keys and frequently sorted columns
CREATE INDEX idx_code_reviews_user_id ON code_reviews(user_id);
CREATE INDEX idx_code_reviews_created_at ON code_reviews(created_at DESC);
CREATE INDEX idx_review_findings_review_id ON review_findings(review_id);
CREATE INDEX idx_review_findings_severity_id ON review_findings(severity_id);