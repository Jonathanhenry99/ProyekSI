const db = require("../models");
const MaterialTag = db.materialTag;

// Membuat material tag 
exports.createMaterialTag = async (req, res) => {
  try {
    const materialTag = await MaterialTag.create({
      name: req.body.name
    });
    
    res.status(201).send(materialTag);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mendapatkan semua material tag
exports.getAllMaterialTag = async (req, res) => {
  try {
    const materialTag = await MaterialTag.findAll();
    res.status(200).send(materialTag);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mengupdate material tag 
exports.updateMaterialTag = async (req, res) => {
  const tagId = req.params.id;
  
  try {
    const materialTag = await MaterialTag.findByPk(tagId);
    
    if (!materialTag) {
      return res.status(404).send({ message: "Tag tidak ditemukan." });
    }
    
    materialTag.name = req.body.name;
    await materialTag.save();
    
    res.send({ message: "Tag berhasil diperbarui!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Menghapus material tag
exports.deleteMaterialTag = async (req, res) => {
  const tagId = req.params.id;
  
  try {
    const result = await MaterialTag.destroy({
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