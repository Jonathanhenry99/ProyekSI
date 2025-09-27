const Question = require('../models/question.model');

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      message: 'Error fetching questions',
      error: error.message 
    });
  }
};

exports.searchQuestions = async (req, res) => {
  try {
    const { search, courseTags, materialTags } = req.query;
    
    const courseTagsArray = courseTags ? courseTags.split(',').filter(Boolean) : [];
    const materialTagsArray = materialTags ? materialTags.split(',').filter(Boolean) : [];
    
    const questions = await Question.search(
      search,
      courseTagsArray,
      materialTagsArray
    );
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error searching questions:', error);
    res.status(500).json({ 
      message: 'Error searching questions',
      error: error.message 
    });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ 
      message: 'Error fetching question',
      error: error.message 
    });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      created_by: req.userId
    };
    
    const question = await Question.create(questionData);
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ 
      message: 'Error creating question',
      error: error.message 
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    if (question.created_by !== req.userId && req.userRole !== 'ROLE_ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedQuestion = await Question.update(req.params.id, req.body);
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ 
      message: 'Error updating question',
      error: error.message 
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    if (question.created_by !== req.userId && req.userRole !== 'ROLE_ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Question.delete(req.params.id);
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ 
      message: 'Error deleting question',
      error: error.message 
    });
  }
};