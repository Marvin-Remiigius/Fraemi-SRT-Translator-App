import React from 'react';

const Home = () => {
  return (
    // Add pt-24 (padding-top: 6rem) or similar to push content down
    <div className="relative min-h-screen bg-contain bg-center pt-24" style={{ backgroundImage: "url('/bg.png')" }}>
      
      {/* The header is now handled by the Layout component */}

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="text-center text-white">
          <h1 className="text-6xl font-extrabold">Your Vision, Amplified</h1>
          <p className="mt-4 text-lg">The future of content translation is here.</p>
        </div>
      </main>

    </div>
  );
};

export default Home;