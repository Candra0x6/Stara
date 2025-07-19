"use client";
import Image from "next/image";
import React from "react";
import { Shield, CheckCircle, Award } from "lucide-react";

export function SpotlightLogoCloud() {
  const logos = [
    {
      name: "Microsoft",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png",
    },
    {
      name: "Google",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png",
    },
    {
      name: "Apple",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png",
    },
    {
      name: "IBM",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/200px-IBM_logo.svg.png",
    },
    {
      name: "Salesforce",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/200px-Salesforce.com_logo.svg.png",
    },
    {
      name: "Accenture",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/200px-Accenture.svg.png",
    },
    {
      name: "LinkedIn",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/200px-LinkedIn_logo_initials.png",
    },
    {
      name: "Adobe",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/200px-Adobe_Systems_logo_and_wordmark.svg.png",
    },
  ];

  const certifications = [
    {
      icon: Shield,
      title: "ADA Compliant",
      description: "Americans with Disabilities Act compliant",
    },
    {
      icon: CheckCircle,
      title: "WCAG 2.1 AA",
      description: "Web Content Accessibility Guidelines certified",
    },
    {
      icon: Award,
      title: "Equal Opportunity Verified",
      description: "Verified equal opportunity employer",
    },
  ];

  return (
    <div className="relative w-full overflow-hidden py-40 bg-background">
      <AmbientColor />
      <div className="relative z-10">
        <h2 className="bg-gradient-to-b from-primary to-secondary bg-clip-text pb-4 text-center font-[var(--font-inter)] text-2xl font-bold text-transparent md:text-5xl">
          Trusted by 40+ Inclusive Companies
        </h2>
        <p className="text-muted-foreground mb-10 mt-4 text-center font-[var(--font-inter)] text-base max-w-2xl mx-auto">
          Leading organizations that prioritize diversity, equity, and inclusion in their hiring practices trust our platform to build diverse teams.
        </p>
        
        {/* Company Logos */}
        <div 
          className="relative mx-auto grid w-full max-w-4xl grid-cols-4 gap-10 mb-16"
          role="img"
          aria-label="Logos of inclusive companies"
        >
          {logos.map((logo, idx) => (
            <div
              key={logo.src + idx + "logo-spotlight"}
              className="flex items-center justify-center focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-lg p-2"
              tabIndex={0}
            >
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                width={120}
                height={60}
                className="w-full h-auto max-h-16 select-none object-contain filter contrast-100 hover:contrast-125 transition-all duration-200"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Accessibility Certifications */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-primary text-center font-[var(--font-inter)] text-xl font-semibold mb-8">
            Accessibility & Compliance Certifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, idx) => (
              <div
                key={cert.title + idx}
                className="flex flex-col items-center text-center p-6 bg-card rounded-lg border border-border hover:border-accent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all duration-200"
                tabIndex={0}
                role="button"
                aria-label={`${cert.title} certification: ${cert.description}`}
              >
                <cert.icon className="w-12 h-12 text-accent mb-4" aria-hidden="true" />
                <h4 className="text-primary font-[var(--font-inter)] font-semibold text-lg mb-2">
                  {cert.title}
                </h4>
                <p className="text-muted-foreground font-[var(--font-inter)] text-sm">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const AmbientColor = () => {
  return (
    <div className="pointer-events-none absolute left-40 top-0 z-40 h-screen w-screen">
      <div
        style={{
          transform: "translateY(-350px) rotate(-45deg)",
          width: "560px",
          height: "1380px",
          background:
            "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(240, 100%, 85%, .2) 0, hsla(240, 100%, 55%, .1) 50%, hsla(240, 100%, 45%, .05) 80%)",
          filter: "blur(20px)",
          borderRadius: "50%",
        }}
        className="absolute left-0 top-0"
      />

      <div
        style={{
          transform: "rotate(-45deg) translate(5%, -50%)",
          transformOrigin: "top left",
          width: "240px",
          height: "1380px",
          background:
            "radial-gradient(50% 50% at 50% 50%, hsla(240, 100%, 85%, .15) 0, hsla(240, 100%, 45%, .1) 80%, transparent 100%)",
          filter: "blur(20px)",
          borderRadius: "50%",
        }}
        className="absolute left-0 top-0"
      />

      <div
        style={{
          position: "absolute",
          borderRadius: "50%",
          transform: "rotate(-45deg) translate(-180%, -70%)",
          transformOrigin: "top left",
          top: 0,
          left: 0,
          width: "240px",
          height: "1380px",
          background:
            "radial-gradient(50% 50% at 50% 50%, hsla(240, 100%, 85%, .1) 0, hsla(240, 100%, 45%, .05) 80%, transparent 100%)",
          filter: "blur(20px)",
        }}
        className="absolute left-0 top-0"
      />
    </div>
  );
};