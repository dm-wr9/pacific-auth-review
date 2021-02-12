CREATE TABLE auth_users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(200),
    password VARCHAR(500),
    name VARCHAR(100)
);