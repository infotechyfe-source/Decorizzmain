"use client";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function NeonProductDetails() {
    const [active, setActive] = useState("details");
    const tabsContainerRef = useRef(null);
    const tabRefs = useRef({});

    const handleTabClick = (value) => {
        setActive(value);

        const container = tabsContainerRef.current;
        const tab = tabRefs.current[value];

        if (!container || !tab) return;

        const containerRect = container.getBoundingClientRect();
        const tabRect = tab.getBoundingClientRect();

        const offset =
            tabRect.left -
            containerRect.left -
            containerRect.width / 2 +
            tabRect.width / 2;

        container.scrollBy({
            left: offset,
            behavior: "smooth",
        });
    };

    return (
        <section className="max-w-7xl mx-auto px-4 py-16 overflow-x-hidden">
            {/* ================= TABS ================= */}
            <div
                ref={tabsContainerRef}
                className="flex gap-4 overflow-x-auto no-scrollbar border-b pb-4 mb-12"
            >
                <Tab label="Product Details" value="details" active={active} onClick={handleTabClick} tabRefs={tabRefs} />
                <Tab label="What’s in the box?" value="box" active={active} onClick={handleTabClick} tabRefs={tabRefs} />
                <Tab label="How to install?" value="install" active={active} onClick={handleTabClick} tabRefs={tabRefs} />
                <Tab label="Customise" value="custom" active={active} onClick={handleTabClick} tabRefs={tabRefs} />
                <Tab label="FAQs" value="faq" active={active} onClick={handleTabClick} tabRefs={tabRefs} />
            </div>

            {active === "details" && <ProductDetails />}
            {active === "box" && <BoxContains />}
            {active === "install" && <HowToInstall />}
            {active === "custom" && <Customise />}
            {active === "faq" && <FAQs />}
        </section>
    );
}

/* ================= TAB ================= */

