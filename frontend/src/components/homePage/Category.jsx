import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/* ------------------------------------
   MOST SELLING
------------------------------------ */
const mostSelling = [
    { name: "Chocolate Cake", image: "https://i.pinimg.com/736x/b4/84/95/b48495be28db56f015219bce5e043cbd.jpg" },
    { name: "Baked Cookie", image: "https://i.pinimg.com/1200x/35/a7/df/35a7df31d63c1522f84bc1ed1ad2b74f.jpg" },
    { name: "Strawberry Pastry", image: "https://i.pinimg.com/736x/01/44/94/014494156f6c67fd57b47865b26e6f40.jpg" },
    { name: "Cold Coffee", image: "https://i.pinimg.com/1200x/1c/3e/33/1c3e336092ab4163db42571058aeefde.jpg" },
    { name: "Croissant Bread", image: "https://i.pinimg.com/1200x/df/16/a2/df16a2dd37209244f709bdc15eca4656.jpg" },
    { name: "Cheese Pizza", image: "https://i.pinimg.com/1200x/68/d5/9f/68d59fa2d05a35a2ea0f4e47c39191d4.jpg" },
];

/* ------------------------------------
   CATEGORIES
------------------------------------ */
const categories = [
    { name: "Cakes", image: "https://i.pinimg.com/736x/fb/27/bc/fb27bc586c367fa23697850231e7d5ba.jpg" },
    { name: "Pizzas", image: "https://i.pinimg.com/736x/a6/34/c8/a634c8e44a0cc72bd6ae9b345678448a.jpg" },
    { name: "Pastries", image: "https://i.pinimg.com/736x/ed/8a/57/ed8a571f46cc8631eec0dc20a62aa40b.jpg" },
    { name: "Breads", image: "https://i.pinimg.com/736x/11/16/fc/1116fc34ce3a03bdd0eaac01a2c981e0.jpg" },
    { name: "Beverages", image: "https://i.pinimg.com/736x/e8/5f/74/e85f74d7ded0bb6a0539072d82de1b0f.jpg" },
    { name: "Cookies", image: "https://i.pinimg.com/1200x/d4/21/65/d4216552edd56870fa5b0889ec2e51d4.jpg" },
    { name: "Donuts", image: "https://i.pinimg.com/1200x/ce/61/f0/ce61f06047443a9ad3f1263bfd548357.jpg" },
    { name: "Customize Orders", image: "https://i.pinimg.com/736x/fc/d6/3b/fcd63b206337c0ae63ced801cc81b675.jpg" }
];

/* ANIMATION VARIANTS */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const zoomCard = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const Category = () => {
    return (
        <section className="w-full pt-20 pb-20 bg-[#e2bf9d]">
            <div className="max-w-7xl mx-auto px-6 md:px-10">

                {/* Most Selling Title */}
                <motion.h2
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="text-4xl md:text-5xl font-bold text-center text-[#8b5e3c] mb-12"
                >
                    Most Selling Items
                </motion.h2>

                {/* Most Selling Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 mb-20">
                    {mostSelling.map((item) => (
                        <motion.div
                            key={item.name}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            variants={zoomCard}
                        >
                            <Link to={`/product/${item.name}`}>
                                <motion.div
                                    whileHover={{ scale: 1.05, translateY: -5 }}
                                    className="relative rounded-3xl overflow-hidden shadow-xl border border-[#efd8c9] bg-gradient-to-tr from-[#fff9f4] to-[#A8E0D1] transition-all duration-300"
                                >
                                    {/* Image */}
                                    <div className="w-full h-44 sm:h-52 md:h-50 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-500"
                                        />
                                    </div>

                                    {/* Overlay text */}
                                    <div className="absolute bottom-0 w-full bg-black/30 backdrop-blur-sm text-center py-3">
                                        <h3 className="text-white font-semibold text-lg md:text-xl">{item.name}</h3>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Categories Title */}
                <motion.h2
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="text-4xl md:text-5xl font-bold text-center text-[#8b5e3c] mb-12"
                >
                    Categories
                </motion.h2>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.name}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            variants={zoomCard}
                        >
                            <Link to={`/category/${cat.name}`}>
                                <motion.div
                                    whileHover={{ scale: 1.05, translateY: -5 }}
                                    className="relative rounded-3xl overflow-hidden shadow-xl border border-[#efd8c9] bg-gradient-to-tr from-[#fff9f4] to-[#A8E0D1] transition-all duration-300"
                                >
                                    <div className="w-full h-44 sm:h-52 md:h-56 overflow-hidden">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-500 pb-12"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 w-full bg-black/30 backdrop-blur-sm text-center py-3">
                                        <h3 className="text-white font-semibold text-lg md:text-xl">{cat.name}</h3>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Category;
