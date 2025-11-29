import React from "react";
import cookie from "../../assets/homePage/cookie.png";
import { Link } from "react-router-dom";

const DeliverySection = () => {
    return (
        <section className="relative w-full py-20 bg-[#fff9f4] overflow-hidden">

            {/* Background Cookie Image */}
            <img
                src={cookie}
                alt="cookie"
                className="absolute bottom-0 left-0 w-[160px] opacity-50 pointer-events-none select-none 
                md:w-[250px] lg:w-[320px] sm:text-[90px] md:text-[150px] lg:text-[180px]"
            />

            <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-12">

                {/* Text Section (Left) */}
                <div className="flex-1 relative">

                    {/* Large faded background text */}
                    <h1 className="absolute -top-10 left-0 text-[150px] font-extrabold text-[#b75a90]/20 leading-none tracking-wider select-none pointer-events-none">
                        FAST
                    </h1>

                    <h2 className="text-4xl md:text-5xl font-bold text-[#c85a32] leading-snug relative">
                        Fast & Fresh Delivery,
                        <br />
                        right to your doorstep
                    </h2>

                    <p className="mt-5 text-gray-700 text-lg leading-relaxed font-semibold">
                        Enjoy bakery-fresh cakes, pastries, cupcakes, and more delivered straight to your home.
                        Our delivery partners ensure every order arrives on time, fresh, and handled with care.
                        Taste happiness without stepping out!
                    </p>

                    {/* Learn More */}
                    <Link to="/delivery">
                        <button className="px-6 py-2 rounded-full bg-[#fff9f4] text-[#8b5e3c] font-bold shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer mt-5">
                            Learn More <span className="text-xl">→</span>
                        </button>
                    </Link>
                </div>

                {/* Image Section (Right) */}
                <div className="flex-1">
                    <div className="overflow-hidden rounded-[2.5rem] shadow-2xl bg-[#b75a90]/60 backdrop-blur-md p-2">
                        <img
                            src="https://i.pinimg.com/736x/97/a9/8f/97a98f8f856e20ed0a23e807133dafa6.jpg"
                            alt="Delivery"
                            className="rounded-[2rem] object-cover w-full h-[340px]"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default DeliverySection;
