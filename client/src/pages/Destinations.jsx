import React from "react";
import { Link } from "react-router-dom";

export default function Destinations() {
  const destinations = [
    {
      name: "Sajek Valley",
      img: "https://d2u0ktu8omkpf6.cloudfront.net/deab5d531957d73a0057d50d32f3babf269ef1c1fca30044.jpg",
      desc: "The unique beauty of Sajek Valley with green hills and clouds.",
    },
    {
      name: "Bandarban",
      img: "https://images.unsplash.com/photo-1717418878623-50e09d80afcd?w=500&auto=format&fit=crop&q=60",
      desc: "A land of hills, waterfalls, and indigenous culture.",
    },
    {
      name: "Jaflong",
      img: "https://www.travelandexplorebd.com/storage/app/public/posts/April2020/41.jpg",
      desc: "Rivers and serene hills make Jaflong stunning.",
    },
    {
      name: "Cox's Bazar",
      img: "https://media-cdn.tripadvisor.com/media/photo-s/17/4c/44/75/laboni-beach.jpg",
      desc: "The world's longest sea beach with crystal blue waters.",
    },
    {
      name: "Srimangal",
      img: "https://pathfriend-bd.com/wp-content/uploads/2019/08/Tea-Capital-Sylhet-2.gif",
      desc: "Tea gardens, seven-layer tea, and nature's peaceful beauty.",
    },
    {
      name: "Kuakata",
      img: "https://images.unsplash.com/photo-1710411592496-e9ee76b47806?q=80&w=1974&auto=format&fit=crop",
      desc: "A rare place to enjoy both sunrise and sunset over the sea.",
    },
    {
      name: "Saint Martin's Island",
      img: "https://www.tbsnews.net/sites/default/files/styles/infograph/public/images/2021/10/29/saint_martin_rashed_kabir.jpg",
      desc: "A tranquil coral island and popular tourist destination in Bangladesh.",
    },
    {
      name: "Lawachara National Park",
      img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Life_around_jungle.jpg",
      desc: "Lush rainforest reserve known for wildlife and natural beauty.",
    },
    {
      name: "Ratargul Swamp Forest",
      img: "https://www.travelmate.com.bd/wp-content/uploads/2019/07/Ratargul-2.jpg",
      desc: "One of the few freshwater swamp forests in Bangladesh, charming and serene.",
    },
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 to-white">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center filter blur-md brightness-75 transition-all duration-500"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1697128438786-82c44b8603be?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fHNvb3RoaW5nJTIwdHJhdmVsJTIwZGVzdGluYXRpb258ZW58MHx8MHx8fDA%3D')",
        }}
        aria-hidden="true"
      />

      {/* Overlay to soften the blur and improve contrast */}
      <div
        className="fixed inset-0 z-0 bg-blue-900 bg-opacity-40"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg tracking-tight">
            Explore the Finest Destinations of Bangladesh
          </h1>
          <p className="mt-4 text-lg text-blue-200 max-w-xl mx-auto">
            Discover breathtaking locations, vibrant cultures, and unforgettable
            experiences.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {destinations.map((dest, idx) => (
            <Link
              key={idx}
              to={`/destinations/${encodeURIComponent(dest.name)}`}
              className="group relative block rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
              aria-label={`View tours for ${dest.name}`}
            >
              <img
                src={dest.img}
                alt={dest.name}
                className="w-full h-72 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 transition-colors duration-300 group-hover:bg-gradient-to-t group-hover:from-black/90">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                  {dest.name}
                </h3>
                <p className="mt-2 text-sm text-gray-300 max-h-14 overflow-hidden">
                  {dest.desc}
                </p>
                <span className="mt-4 inline-block bg-white/90 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold group-hover:bg-blue-700 group-hover:text-white transition">
                  View Tours →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
