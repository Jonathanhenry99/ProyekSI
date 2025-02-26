import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBarr';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4">
        <SearchBar />
      </main>
      <Footer />
    </div>
  );
}