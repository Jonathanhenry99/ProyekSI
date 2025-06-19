module.exports = (sequelize, Sequelize) => {
    const PaketSoal = sequelize.define("paket_soal", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER
      },
      level: {
        type: Sequelize.STRING(50)
      },
      lecturer: {
        type: Sequelize.STRING
      },
      topics: {
        type: Sequelize.TEXT
      },
      downloads: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_updated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    }, {
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  
    return PaketSoal;
  };