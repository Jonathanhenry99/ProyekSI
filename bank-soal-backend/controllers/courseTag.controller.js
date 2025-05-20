const db = require("../models");
const CourseTag = db.courseTag;

// Membuat tag mata kuliah baru
exports.createCourseTag = async (req, res) => {
  try {
    const courseTag = await CourseTag.create({
      name: req.body.name
    });
    
    res.status(201).send(courseTag);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mendapatkan semua tag mata kuliah
exports.getAllCourseTags = async (req, res) => {
  try {
    const courseTags = await CourseTag.findAll();
    res.status(200).send(courseTags);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mengupdate tag mata kuliah
exports.updateCourseTag = async (req, res) => {
  const tagId = req.params.id;
  
  try {
    const courseTag = await CourseTag.findByPk(tagId);
    
    if (!courseTag) {
      return res.status(404).send({ message: "Tag tidak ditemukan." });
    }
    
    courseTag.name = req.body.name;
    await courseTag.save();
    
    res.send({ message: "Tag berhasil diperbarui!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Menghapus tag mata kuliah
exports.deleteCourseTag = async (req, res) => {
  const tagId = req.params.id;
  
  try {
    const result = await CourseTag.destroy({
      where: { id: tagId }
    });
    
    if (result === 1) {
      res.send({ message: "Tag berhasil dihapus!" });
    } else {
      res.send({ message: "Tag tidak ditemukan atau sudah dihapus." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};