// routes/courseMaterial.routes.js - DEBUG VERSION
const db = require("../models");
const { Op } = require("sequelize");

module.exports = (app) => {
    
    // Get materials by course ID - WITH DEBUGGING
    app.get("/api/course-materials/:courseId", async (req, res) => {
        try {
            const { courseId } = req.params;
            console.log(`📥 GET /api/course-materials/${courseId}`);
            
            // First, check if course exists
            const course = await db.courseTag.findByPk(courseId);
            if (!course) {
                console.log(`❌ Course ${courseId} not found`);
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }
            
            console.log(`✅ Course found: ${course.name}`);
            
            // Try to get materials - with fallback if column doesn't exist
            let materials = [];
            
            try {
                // Check if course_tag_id column exists by trying to query
                materials = await db.materialTag.findAll({
                    where: { course_tag_id: courseId },
                    attributes: ['id', 'name', 'created_at', 'updated_at'],
                    order: [['name', 'ASC']]
                });
                
                console.log(`✅ Found ${materials.length} materials for course ${courseId}`);
                
            } catch (columnError) {
                console.error(`❌ Column error (probably course_tag_id doesn't exist):`, columnError.message);
                
                // Fallback: return empty array if column doesn't exist
                console.log(`⚠️ Returning empty materials array as fallback`);
                materials = [];
            }

            res.json({
                success: true,
                data: materials,
                debug: {
                    courseId,
                    courseName: course.name,
                    materialCount: materials.length
                }
            });
            
        } catch (error) {
            console.error("❌ Error fetching course materials:", error);
            
            // Send detailed error for debugging
            res.status(500).json({
                success: false,
                message: "Failed to fetch course materials",
                error: error.message,
                debug: {
                    errorName: error.name,
                    errorStack: error.stack,
                    suggestion: "Check if course_tag_id column exists in material_tags table"
                }
            });
        }
    });

    // Add material to course - WITH DEBUGGING
    app.post("/api/course-materials", async (req, res) => {
        try {
            const { courseId, materialName } = req.body;
            console.log(`📥 POST /api/course-materials - Course: ${courseId}, Material: ${materialName}`);

            if (!courseId || !materialName) {
                return res.status(400).json({
                    success: false,
                    message: "Course ID and material name are required"
                });
            }

            // Check if course exists
            const courseExists = await db.courseTag.findByPk(courseId);
            if (!courseExists) {
                console.log(`❌ Course ${courseId} not found`);
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }

            // Try to create material with course_tag_id
            try {
                const newMaterial = await db.materialTag.create({
                    name: materialName,
                    course_tag_id: courseId
                });

                console.log(`✅ Material created successfully:`, newMaterial.toJSON());

                res.json({
                    success: true,
                    message: "Material added successfully",
                    data: newMaterial
                });
                
            } catch (createError) {
                console.error(`❌ Error creating material:`, createError.message);
                
                if (createError.message.includes('course_tag_id') || createError.message.includes('column')) {
                    return res.status(500).json({
                        success: false,
                        message: "Database schema error: course_tag_id column missing",
                        error: createError.message,
                        suggestion: "Run: ALTER TABLE material_tags ADD COLUMN course_tag_id INTEGER REFERENCES course_tags(id);"
                    });
                }
                
                throw createError;
            }

        } catch (error) {
            console.error("❌ Error adding material:", error);
            res.status(500).json({
                success: false,
                message: "Failed to add material",
                error: error.message,
                debug: {
                    errorName: error.name,
                    errorStack: error.stack
                }
            });
        }
    });

    // Test endpoint to check database schema
    app.get("/api/course-materials-debug", async (req, res) => {
        try {
            console.log(`📥 Debug endpoint called`);
            
            // Check if tables exist and get their structure
            const courseTagsTable = await db.sequelize.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'course_tags' ORDER BY ordinal_position",
                { type: db.sequelize.QueryTypes.SELECT }
            );
            
            const materialTagsTable = await db.sequelize.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'material_tags' ORDER BY ordinal_position",
                { type: db.sequelize.QueryTypes.SELECT }
            );
            
            // Check if course_tag_id column exists
            const hasCourseTagId = materialTagsTable.some(col => col.column_name === 'course_tag_id');
            
            // Count existing data
            const courseCount = await db.courseTag.count();
            const materialCount = await db.materialTag.count();
            
            res.json({
                success: true,
                schema: {
                    course_tags_columns: courseTagsTable,
                    material_tags_columns: materialTagsTable,
                    has_course_tag_id_column: hasCourseTagId
                },
                counts: {
                    courses: courseCount,
                    materials: materialCount
                },
                models: {
                    courseTag: !!db.courseTag,
                    materialTag: !!db.materialTag
                },
                recommendation: hasCourseTagId 
                    ? "Schema looks good!" 
                    : "Add course_tag_id column: ALTER TABLE material_tags ADD COLUMN course_tag_id INTEGER REFERENCES course_tags(id);"
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

    // Update material - WITH DEBUGGING
    app.put("/api/course-materials/:materialId", async (req, res) => {
        try {
            const { materialId } = req.params;
            const { materialName } = req.body;
            console.log(`📥 PUT /api/course-materials/${materialId} - New name: ${materialName}`);

            if (!materialName) {
                return res.status(400).json({
                    success: false,
                    message: "Material name is required"
                });
            }

            const material = await db.materialTag.findByPk(materialId);
            if (!material) {
                console.log(`❌ Material ${materialId} not found`);
                return res.status(404).json({
                    success: false,
                    message: "Material not found"
                });
            }

            await material.update({ name: materialName });
            console.log(`✅ Material updated successfully`);

            res.json({
                success: true,
                message: "Material updated successfully",
                data: material
            });

        } catch (error) {
            console.error("❌ Error updating material:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update material",
                error: error.message
            });
        }
    });

    // Delete material - WITH DEBUGGING
    app.delete("/api/course-materials/:materialId", async (req, res) => {
        try {
            const { materialId } = req.params;
            console.log(`📥 DELETE /api/course-materials/${materialId}`);

            const material = await db.materialTag.findByPk(materialId);
            if (!material) {
                console.log(`❌ Material ${materialId} not found`);
                return res.status(404).json({
                    success: false,
                    message: "Material not found"
                });
            }

            await material.destroy();
            console.log(`✅ Material deleted successfully`);

            res.json({
                success: true,
                message: "Material deleted successfully"
            });

        } catch (error) {
            console.error("❌ Error deleting material:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete material",
                error: error.message
            });
        }
    });

    // Get all courses - WITH DEBUGGING
    app.get("/api/courses", async (req, res) => {
        try {
            console.log(`📥 GET /api/courses`);
            
            const courses = await db.courseTag.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            console.log(`✅ Found ${courses.length} courses`);

            res.json({
                success: true,
                data: courses
            });
        } catch (error) {
            console.error("❌ Error fetching courses:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch courses",
                error: error.message
            });
        }
    });

    // Simplified statistics endpoint
    app.get("/api/course-material-stats", async (req, res) => {
        try {
            console.log(`📥 GET /api/course-material-stats`);
            
            const courses = await db.courseTag.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            // Try to get material counts, fallback to 0 if column doesn't exist
            const stats = await Promise.all(courses.map(async (course) => {
                let materialCount = 0;
                
                try {
                    materialCount = await db.materialTag.count({
                        where: { course_tag_id: course.id }
                    });
                } catch (countError) {
                    console.log(`⚠️ Could not count materials for course ${course.id}: ${countError.message}`);
                    materialCount = 0;
                }

                return {
                    id: course.id,
                    name: course.name,
                    material_count: materialCount.toString(),
                    question_set_count: "0" // Placeholder
                };
            }));

            console.log(`✅ Statistics calculated for ${stats.length} courses`);
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
};