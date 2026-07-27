-- SEED DATA FOR DLCF AFIT SAINTLY INTELLECTUALS HUB

-- Seed AFIT Courses Catalog
INSERT INTO public.courses (id, course_code, course_title, credit_units, department, level) VALUES
('8f3b2023-7a2e-4b6e-8212-321111111111', 'AEE 311', 'Aerodynamics I', 3, 'Aeronautical Engineering', 300),
('9a4c3134-8b3f-5c7f-9323-432222222222', 'MET 201', 'Engineering Thermodynamics', 3, 'Mechanical Engineering', 200),
('7c2a1012-6f1d-3a5e-7101-210000000000', 'EEE 301', 'Electric Circuit Theory II', 3, 'Electrical Engineering', 300),
('6b1a0001-5e0c-2d4d-6000-100000000000', 'GNS 101', 'Use of English', 2, 'General Studies', 100),
('5a099999-4d0b-1c3c-5000-000000000000', 'MET 301', 'Fluid Mechanics II', 3, 'Mechanical Engineering', 300)
ON CONFLICT (course_code) DO NOTHING;