function Tab({ label, value, active, onClick, tabRefs }) {
    return (
        <button
            ref={(el) => (tabRefs.current[value] = el)}
            onClick={() => onClick(value)}
            className={`flex-shrink-0 px-4 py-2 text-xs sm:text-sm cursor-pointer
        uppercase tracking-wider rounded-full font-medium transition
        ${active === value
                    ? "bg-teal-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
        >
            {label}
        </button>
    );
}

/* ================= PRODUCT DETAILS ================= */

function ProductDetails() {
  return (
    <section className="w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TEXT */}
        <div className="space-y-4">
          <h2
            className="
              text-xl sm:text-2xl md:text-3xl
              font-bold text-teal-600
              leading-tight
            "
          >
            About Your Neon Sign
          </h2>

          <p
            className="
              text-sm sm:text-base md:text-lg
              text-gray-700
              leading-relaxed
            "
          >
            Our neon signs are handcrafted using{" "}
            <strong>2nd-Gen LED technology</strong> mounted on{" "}
            <strong>6MM transparent acrylic</strong>.
          </p>

          <p
            className="
              text-sm sm:text-base md:text-lg
              text-gray-700
              leading-relaxed
            "
          >
            Energy-efficient, durable, and designed to elevate any space
            with a clean, modern glow.
          </p>
        </div>

        {/* IMAGE */}
        <div
          className="
            w-full
            h-[220px] sm:h-[320px] md:h-[700px]
            rounded-2xl overflow-hidden
          "
        >
          <img
            src="/images/neon-product.jpeg"
            alt="Neon Sign"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}


/* ================= BOX CONTAINS ================= */

function BoxContains() {
    return (
        <div className="space-y-12">
            <div className="max-w-4xl space-y-5">
                <h3 className="text-2xl font-semibold text-teal-600">
                    The Box Contains:
                </h3>

                <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 space-y-2">
                    <li>Neon sign mounted on clear acrylic backing</li>
                    <li>Pre-drilled holes for easy mounting</li>
                    <li>Stainless steel mounting screws</li>
                    <li>Power cable and adapter</li>
                </ul>
            </div>

            <div className="w-full h-[300px] sm:h-[420px] md:h-[600px] rounded-2xl overflow-hidden">
                <img
                    src="/images/neon-product2.jpeg"
                    alt="Box Contents"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
}

/* ================= HOW TO INSTALL ================= */
function HowToInstall() {
  const steps = [
    {
      img: "/images/step-1.jpg",
      text: "Take a measuring tape and mark out the position of your neon sign.",
    },
    {
      img: "/images/step-2.jpg",
      text: "Safely drill small holes on the wall.",
    },
    {
      img: "/images/step-3.jpeg",
      text: "Use the stainless steel mounting screws to fix your neon sign.",
    },
    {
      img: "/images/step-4.jpg",
      text: "Connect the power adapter to the transparent cable and your sign is ready!",
    },
  ];

  return (
    <section className="space-y-12">
      {/* Intro */}
      <p className="text-base sm:text-lg text-gray-700 max-w-3xl">
        Here’s how you can install our neon signs on your wall:
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="
              group bg-white rounded-3xl overflow-hidden
              border border-gray-100
              shadow-sm hover:shadow-xl
              transition-all duration-300
            "
          >
            {/* Image */}
            <div className="relative h-[190px] overflow-hidden">
              <img
                src={step.img}
                alt={`Step ${index + 1}`}
                className="
                  w-full h-full object-cover
                  transition-transform duration-500
                  group-hover:scale-105
                "
              />

              {/* Step badge */}
              <div
                className="
                  absolute top-4 left-4
                  bg-white/90 backdrop-blur
                  text-teal-600
                  text-xs font-semibold
                  px-3 py-1 rounded-full
                "
              >
                Step {index + 1}
              </div>
            </div>

            {/* Text */}
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


/* ================= CUSTOMISE ================= */

function Customise() {
    return (
        <div className="max-w-3xl space-y-6 text-center md:text-left">
            <h3 className="text-2xl font-semibold text-teal-600">
                Customise Your Neon
            </h3>

            <p className="text-base sm:text-lg text-gray-700">
                Choose size, colors, brightness level, and waterproof options
                to create your perfect neon sign.
            </p>

            <Link
                to="/product/custom/custom-name-neon-signs-lights"
                className="inline-block px-8 py-3 rounded-full
                   bg-teal-600 text-white font-medium
                   hover:bg-teal-700 transition"
            >
                Customise Now
            </Link>
        </div>
    );
}

/* ================= FAQ ================= */

function FAQs() {
    const faqs = [
        {
            q: "What material is the neon sign made of?",
            a: "Our neon signs are made using advanced 2nd-Gen LED tubing mounted on premium 6MM transparent acrylic. This makes them lightweight, durable, and safe for indoor use."
        },
        {
            q: "Is the neon sign safe to use?",
            a: "Yes. Our LED neon signs operate on low voltage, produce no heat, and are completely safe for homes, bedrooms, shops, and offices."
        },
        {
            q: "Can I control brightness and colors?",
            a: "Yes. Most of our neon signs support adjustable brightness and color control, depending on the selected model."
        },
        {
            q: "How long do neon signs last?",
            a: "Our 2nd-Gen LED neon signs have a lifespan of up to 50,000 hours, ensuring long-lasting performance."
        },
        {
            q: "Is installation difficult?",
            a: "Not at all. Each neon sign comes with pre-drilled holes, stainless steel screws, and a power adapter for quick and easy installation."
        },
        {
            q: "Do you offer custom sizes or designs?",
            a: "Yes! You can customise size, color, brightness, and more from our custom neon page."
        }
    ];

    return (
        <section className="max-w-4xl space-y-6">
            <h3 className="text-2xl font-semibold text-teal-600">
                Frequently Asked Questions
            </h3>

            <div className="space-y-3">
                {faqs.map((item, index) => (
                    <FAQItem key={index} item={item} />
                ))}
            </div>
        </section>
    );
}

/* ================= SINGLE FAQ ================= */

function FAQItem({ item }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border rounded-xl overflow-hidden bg-white">
            <button
                onClick={() => setOpen(!open)}
                className="
          w-full flex justify-between items-center
          px-5 py-4 text-left
          text-sm sm:text-base font-medium text-gray-800
          hover:bg-gray-50 transition
        "
            >
                <span>{item.q}</span>
                <span className="text-teal-600 text-xl">
                    {open ? "−" : "+"}
                </span>
            </button>

            {open && (
                <div className="px-5 pb-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                    {item.a}
                </div>
            )}
        </div>
    );
}
