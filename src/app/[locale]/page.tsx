import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import ShortenUrlForm from '@/components/shortenUrlForm/shortenUrlForm';

const Home = () => {
  return (
    <main className="flex min-h-screen w-full flex-col flex-wrap md:container">
      <Header />

      <div className="mt-14 sm:mt-32">
        <ShortenUrlForm />
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  );
};

export default Home;
