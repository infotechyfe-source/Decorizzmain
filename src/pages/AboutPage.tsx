import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Mail, Phone, MapPin, Heart, Users, Target, Award, Sparkles } from "lucide-react";
import TiltCard from "../components/TiltCard";
import aboutImg from "../assets/5.jpg";
import canvaImg from "../assets/canva.jpg";
import heroImg from "../assets/hero.jpg";
import lordramaImg from "../assets/lordrama.jpg";
import owlImg from "../assets/owl.jpg";
import image1 from "../assets/1.jpg";
import image2 from "../assets/2.jpg";
import image3 from "../assets/3.jpg";
import image4 from "../assets/5.jpg";
import logor from "../assets/logo.png";

export default function AboutPage() {
  return (
    <div className="min-h-screen content-offset premium-bg">
      <Navbar />

      {/* HERO HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="premium-card-glow p-8 sm:p-12 animate-fade-scale">
            <h1 className="text-center custom-heading">
              About <span className="text-gradient-teal">Us</span>
            </h1>
            <p className="text-center max-w-3xl mx-auto italic text-base sm:text-lg" style={{ color: "#4b5563" }}>
              Curated frames to elevate every room
            </p>
          </div>
        </div>
      </section>

      {/* CREATIVE FOUNDER SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Background Glow Effect */}
        <div className="absolute inset-0 flex justify-center">
          <div className="w-[500px] h-[500px] bg-[#14b8a6]/10 blur-[120px] rounded-full"></div>
        </div>

        <TiltCard className="relative premium-card-glow p-8 sm:p-14 animate-fade-scale overflow-hidden">

          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT - IMAGE SIDE */}
            <div className="relative group">

              <div className="absolute -inset-3 bg-gradient-to-r from-[#14b8a6] to-[#3b2f27] rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>

              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={lordramaImg}
                  alt="Founder"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-lg px-4 py-2 rounded-xl shadow-md">
                <p className="text-sm font-semibold text-[#14b8a6]">
                  Founder & Director
                </p>
              </div>
            </div>

            {/* RIGHT - CONTENT SIDE */}
            <div className="space-y-6">

              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                The Vision Behind <span className="text-gradient-teal">Decorizz</span>
              </h2>

              <h3 className="text-xl font-semibold text-[#14b8a6]">
                Mohit Mandal
              </h3>

              <p className="text-base leading-relaxed text-gray-600">
                Decorizz began as more than just a business — it started as a passion
                for meaningful design. With a deep love for aesthetics and storytelling,
                Mohit envisioned a brand where art doesn’t just decorate walls,
                but transforms spaces into experiences.
              </p>

              <p className="text-base leading-relaxed text-gray-600">
                Every collection is personally reviewed to ensure originality,
                emotional impact, and premium quality — because creativity
                should never feel generic.
              </p>

              {/* Elegant Quote Card */}
              <div className="bg-gradient-to-r from-[#14b8a6]/10 to-transparent p-6 rounded-2xl border-l-4 border-[#14b8a6]">
                <p className="italic text-[#14b8a6] text-lg">
                  “Design is not just what you see — it's what you feel.”
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-10 pt-4">
                <div>
                  <p className="text-3xl font-bold text-[#14b8a6]">5+</p>
                  <p className="text-sm text-gray-500">Years Creative Experience</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#14b8a6]">5000+</p>
                  <p className="text-sm text-gray-500">Satisfied Customers</p>
                </div>
              </div>

            </div>
          </div>
        </TiltCard>
      </section>

      {/* WHO WE ARE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <TiltCard className="premium-card-glow p-8 sm:p-12 animate-fade-slide">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14b8a6]/10 to-[#3b2f27]/10 flex items-center justify-center shadow-inner">
              <Users className="w-6 h-6" color="#14b8a6" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "#1f2937" }}>
              Who We <span style={{ color: "#14b8a6" }}>Are</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                We are a small, passionate team of creators, designers, and storytellers who believe
                that art can transform the energy of any room.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                Our journey began with one vision — to create artwork that makes people feel
                something. Not just decorations, but expressive pieces that add soul to a space.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                Every collection we create goes through a long process of sketching, refining,
                color exploration, and visual storytelling.
              </p>
              <blockquote className="pl-4 border-l-4 border-[#14b8a6] italic" style={{ color: "#14b8a6" }}>
                "Would I hang this in my own home?" If the answer isn't a confident yes — we don't publish it.
              </blockquote>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[canvaImg, owlImg].map((src, i) => (
                <div key={i} className="overflow-hidden rounded-2xl shadow-lg" style={{ aspectRatio: '4/3' }}>
                  <img src={src} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </section>

      {/* WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <TiltCard className="premium-card-glow p-8 sm:p-12 animate-fade-slide">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14b8a6]/10 to-[#3b2f27]/10 flex items-center justify-center shadow-inner">
              <Award className="w-6 h-6" color="#14b8a6" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "#1f2937" }}>
              Why <span style={{ color: "#14b8a6" }}>Choose Us</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="grid grid-cols-2 gap-4">
              {[image1, image2].map((src, i) => (
                <div key={i} className="overflow-hidden rounded-2xl shadow-lg" style={{ aspectRatio: '4/3' }}>
                  <img src={src} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                Choose us because we genuinely care about what goes on your wall. Our
                designs are original, our materials are premium, and our team provides
                real human support — not automated messages.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                With Decorizz, you're not just buying wall art — you're bringing home
                something crafted with intention.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(20, 184, 166, 0.1)" }}>
                  <p className="text-2xl font-bold" style={{ color: "#14b8a6" }}>100%</p>
                  <p className="text-sm" style={{ color: "#4b5563" }}>Original Designs</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(20, 184, 166, 0.1)" }}>
                  <p className="text-2xl font-bold" style={{ color: "#14b8a6" }}>5000+</p>
                  <p className="text-sm" style={{ color: "#4b5563" }}>Happy Customers</p>
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* OUR MISSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <TiltCard className="premium-card-glow p-8 sm:p-12 animate-fade-slide">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14b8a6]/10 to-[#3b2f27]/10 flex items-center justify-center shadow-inner">
              <Target className="w-6 h-6" color="#14b8a6" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "#1f2937" }}>
              Our <span style={{ color: "#14b8a6" }}>Mission</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                Every piece we create is designed to add joy, emotion, and depth
                to your home — one wall at a time.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                Our mission is simple: make decorating effortless, enjoyable, and
                meaningful, helping people express personality through living art.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                We believe your walls should reflect who you are — your style, your
                story, and the moments that matter most.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[image3, image4].map((src, i) => (
                <div key={i} className="overflow-hidden rounded-2xl shadow-lg" style={{ aspectRatio: '4/3' }}>
                  <img src={src} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </section>

      {/* WHY WE STAND OUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <TiltCard className="premium-card-glow p-8 sm:p-12 animate-fade-slide">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14b8a6]/10 to-[#3b2f27]/10 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6" color="#14b8a6" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "#1f2937" }}>
              Why We <span style={{ color: "#14b8a6" }}>Stand Out</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="grid grid-cols-2 gap-4">
              {[heroImg, logor].map((src, i) => (
                <div key={i} className="overflow-hidden rounded-2xl shadow-lg bg-white" style={{ aspectRatio: '4/3' }}>
                  <img src={src} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                At Decorizz, we don't mass-produce art — we create it with heart.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                Every artwork is thoughtfully designed, carefully reviewed, and crafted to bring
                warmth and character into your space.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
                When you shop with Decorizz, you're choosing creativity, not templates.
              </p>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* CONTACT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PHONE */}
          <TiltCard className="rounded-3xl shadow-lg p-6 transition-all duration-300 card-appear" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid #e5e7eb' }}>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14b8a6]/10 to-[#3b2f27]/10 flex items-center justify-center shadow-inner">
                <Phone className="w-6 h-6" color="#14b8a6" />
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ color: '#1f2937' }}>Phone Number</p>
                <p className="text-sm mt-1" style={{ color: '#4b5563' }}>+91 9705180483</p>
              </div>
            </div>
          </TiltCard>

          {/* EMAIL */}
          <TiltCard className="rounded-3xl shadow-lg p-6 transition-all duration-300 card-appear" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid #e5e7eb' }}>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14b8a6]/10 to-[#3b2f27]/10 flex items-center justify-center shadow-inner">
                <Mail className="w-6 h-6" color="#14b8a6" />
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ color: '#1f2937' }}>Email Address</p>
                <p className="text-sm mt-1" style={{ color: '#4b5563' }}>support@decorizz.com</p>
              </div>
            </div>
          </TiltCard>

          {/* LOCATION */}
          <TiltCard className="rounded-3xl shadow-lg p-6 transition-all duration-300 card-appear" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid #e5e7eb' }}>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14b8a6]/10 to-[#3b2f27]/10 flex items-center justify-center shadow-inner">
                <MapPin className="w-6 h-6" color="#14b8a6" />
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ color: '#1f2937' }}>Location</p>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: '#4b5563' }}>
                  Sitarganj, Udham Singh Nagar, 263151
                </p>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* MAP SECTION */}
        <div className="mt-8">
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3489.2669416026324!2d79.64781057555636!3d29.00908607546123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a061f87cc0f677%3A0xe5fb13c9df318542!2sShakti%20farm%20market!5e0!3m2!1sen!2sin!4v1765270792894!5m2!1sen!2sin"
              width="100%"
              height="350"
              style={{
                border: "0",
                borderRadius: "18px",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
