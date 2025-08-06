-- Seeder pour les utilisateurs
-- Mot de passe pour tous les utilisateurs: password123

INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES
('admin', 'admin@pressing.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin', 'Pressing'),
('employee1', 'employee1@pressing.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 'Jean', 'Dupont'),
('employee2', 'employee2@pressing.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 'Marie', 'Martin');