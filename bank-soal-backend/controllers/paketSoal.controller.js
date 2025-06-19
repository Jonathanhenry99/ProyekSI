const db = require("../models");
const PaketSoal = db.paket_soal;
const File = db.file;
const QuestionSet = db.questionSet;

exports.createPaketSoal = async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    // Create paket soal
    const paketSoal = await PaketSoal.create({
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subject,
      year: req.body.year,
      level: req.body.level,
      lecturer: req.body.lecturer,
      topics: req.body.topics
    });

    console.log("Created paket soal:", paketSoal.toJSON());

    // Update file references
    if (req.body.files && req.body.files.length > 0) {
      console.log("Updating files with IDs:", req.body.files);
      
      await File.update(
        { paket_soal_id: paketSoal.id },
        { 
          where: { 
            id: req.body.files 
          }
        }
      );

      // Verify update
      const updatedFiles = await File.findAll({
        where: { id: req.body.files }
      });
      console.log("Updated files:", updatedFiles.map(f => f.toJSON()));
    }

    // Fetch complete data
    const result = await PaketSoal.findByPk(paketSoal.id, {
      include: [{
        model: File,
        attributes: ['id', 'filename', 'filecategory', 'filepath']
      }]
    });

    console.log("Sending response:", result.toJSON());
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createPaketSoal:", err);
    res.status(500).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.getAllPaketSoal = async (req, res) => {
  try {
    const paketSoal = await PaketSoal.findAll({
      include: [{
        model: File,
        attributes: ['id', 'filename', 'filecategory', 'filepath']
      }]
    });
    console.log("Fetched all paket soal:", paketSoal.map(p => p.toJSON()));
    res.json(paketSoal);
  } catch (err) {
    console.error("Error in getAllPaketSoal:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPaketSoalById = async (req, res) => {
  try {
    const paket = await PaketSoal.findByPk(req.params.id, {
      include: [File]
    });
    if (!paket) return res.status(404).json({ message: "Not found" });
    res.json(paket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePaketSoal = async (req, res) => {
  try {
    const paket = await PaketSoal.findByPk(req.params.id);
    if (!paket) return res.status(404).json({ message: "Not found" });
    await paket.update(req.body);
    res.json(paket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePaketSoal = async (req, res) => {
  try {
    const paket = await PaketSoal.findByPk(req.params.id);
    if (!paket) return res.status(404).json({ message: "Not found" });
    await paket.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};