import { motion } from 'framer-motion';

export default function FileUpload() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-col items-center my-4"
    >
      <select className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600">
        <option value="easy">Mudah</option>
        <option value="medium">Sedang</option>
        <option value="hard">Sulit</option>
      </select>
      <input
        type="file"
        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button className="bg-blue-600 text-white p-2 rounded-lg mt-4 hover:bg-blue-700">
        Upload
      </button>
    </motion.div>
  );
}