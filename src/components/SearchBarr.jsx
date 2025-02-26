import { motion } from 'framer-motion';

export default function SearchBar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex justify-center my-4"
    >
      <input
        type="text"
        placeholder="Cari soal..."
        className="p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700">
        Cari
      </button>
    </motion.div>
  );
}