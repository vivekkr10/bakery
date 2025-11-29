import React from "react";
import piping from "../../assets/homePage/CreamPiping.png";
import { Link } from "react-router-dom";

const ChefSection = () => {
    return (
        <section className="relative w-full py-20 bg-[#fff9f4] overflow-hidden">

            {/* Background Piping Image */}
            <img
                src={piping}
                alt="piping"
                className="absolute bottom-0 right-0 w-[360px] opacity-60 pointer-events-none select-none 
                md:w-[520px] lg:w-[560px]"
            />

            <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-12">

                {/* Image Section */}
                <div className="flex-1">
                    <div className="overflow-hidden rounded-[2.5rem] shadow-2xl bg-[#b75a90]/60 backdrop-blur-md p-2">
                        <img
                            src="https://i.pinimg.com/1200x/a0/18/7d/a0187d62c5d98d0d8e2be12450cee268.jpg"
                            alt="Chef"
                            className="rounded-[2rem] object-cover w-full h-[340px]"
                        />
                    </div>
                </div>

                {/* Text Section */}
                <div className="flex-1 relative">

                    {/* Large faded text behind */}
                    <h1 className="absolute -top-10 left-0 text-[150px] font-extrabold text-[#b75a90]/20 leading-none tracking-wider select-none pointer-events-none">
                        CHEF
                    </h1>

                    <h2 className="text-4xl md:text-5xl font-bold text-[#c85a32] leading-snug relative">
                        Oven-fresh baked goods,
                        <br /> baked just for you
                    </h2>

                    <p className="mt-5 text-gray-700 text-lg leading-relaxed">
                        We bake delicious treats with the finest ingredients. From warm chocolate chip cookies
                        to flaky croissants, every bite is filled with love, warmth, and flavor. Come experience
                        the magic of our bakery.
                    </p>

                    <Link to="/chef">
                        <button className="mt-6 text-[#c85a32] font-semibold text-lg flex items-center gap-2 hover:gap-3 transition-all duration-300 cursor-pointer">
                            Read More <span className="text-xl">→</span>
                        </button>
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default ChefSection;
