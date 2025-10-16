CREATE TABLE IF NOT EXISTS course_material_assignments (
    id SERIAL PRIMARY KEY,
    course_tag_id INTEGER NOT NULL REFERENCES course_tags(id) ON DELETE CASCADE,
    material_tag_id INTEGER NOT NULL REFERENCES material_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_tag_id, material_tag_id)
);


-- Index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_course_material_assignments_course ON course_material_assignments(course_tag_id);
CREATE INDEX IF NOT EXISTS idx_course_material_assignments_material ON course_material_assignments(material_tag_id);


- Algoritma dan Pemrograman
INSERT INTO course_material_assignments (course_tag_id, material_tag_id)
SELECT 
    (SELECT id FROM course_tags WHERE name = 'Algoritma dan Pemrograman'),
    id
FROM material_tags 
WHERE name IN ('Array', 'Linked List', 'Stack', 'Queue', 'Sorting', 'Searching')
ON CONFLICT DO NOTHING;



-- Query untuk melihat hasil assignment
SELECT 
    ct.name as course_name,
    mt.name as material_name
FROM course_material_assignments cma
JOIN course_tags ct ON cma.course_tag_id = ct.id
JOIN material_tags mt ON cma.material_tag_id = mt.id
ORDER BY ct.name, mt.name;


-- Create trigger function untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';


-- Create trigger untuk course_material_assignments
CREATE TRIGGER update_course_material_assignments_updated_at 
    BEFORE UPDATE ON course_material_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();