// routes/dropdown.routes.js
const db = require("../models");
const { Op } = require("sequelize");

module.exports = (app) => {
    console.log("📁 Dropdown routes loaded");

    // Debug endpoint untuk cek models
    app.get("/api/dropdown/debug", (req, res) => {
        console.log("🔍 Debug endpoint called");
        res.json({
            message: "Dropdown routes working",
            models_available: {
                courseTag: !!db.courseTag,
                materialTag: !!db.materialTag,
                questionSet: !!db.questionSet,
                sequelize: !!db.sequelize
            },
            db_keys: Object.keys(db)
        });
    });

    // Get all course tags
    app.get("/api/dropdown/course-tags", async (req, res) => {
        try {
            console.log("🔍 Fetching course tags...");

            if (!db.courseTag) {
                return res.status(500).json({
                    success: false,
                    message: "CourseTag model not found",
                    available_models: Object.keys(db)
                });
            }

            const courseTags = await db.courseTag.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            console.log(`✅ Found ${courseTags.length} course tags`);

            res.json({
                success: true,
                data: courseTags
            });
        } catch (error) {
            console.error("❌ Error fetching course tags:", error.message);
            res.status(500).json({
                success: false,
                message: "Failed to fetch course tags",
                error: error.message
            });
        }
    });

    // Get all material tags
    app.get("/api/dropdown/material-tags", async (req, res) => {
        try {
            console.log("🔍 Fetching material tags...");

            if (!db.materialTag) {
                return res.status(500).json({
                    success: false,
                    message: "MaterialTag model not found",
                    available_models: Object.keys(db)
                });
            }

            const materialTags = await db.materialTag.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            console.log(`✅ Found ${materialTags.length} material tags`);

            res.json({
                success: true,
                data: materialTags
            });
        } catch (error) {
            console.error("❌ Error fetching material tags:", error.message);
            res.status(500).json({
                success: false,
                message: "Failed to fetch material tags",
                error: error.message
            });
        }
    });

    // Get difficulty levels
    app.get("/api/dropdown/difficulty-levels", async (req, res) => {
        try {
            console.log("🔍 Fetching difficulty levels...");

            if (!db.questionSet) {
                return res.status(500).json({
                    success: false,
                    message: "QuestionSet model not found",
                    available_models: Object.keys(db)
                });
            }

            const allQuestionSets = await db.questionSet.findAll({
                attributes: ['level'],
                where: {
                    level: {
                        [Op.ne]: null
                    }
                }
            });

            const uniqueLevels = [...new Set(allQuestionSets.map(q => q.level))];
            const sortedLevels = uniqueLevels.sort((a, b) => {
                const order = { 'Mudah': 1, 'Sedang': 2, 'Sulit': 3 };
                return (order[a] || 999) - (order[b] || 999);
            });

            const levels = sortedLevels.length > 0 
                ? sortedLevels.map(level => ({ level }))
                : [
                    { level: 'Mudah' },
                    { level: 'Sedang' },
                    { level: 'Sulit' }
                ];

            console.log("✅ Difficulty levels:", levels);

            res.json({
                success: true,
                data: levels
            });
        } catch (error) {
            console.error("❌ Error fetching difficulty levels:", error.message);
            res.json({
                success: true,
                data: [
                    { level: 'Mudah' },
                    { level: 'Sedang' },
                    { level: 'Sulit' }
                ],
                note: "Using default levels due to error"
            });
        }
    });

    // Get all dropdown data
    app.get("/api/dropdown/all-dropdown-data", async (req, res) => {
        try {
            console.log("🔍 Fetching all dropdown data...");

            let courseTags = [];
            let materialTags = [];
            let difficultyLevels = [];

            // Fetch course tags
            try {
                if (db.courseTag) {
                    courseTags = await db.courseTag.findAll({
                        attributes: ['id', 'name'],
                        order: [['name', 'ASC']]
                    });
                }
            } catch (error) {
                console.error("Error fetching course tags:", error.message);
            }

            // Fetch material tags
            try {
                if (db.materialTag) {
                    materialTags = await db.materialTag.findAll({
                        attributes: ['id', 'name'],
                        order: [['name', 'ASC']]
                    });
                }
            } catch (error) {
                console.error("Error fetching material tags:", error.message);
            }

            // Fetch difficulty levels
            try {
                if (db.questionSet) {
                    const allQuestionSets = await db.questionSet.findAll({
                        attributes: ['level'],
                        where: {
                            level: { [Op.ne]: null }
                        }
                    });

                    const uniqueLevels = [...new Set(allQuestionSets.map(q => q.level))];
                    const sortedLevels = uniqueLevels.sort((a, b) => {
                        const order = { 'Mudah': 1, 'Sedang': 2, 'Sulit': 3 };
                        return (order[a] || 999) - (order[b] || 999);
                    });

                    difficultyLevels = sortedLevels.length > 0 
                        ? sortedLevels.map(level => ({ level }))
                        : [{ level: 'Mudah' }, { level: 'Sedang' }, { level: 'Sulit' }];
                } else {
                    difficultyLevels = [{ level: 'Mudah' }, { level: 'Sedang' }, { level: 'Sulit' }];
                }
            } catch (error) {
                console.error("Error fetching difficulty levels:", error.message);
                difficultyLevels = [{ level: 'Mudah' }, { level: 'Sedang' }, { level: 'Sulit' }];
            }

            console.log(`📊 Dropdown data: ${courseTags.length} course tags, ${materialTags.length} material tags, ${difficultyLevels.length} difficulty levels`);

            res.json({
                success: true,
                data: {
                    courseTags,
                    materialTags,
                    difficultyLevels
                }
            });

        } catch (error) {
            console.error("❌ Critical error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch dropdown data",
                error: error.message
            });
        }
    });
};