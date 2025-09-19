// routes/courseMaterial.routes.js - JUNCTION TABLE ONLY
const db = require("../models");

module.exports = (app) => {
    
    // ========================================
    // ASSIGNMENT SYSTEM ROUTES (Junction Table)
    // ========================================
    
    // 1. Get assigned materials for a specific course
    app.get("/api/course-material-assignments/course/:courseId/assigned-materials", async (req, res) => {
        try {
            const { courseId } = req.params;
            console.log(`📥 GET assigned materials for course ${courseId}`);
            
            const query = `
                SELECT 
                    mt.id,
                    mt.name,
                    mt.created_at,
                    cma.created_at as assigned_at
                FROM course_material_assignments cma
                JOIN material_tags mt ON cma.material_tag_id = mt.id
                WHERE cma.course_tag_id = $1
                ORDER BY mt.name
            `;
            
            const result = await db.sequelize.query(query, {
                bind: [courseId],
                type: db.sequelize.QueryTypes.SELECT
            });
            
            console.log(`✅ Found ${result.length} assigned materials for course ${courseId}`);
            
            res.json({
                success: true,
                data: result
            });
            
        } catch (error) {
            console.error('❌ Error fetching assigned materials:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil materi yang sudah ditugaskan',
                error: error.message
            });
        }
    });

    // 2. Get unassigned materials for a specific course
    app.get("/api/course-material-assignments/course/:courseId/unassigned-materials", async (req, res) => {
        try {
            const { courseId } = req.params;
            console.log(`📥 GET unassigned materials for course ${courseId}`);
            
            const query = `
                SELECT 
                    mt.id,
                    mt.name,
                    mt.created_at
                FROM material_tags mt
                WHERE mt.id NOT IN (
                    SELECT material_tag_id 
                    FROM course_material_assignments 
                    WHERE course_tag_id = $1
                )
                ORDER BY mt.name
            `;
            
            const result = await db.sequelize.query(query, {
                bind: [courseId],
                type: db.sequelize.QueryTypes.SELECT
            });
            
            console.log(`✅ Found ${result.length} unassigned materials for course ${courseId}`);
            
            res.json({
                success: true,
                data: result
            });
            
        } catch (error) {
            console.error('❌ Error fetching unassigned materials:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil materi yang belum ditugaskan',
                error: error.message
            });
        }
    });

    // 3. Assign multiple materials to a course
    app.post("/api/course-material-assignments/course/:courseId/assign-materials", async (req, res) => {
        try {
            const { courseId } = req.params;
            const { materialTagIds } = req.body;
            
            console.log(`📥 POST assign materials to course ${courseId}:`, materialTagIds);
            
            if (!materialTagIds || !Array.isArray(materialTagIds) || materialTagIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Array material tag IDs diperlukan'
                });
            }
            
            // Verify course exists
            const courseExists = await db.sequelize.query(
                'SELECT id FROM course_tags WHERE id = $1',
                {
                    bind: [courseId],
                    type: db.sequelize.QueryTypes.SELECT
                }
            );
            
            if (courseExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Mata kuliah tidak ditemukan'
                });
            }
            
            const transaction = await db.sequelize.transaction();
            
            try {
                const insertedAssignments = [];
                const skippedAssignments = [];
                
                for (const materialTagId of materialTagIds) {
                    // Check if assignment already exists
                    const existsResult = await db.sequelize.query(
                        'SELECT id FROM course_material_assignments WHERE course_tag_id = $1 AND material_tag_id = $2',
                        {
                            bind: [courseId, materialTagId],
                            type: db.sequelize.QueryTypes.SELECT,
                            transaction
                        }
                    );
                    
                    if (existsResult.length > 0) {
                        skippedAssignments.push(materialTagId);
                        continue;
                    }
                    
                    // Insert new assignment
                    const insertResult = await db.sequelize.query(
                        'INSERT INTO course_material_assignments (course_tag_id, material_tag_id) VALUES ($1, $2) RETURNING *',
                        {
                            bind: [courseId, materialTagId],
                            type: db.sequelize.QueryTypes.INSERT,
                            transaction
                        }
                    );
                    
                    insertedAssignments.push(insertResult[0][0]);
                }
                
                await transaction.commit();
                
                console.log(`✅ Assigned ${insertedAssignments.length} materials, skipped ${skippedAssignments.length}`);
                
                res.status(201).json({
                    success: true,
                    message: `${insertedAssignments.length} materi berhasil ditugaskan`,
                    data: {
                        inserted: insertedAssignments,
                        skipped: skippedAssignments.length,
                        total_processed: materialTagIds.length
                    }
                });
                
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
            
        } catch (error) {
            console.error('❌ Error assigning materials to course:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal menugaskan materi ke mata kuliah',
                error: error.message
            });
        }
    });

    // 4. Remove material assignment from course
    app.delete("/api/course-material-assignments/course/:courseId/material/:materialId", async (req, res) => {
        try {
            const { courseId, materialId } = req.params;
            console.log(`📥 DELETE assignment - Course: ${courseId}, Material: ${materialId}`);
            
            const deleteResult = await db.sequelize.query(
                'DELETE FROM course_material_assignments WHERE course_tag_id = $1 AND material_tag_id = $2 RETURNING *',
                {
                    bind: [courseId, materialId],
                    type: db.sequelize.QueryTypes.DELETE
                }
            );
            
            if (deleteResult[1].rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment tidak ditemukan'
                });
            }
            
            console.log(`✅ Assignment removed successfully`);
            
            res.json({
                success: true,
                message: 'Materi berhasil dihapus dari mata kuliah'
            });
            
        } catch (error) {
            console.error('❌ Error removing material assignment:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal menghapus assignment materi',
                error: error.message
            });
        }
    });

    // 5. Get materials for upload form (untuk halaman upload soal)
    app.get("/api/course-material-assignments/course/:courseId/materials-for-upload", async (req, res) => {
        try {
            const { courseId } = req.params;
            console.log(`📥 GET materials for upload - Course: ${courseId}`);
            
            const query = `
                SELECT 
                    mt.id,
                    mt.name
                FROM course_material_assignments cma
                JOIN material_tags mt ON cma.material_tag_id = mt.id
                WHERE cma.course_tag_id = $1
                ORDER BY mt.name
            `;
            
            const result = await db.sequelize.query(query, {
                bind: [courseId],
                type: db.sequelize.QueryTypes.SELECT
            });
            
            console.log(`✅ Found ${result.length} materials available for upload`);
            
            res.json({
                success: true,
                data: result,
                message: result.length === 0 ? 'Belum ada materi yang ditugaskan untuk mata kuliah ini' : null
            });
            
        } catch (error) {
            console.error('❌ Error fetching materials for upload:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil materi untuk upload',
                error: error.message
            });
        }
    });

    // 6. Get assignment statistics
    app.get("/api/course-material-assignments/statistics", async (req, res) => {
        try {
            console.log(`📥 GET assignment statistics`);
            
            const statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM course_tags) as total_courses,
                    (SELECT COUNT(*) FROM material_tags) as total_materials,
                    (SELECT COUNT(*) FROM course_material_assignments) as total_assignments,
                    (SELECT COUNT(DISTINCT course_tag_id) FROM course_material_assignments) as courses_with_assignments,
                    (SELECT COUNT(DISTINCT material_tag_id) FROM course_material_assignments) as materials_assigned,
                    (SELECT ROUND(AVG(material_count), 2) FROM (
                        SELECT COUNT(material_tag_id) as material_count 
                        FROM course_material_assignments 
                        GROUP BY course_tag_id
                    ) as avg_calc) as avg_materials_per_course
            `;
            
            const result = await db.sequelize.query(statsQuery, {
                type: db.sequelize.QueryTypes.SELECT
            });
            
            console.log(`✅ Statistics calculated`);
            
            res.json({
                success: true,
                data: result[0]
            });
            
        } catch (error) {
            console.error('❌ Error fetching assignment statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil statistik assignment',
                error: error.message
            });
        }
    });

    // 7. Get all assignments overview
    app.get("/api/course-material-assignments/assignments", async (req, res) => {
        try {
            console.log(`📥 GET assignments overview`);
            
            const query = `
                SELECT 
                    ct.id as course_id,
                    ct.name as course_name,
                    COUNT(cma.material_tag_id) as material_count,
                    STRING_AGG(mt.name, ', ' ORDER BY mt.name) as materials
                FROM course_tags ct
                LEFT JOIN course_material_assignments cma ON ct.id = cma.course_tag_id
                LEFT JOIN material_tags mt ON cma.material_tag_id = mt.id
                GROUP BY ct.id, ct.name
                ORDER BY ct.name
            `;
            
            const result = await db.sequelize.query(query, {
                type: db.sequelize.QueryTypes.SELECT
            });
            
            console.log(`✅ Found assignments overview for ${result.length} courses`);
            
            res.json({
                success: true,
                data: result
            });
            
        } catch (error) {
            console.error('❌ Error fetching assignments overview:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil overview assignment',
                error: error.message
            });
        }
    });

    // 8. Bulk update course material assignments
    app.put("/api/course-material-assignments/course/:courseId/bulk-assign", async (req, res) => {
        try {
            const { courseId } = req.params;
            const { materialTagIds } = req.body;
            
            console.log(`📥 PUT bulk assign for course ${courseId}:`, materialTagIds);
            
            if (!materialTagIds || !Array.isArray(materialTagIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'Array material tag IDs diperlukan'
                });
            }
            
            const transaction = await db.sequelize.transaction();
            
            try {
                // Remove all existing assignments for this course
                await db.sequelize.query(
                    'DELETE FROM course_material_assignments WHERE course_tag_id = $1',
                    {
                        bind: [courseId],
                        type: db.sequelize.QueryTypes.DELETE,
                        transaction
                    }
                );
                
                // Insert new assignments
                const insertedAssignments = [];
                
                for (const materialTagId of materialTagIds) {
                    const result = await db.sequelize.query(
                        'INSERT INTO course_material_assignments (course_tag_id, material_tag_id) VALUES ($1, $2) RETURNING *',
                        {
                            bind: [courseId, materialTagId],
                            type: db.sequelize.QueryTypes.INSERT,
                            transaction
                        }
                    );
                    
                    insertedAssignments.push(result[0][0]);
                }
                
                await transaction.commit();
                
                console.log(`✅ Bulk assignment completed. ${insertedAssignments.length} materials assigned`);
                
                res.json({
                    success: true,
                    message: `Assignment berhasil diperbarui. ${insertedAssignments.length} materi ditugaskan`,
                    data: insertedAssignments
                });
                
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
            
        } catch (error) {
            console.error('❌ Error bulk updating assignments:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal memperbarui assignment secara bulk',
                error: error.message
            });
        }
    });

    // ========================================
    // COMPATIBILITY ROUTES 
    // ========================================
    
    // Statistics endpoint for backward compatibility
    app.get("/api/course-material-stats", async (req, res) => {
        try {
            console.log(`📥 GET /api/course-material-stats (compatibility)`);
            
            const courses = await db.courseTag.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            // Get assignments count for each course
            const stats = await Promise.all(courses.map(async (course) => {
                let assignmentCount = 0;
                
                // Get assignments count
                try {
                    const assignmentResult = await db.sequelize.query(
                        'SELECT COUNT(*) as count FROM course_material_assignments WHERE course_tag_id = $1',
                        {
                            bind: [course.id],
                            type: db.sequelize.QueryTypes.SELECT
                        }
                    );
                    assignmentCount = parseInt(assignmentResult[0].count) || 0;
                } catch (assignmentError) {
                    console.log(`⚠️ Could not count assignments for course ${course.id}: ${assignmentError.message}`);
                    assignmentCount = 0;
                }

                return {
                    id: course.id,
                    name: course.name,
                    material_count: assignmentCount.toString(),
                    question_set_count: "0" // Placeholder
                };
            }));

            console.log(`✅ Compatibility statistics calculated for ${stats.length} courses`);
            res.json(stats);

        } catch (error) {
            console.error("❌ Error fetching course statistics:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch course statistics",
                error: error.message
            });
        }
    });

    // ========================================
    // DEBUG ENDPOINTS
    // ========================================

    // Assignment system debug endpoint
    app.get("/api/course-material-assignments/debug", async (req, res) => {
        try {
            console.log(`📥 Assignment debug endpoint called`);
            
            // Check if course_material_assignments table exists
            const tableCheck = await db.sequelize.query(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_material_assignments')",
                { type: db.sequelize.QueryTypes.SELECT }
            );
            
            const tableExists = tableCheck[0].exists;
            
            let tableInfo = null;
            let sampleData = null;
            let counts = null;
            
            if (tableExists) {
                // Get table structure
                tableInfo = await db.sequelize.query(
                    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'course_material_assignments' ORDER BY ordinal_position",
                    { type: db.sequelize.QueryTypes.SELECT }
                );
                
                // Get sample data
                sampleData = await db.sequelize.query(
                    "SELECT * FROM course_material_assignments LIMIT 5",
                    { type: db.sequelize.QueryTypes.SELECT }
                );
                
                // Get counts
                counts = await db.sequelize.query(`
                    SELECT 
                        (SELECT COUNT(*) FROM course_tags) as courses,
                        (SELECT COUNT(*) FROM material_tags) as materials,
                        (SELECT COUNT(*) FROM course_material_assignments) as assignments
                `, { type: db.sequelize.QueryTypes.SELECT });
            }
            
            res.json({
                success: true,
                debug: {
                    table_exists: tableExists,
                    table_structure: tableInfo,
                    sample_data: sampleData,
                    counts: counts ? counts[0] : null,
                    recommendation: tableExists 
                        ? "Assignment table exists and ready to use!" 
                        : "Create table using: CREATE TABLE course_material_assignments (...)"
                }
            });
            
        } catch (error) {
            console.error('❌ Assignment debug endpoint error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                message: "Assignment debug endpoint failed"
            });
        }
    });

    // General debug endpoint
    app.get("/api/course-materials-debug", async (req, res) => {
        try {
            console.log(`📥 General debug endpoint called`);
            
            // Check basic table structures
            const courseTagsTable = await db.sequelize.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'course_tags' ORDER BY ordinal_position",
                { type: db.sequelize.QueryTypes.SELECT }
            );
            
            const materialTagsTable = await db.sequelize.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'material_tags' ORDER BY ordinal_position",
                { type: db.sequelize.QueryTypes.SELECT }
            );

            // Check if assignment table exists
            const assignmentTableCheck = await db.sequelize.query(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_material_assignments')",
                { type: db.sequelize.QueryTypes.SELECT }
            );
            
            // Count existing data
            const courseCount = await db.courseTag.count();
            const materialCount = await db.materialTag.count();

            let assignmentCount = 0;
            if (assignmentTableCheck[0].exists) {
                try {
                    const result = await db.sequelize.query(
                        'SELECT COUNT(*) as count FROM course_material_assignments',
                        { type: db.sequelize.QueryTypes.SELECT }
                    );
                    assignmentCount = parseInt(result[0].count) || 0;
                } catch (e) {
                    console.log('Could not count assignments:', e.message);
                }
            }
            
            res.json({
                success: true,
                schema: {
                    course_tags_columns: courseTagsTable,
                    material_tags_columns: materialTagsTable,
                    assignment_table_exists: assignmentTableCheck[0].exists,
                },
                counts: {
                    courses: courseCount,
                    materials: materialCount,
                    assignments: assignmentCount
                },
                system: "Junction Table Only - Clean Implementation",
                recommendation: assignmentTableCheck[0].exists
                    ? "Assignment system ready to use!"
                    : "Create assignment table first"
            });
            
        } catch (error) {
            console.error("❌ Debug endpoint error:", error);
            res.status(500).json({
                success: false,
                error: error.message,
                message: "Debug endpoint failed"
            });
        }
    });
};
