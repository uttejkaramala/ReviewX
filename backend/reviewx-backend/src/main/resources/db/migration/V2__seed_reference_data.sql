-- Seed Finding Categories
INSERT INTO finding_categories (name, description) VALUES
    ('BUG', 'Logic errors, null pointer risks, or incorrect runtime behavior'),
    ('SECURITY', 'Vulnerabilities such as injection flaws, exposed secrets, or unsafe input handling'),
    ('PERFORMANCE', 'Inefficient loops, N+1 queries, memory leaks, or unnecessary object creation'),
    ('CODE_QUALITY', 'Code smells, high complexity, duplicated logic, or poor modularity'),
    ('READABILITY', 'Unclear naming, missing structure, or hard-to-follow control flow'),
    ('BEST_PRACTICE', 'Violations of standard Java or Spring Boot idioms and conventions');

-- Seed Severity Levels (1 = Highest priority)
INSERT INTO severity_levels (name, priority_order) VALUES
    ('CRITICAL', 1),
    ('HIGH', 2),
    ('MEDIUM', 3),
    ('LOW', 4),
    ('INFO', 5);