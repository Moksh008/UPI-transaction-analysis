import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MinimalistHero } from '../components/ui/MinimalistHero';
import { NavBar } from '../components/ui/Dock';
import { Github, Linkedin, Twitter, Mail, Home, BarChart3, Info, CreditCard, Sparkles, TrendingUp, Brain, LineChart } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Features', url: '/#features', icon: BarChart3 },
    { name: 'About', url: '/about', icon: Info },
    { name: 'Login', url: '/login', icon: CreditCard },
  ];

  const handleNavigate = (url) => {
    if (url.startsWith('/')) {
      navigate(url);
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(url.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Configuration for the hero section
  const heroConfig = {
    logoText: "Finoro Analytics",
    mainText: "Discover insights into India's digital payment revolution. Our platform provides comprehensive analytics and AI-powered insights into UPI transaction trends, helping you understand the future of digital payments.",
    readMoreLink: "#features",
    imageSrc: "/moksh.png",
    imageAlt: "Moksh Kulshrestha ",
    overlayText: {
      part1: "Moksh",
      part2: "K.",
    },
    socialLinks: [
      { icon: Github, href: "https://github.com/Moksh008" },
      { icon: Linkedin, href: "https://linkedin.com" },
      { icon: Twitter, href: "https://twitter.com" },
      { icon: Mail, href: "mailto:contact@upianalytics.com" },
    ],
    locationText: "Mumbai, India",
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Navigation Bar - Same as Landing Page */}
      <NavBar items={navItems} onNavigate={handleNavigate} initialActive="About" />

      {/* Hero Section with Dark Theme */}
      <div className="pt-20">
        <MinimalistHero {...heroConfig} />
      </div>
      
      {/* Additional About Sections with Dark Theme */}
      
    </div>
  );
};

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group relative bg-white/[0.02] backdrop-blur-sm p-8 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500 hover:bg-white/[0.04] overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-rose-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="text-white/60 mb-4 group-hover:text-white group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-white/40 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
