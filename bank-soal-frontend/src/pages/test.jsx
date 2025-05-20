import React, { useState, useRef } from 'react';
import {
  Search, Trash2, Edit, Plus,
  Move, Check, Database, PenTool, Filter
} from 'lucide-react';

const EditKumpulanSoalPage = () => {
  const [formTitle, setFormTitle] = useState("Latihan_DAA_M07_2024");
  const [formDescription, setFormDescription] = useState("Deskripsi form (opsional)");
  const [selectedQuestions, setSelectedQuestions] = useState([
    {
      id: 1,
      question: "Masalah Pom Bensin",
      subject: "Greedy",
      difficulty: "Sedang",
      type: "Essay",
      lecturer: "Dosen 1"
    },
    {
      id: 2,
      question: "Dodo & Monitor",
      subject: "Greedy",
      difficulty: "Sedang",
      type: "Essay",
      lecturer: "Dosen 1"
    },
    {
      id: 3,
      question: "Kebun Sayur Kandy",
      subject: "Greedy",
      difficulty: "Sedang",
      type: "Essay",
      lecturer: "Dosen 1"
    }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseTagSearch, setCourseTagSearch] = useState("");
  const [materialTagSearch, setMaterialTagSearch] = useState("");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  // Sample data for question bank
  const sampleQuestions = [
    {
      id: 1,
      question: "Watering Grass",
      subject: "Greedy",
      difficulty: "Mudah",
      type: "Essay",
      lecturer: "Dosen 1"
    },
    {
      id: 2,
      question: "Minites Minggu 6",
      subject: "Generic",
      difficulty: "Sulit",
      type: "Essay",
      lecturer: "Dosen 2"
    },
    {
      id: 3,
      question: "Memory Maze Game",
      subject: "Array 1D",
      difficulty: "Sedang",
      type: "Essay",
      lecturer: "Dosen 3"
    },
    {
      id: 4,
      question: "Anagram",
      subject: "Rekursif",
      difficulty: "Sedang",
      type: "Essay",
      lecturer: "Dosen 5"
    },
    {
      id: 5,
      question: "Balanced Tree",
      subject: "Binary Search Tree",
      difficulty: "Mudah",
      type: "Essay",
      lecturer: "Dosen 4"
    },
    {
      id: 6,
      question: "Minites Minggu 7",
      subject: "Inheritance",
      difficulty: "Sulit",
      type: "Essay",
      lecturer: "Dosen 2"
    },
    {
      id: 7,
      question: "Jadwal Bentrok",
      subject: "Array 1D",
      difficulty: "Sedang",
      type: "Essay",
      lecturer: "Dosen 3"
    },
    {
      id: 8,
      question: "Wajik Pattern",
      subject: "Array 2D",
      difficulty: "Sedang",
      type: "Essay",
      lecturer: "Dosen 5"
    }
  ];

  // Sample data for tags
  const courseTags = ["Desain Analisis Algoritma", "Pemrograman Berorientasi Objek", "Struktur Data", "Basis Data", "Algoritma Pemrograman"];
  const materialTags = ["Linked List", "Greedy", "Graph", "Binary Search Tree", "Array", "Sorting", "Stack", "Queue"];

  const [filteredQuestions, setFilteredQuestions] = useState(sampleQuestions);
  
  // State for drag and drop
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
  
  // Handle drag and drop functionality
  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverItemIndex(index);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItemIndex !== null && dragOverItemIndex !== null) {
      const items = Array.from(selectedQuestions);
      const draggedItem = items[draggedItemIndex];
      
      // Remove the dragged item from its position
      items.splice(draggedItemIndex, 1);
      
      // Insert it at the new position
      items.splice(dragOverItemIndex, 0, draggedItem);
      
      setSelectedQuestions(items);
    }
    
    // Reset drag states
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  // Handle question selection from bank
  const handleAddQuestion = (question) => {
    setSelectedQuestions([...selectedQuestions, question]);
  };

  // Handle question removal
  const handleRemoveQuestion = (index) => {
    const newQuestions = [...selectedQuestions];
    newQuestions.splice(index, 1);
    setSelectedQuestions(newQuestions);
  };

  // Filter course tags
  const filteredCourseTags = courseTags.filter(tag => 
    tag.toLowerCase().includes(courseTagSearch.toLowerCase())
  );

  // Filter material tags
  const filteredMaterialTags = materialTags.filter(tag => 
    tag.toLowerCase().includes(materialTagSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center space-x-4">
            <img
              src="https://placehold.co/40x40" 
              alt="Logo Unpar"
              className="h-10 w-auto"
            />
            <div className="h-8 w-px bg-gray-300"></div>
            <img
              src="https://placehold.co/40x40"
              alt="Logo IF"
              className="h-10 w-auto rounded"
            />
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-gray-800 hover:text-blue-600">Soal</a>
            <a href="#" className="text-gray-800 hover:text-blue-600">Paket Soal</a>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Hi, Dosen XXXY</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Kumpulan Soal</h1>
          <p className="text-gray-600">Susun dan atur soal-soal untuk ujian atau tugas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Form Editor */}
          <div className="lg:col-span-6 bg-white rounded-lg border border-gray-200 p-6">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full text-xl font-bold mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Judul Form"
            />
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full text-gray-600 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 resize-none"
              placeholder="Deskripsi form (opsional)"
              rows="2"
            />

            {/* Questions list - draggable */}
            <div className="space-y-4">
              {selectedQuestions.map((question, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)} 
                  onDrop={handleDrop}
                  className={`bg-white border border-gray-200 rounded-lg p-4 flex items-start cursor-move ${
                    dragOverItemIndex === index ? "border-2 border-blue-500" : ""
                  }`}
                >
                  <div className="flex-shrink-0 w-8 text-center font-medium mr-2">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{question.question}</h3>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">• {question.difficulty}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {question.subject}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {question.lecturer} • {question.type}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 ml-2 space-x-1">
                    <button className="p-1">
                      <Move className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleRemoveQuestion(index)}
                      className="p-1"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Save button */}
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-900 text-white py-2 px-6 rounded font-medium hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* Right Column - Question Bank */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Bank Soal
                </h2>
                <button className="bg-gray-900 text-white py-1 px-4 rounded-lg text-sm flex items-center">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter Lanjutan
                </button>
              </div>

              {/* Search in question bank */}
              <div className="relative mb-4">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Cari soal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>

              {/* Question grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {filteredQuestions.map((question, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 hover:border-gray-400 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        question.difficulty === 'Mudah' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'Sedang' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </div>
                      <button
                        className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded"
                        onClick={() => handleAddQuestion(question)}
                      >
                        Tambah
                      </button>
                    </div>
                    <h3 className="font-medium text-sm">{question.question}</h3>
                    <div className="text-xs text-gray-600 mt-1">{question.subject}</div>
                    <div className="text-xs text-gray-500 mt-1">{question.lecturer}</div>
                  </div>
                ))}
              </div>

              {/* Tag selection for mata kuliah */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Pilih Tag Mata Kuliah</h3>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="Cari Tag Soal"
                    value={courseTagSearch}
                    onChange={(e) => setCourseTagSearch(e.target.value)}
                    onFocus={() => setShowCourseDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCourseDropdown(false), 200)}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  
                  {showCourseDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCourseTags.map((tag, index) => (
                        <div 
                          key={index} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setCourseTagSearch(tag);
                            setShowCourseDropdown(false);
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected course tag */}
                {courseTagSearch && (
                  <div className="mt-2 inline-flex bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm">
                    {courseTagSearch}
                    <button 
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setCourseTagSearch("")}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Tag selection for materi */}
              <div>
                <h3 className="font-medium mb-2">Pilih Tag Materi</h3>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="Cari Tag Materi"
                    value={materialTagSearch}
                    onChange={(e) => setMaterialTagSearch(e.target.value)}
                    onFocus={() => setShowMaterialDropdown(true)}
                    onBlur={() => setTimeout(() => setShowMaterialDropdown(false), 200)}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  
                  {showMaterialDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredMaterialTags.map((tag, index) => (
                        <div 
                          key={index} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setMaterialTagSearch(tag);
                            setShowMaterialDropdown(false);
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected material tag */}
                {materialTagSearch && (
                  <div className="mt-2 inline-flex bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm">
                    {materialTagSearch}
                    <button 
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setMaterialTagSearch("")}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditKumpulanSoalPage;