//app/warranty/WarrantyClient.tsx

'use client';

import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useState } from 'react';

// Custom Icons for better UI
const ShieldIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>;
const ClockIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const ToolsIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;

export default function WarrantyClient() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-800 pb-10 selection:bg-blue-200">
      <Breadcrumbs pageTitle="Ultimate Warranty & Care Guide" />

      {/* ==========================================
          1. HERO SECTION (THE PROMISE)
      ========================================== */}
      <section className="relative bg-white border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-1 pb-10 md:pt-8 md:pb-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-full mb-2 shadow-inner">
              <ShieldIcon />
            </div>
            <h1 className="text-2xl sm:text-5xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-[1.1]">
              Ride Hard. Ride Safe. <br className="hidden sm:block"/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">We’ve Got Your Back for 2 Years.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-7 max-w-3xl mx-auto">
              Kids are tough on their toys. That’s why we engineer our bikes to be tougher. Welcome to the GoBike <strong>24-Month Ultimate Peace of Mind Guarantee</strong>. No hidden tricks, just robust Australian support ready to keep the adventure going.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/bikes" className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-200 font-bold py-3.5 px-8 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all duration-300">
                Shop Our Bikes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          MAIN CONTENT WRAPPER (Full Width without Sidebar)
      ========================================== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-24 pt-16">
        
        {/* ==========================================
            2. WHAT IS COVERED? (DEEP DIVE COMPONENT BREAKDOWN)
        ========================================== */}
        <section id="coverage" className="scroll-mt-32">
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 inline-flex flex-col items-center">
              What Is Covered?
              <span className="h-1.5 w-24 bg-blue-600 mt-3 rounded-full"></span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mt-4 max-w-3xl mx-auto">
              Our comprehensive warranty covers all major manufacturing defects. Whether you own our 12" balance bike or the 24" full-suspension beast, here is the detailed breakdown of the components protected under our guarantee.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- 24 Month Coverage Items --- */}
            <div className="col-span-1 md:col-span-2 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-2xl mb-4">
              <h3 className="font-bold text-blue-900 flex items-center gap-3 text-lg">
                <ClockIcon /> 24-MONTH MAJOR COMPONENT GUARANTEE
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">1. Main Alloy Frame</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for structural cracks, weld failures, or snapping of the rear swingarm under normal riding conditions.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">2. Front Suspension & Rigid Forks</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Whether it's the rigid fork on our 12" model or the dual-crown suspension fork on our 24" model, we cover bending or breaking due to factory defects.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">3. Brushless Rear Hub Motor</h3>
              <p className="text-gray-600 text-sm leading-relaxed">The powerhouse of the bike. Covered for internal mechanical failures, bearing collapses, or electrical shorts (excluding water submersion).</p>
            </div>

            {/* --- 12 Month Coverage Items --- */}
            <div className="col-span-1 md:col-span-2 bg-green-50 border-l-4 border-green-500 p-5 rounded-r-2xl mt-8 mb-4">
              <h3 className="font-bold text-green-900 flex items-center gap-3 text-lg">
                <ClockIcon /> 12-MONTH ELECTRICAL & PARTS GUARANTEE
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">4. Lithium-Ion Battery Pack</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for failure to hold charge (dropping below 60% capacity abnormally fast), BMS failures, and internal cell defects.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">5. Speed Controller (ECU)</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for electrical shorts, burning out, or failure to process the half-twist throttle input.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">6. LCD/LED Displays</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for dead pixels, failure to turn on, or unresponsive Power/Mode buttons.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">7. Wiring Harness & Cables</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for factory wiring faults, loose internal connectors, and faulty motor cables.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">8. Star Union Hydraulic Brakes & Calipers</h3>
              <p className="text-gray-600 text-sm leading-relaxed">The brake caliper housing and fluid lines (including premium Star Union hydraulic models on our 20/24" bikes) are covered against factory leaks. <em>(Note: Brake pads are excluded)</em>.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">9. Half-Twist Throttle</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for internal spring failure, sticking, or unresponsive magnetic sensors.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">10. Rear Shock Absorber (Coil Spring)</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for internal damper failure or spring snapping under normal off-road use.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">11. Battery Charger</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for failure to supply power to the battery or internal cooling fan failure.</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">12. Footpegs & Kickstands</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Covered for factory welds breaking or snapping off the frame under normal standing pressure.</p>
            </div>

          </div>
        </section>

        {/* ==========================================
            3. EXCLUSIONS (WHAT IS NOT COVERED) & FREE SHIPPING PROMO
        ========================================== */}
        <section id="exclusions" className="scroll-mt-32">
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 inline-flex flex-col items-center">
              What Is NOT Covered?
              <span className="h-1.5 w-24 bg-red-500 mt-3 rounded-full"></span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mt-4 max-w-3xl mx-auto">
              To keep our prices fair and our support fast, certain consumable items and damages caused by extreme misuse fall outside our manufacturing warranty.
            </p>
          </div>
          
          {/* Promo Banner for Free Shipping */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-8 mb-10 rounded-r-3xl shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <ToolsIcon />
            </div>
            <h4 className="text-blue-900 font-extrabold text-2xl mb-3 flex items-center gap-3">
              <span className="text-3xl">🎉</span> Good News on Consumables!
            </h4>
            <p className="text-blue-800 text-lg leading-relaxed">
              Even though normal wear and tear items aren't covered under warranty, we support our riders! You buy genuine replacement parts from our shop. 
              <br/>
              <Link href="/spare-parts" className="inline-block mt-5 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                Shop genuine Spare Parts
              </Link>
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              <li className="p-8 flex gap-6 items-start hover:bg-gray-50 transition-colors">
                <div className="bg-red-100 p-3 rounded-xl text-red-600 shrink-0 mt-0.5"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xl mb-2">Normal Wear & Tear Parts</h4>
                  <p className="text-gray-600 text-base leading-relaxed">Items designed to wear out with use are excluded. This includes <strong>Kenda knobby dirt tires</strong>, inner tubes, rubber handlebar grips, brake pads, seat covers, and plastic training wheels (on the 12" model).</p>
                </div>
              </li>
              <li className="p-8 flex gap-6 items-start hover:bg-gray-50 transition-colors">
                <div className="bg-red-100 p-3 rounded-xl text-red-600 shrink-0 mt-0.5"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xl mb-2">Water Damage</h4>
                  <p className="text-gray-600 text-base leading-relaxed">Our bikes are water-resistant for puddles and splashes, but they are NOT waterproof. Submersion, pressure washing, or leaving the bike out in heavy rain will instantly void the electronics warranty.</p>
                </div>
              </li>
              <li className="p-8 flex gap-6 items-start hover:bg-gray-50 transition-colors">
                <div className="bg-red-100 p-3 rounded-xl text-red-600 shrink-0 mt-0.5"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xl mb-2">Unauthorized Modifications & Speed Hacks</h4>
                  <p className="text-gray-600 text-base leading-relaxed">Splicing wires, installing aftermarket higher-voltage batteries, attempting to bypass the factory speed limiter, or altering the hydraulic brake lines will void your warranty.</p>
                </div>
              </li>
              <li className="p-8 flex gap-6 items-start hover:bg-gray-50 transition-colors">
                <div className="bg-red-100 p-3 rounded-xl text-red-600 shrink-0 mt-0.5"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xl mb-2">Commercial Use & Second-Hand Owners</h4>
                  <p className="text-gray-600 text-base leading-relaxed">The GoBike warranty applies <strong>only to the original purchaser</strong> for personal use. Using the bike for commercial rentals, or purchasing it second-hand, voids all warranty claims.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* ==========================================
            4. CLAIM PROCESS (Updated Time)
        ========================================== */}
        <section id="claim-process" className="scroll-mt-32">
          <div className="bg-gray-900 text-white p-10 sm:p-16 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 opacity-20 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 text-center relative z-10">The Zero-Headache Claim Process</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-blue-500/30 rotate-3 hover:rotate-0 transition-transform">1</div>
                <h4 className="font-bold text-2xl mb-3 text-blue-100">Record</h4>
                <p className="text-gray-400 text-base">Take a clear 10-second video or photo showing the exact issue on the bike.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-blue-500/30 -rotate-3 hover:rotate-0 transition-transform">2</div>
                <h4 className="font-bold text-2xl mb-3 text-blue-100">Submit</h4>
                <p className="text-gray-400 text-base">Email <a href="mailto:gobike@gobike.au" className="text-blue-400 hover:text-white underline font-medium">gobike@gobike.au</a> with your Order ID & the video.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-blue-500/30 rotate-3 hover:rotate-0 transition-transform">3</div>
                <h4 className="font-bold text-2xl mb-3 text-blue-100">Diagnose</h4>
                <p className="text-gray-400 text-base">Our Aussie tech team reviews and responds within <strong>10 minutes to 1 hour</strong> during business hours.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-green-500/30 -rotate-3 hover:rotate-0 transition-transform">4</div>
                <h4 className="font-bold text-2xl mb-3 text-green-100">Resolve</h4>
                <p className="text-gray-400 text-base">We ship the replacement part directly to your door with easy installation instructions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            5. MAINTENANCE & BATTERY CARE (With Blog Link)
        ========================================== */}
        <section id="maintenance" className="scroll-mt-32">
           <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 inline-flex flex-col items-center">
              Pro Maintenance Guide
              <span className="h-1.5 w-24 bg-orange-500 mt-3 rounded-full"></span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mt-4 max-w-3xl mx-auto">
              Want your kid's ebike to last for years? Follow our expert tips to maximize battery performance and avoid unnecessary repairs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Battery Care Box */}
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🔋</span> Battery Care 101
                </h3>
                <ul className="space-y-4 text-gray-600 text-base mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 font-bold">✓</span>
                    <span><strong>Never drain to 0%:</strong> Try to recharge when the display hits 20% to prolong lithium cell life.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 font-bold">✓</span>
                    <span><strong>Winter Storage:</strong> If not riding for weeks, remove the battery, store it indoors at room temperature, and leave it charged to about 60%.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 font-bold">✓</span>
                    <span><strong>Use Original Charger:</strong> Using third-party chargers is a fire hazard and instantly voids the warranty.</span>
                  </li>
                </ul>
              </div>
              <Link href="/blog" className="block text-center bg-gray-50 text-gray-900 border border-gray-200 font-bold py-4 px-6 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm">
                Read Full Battery Guide in Our Blog →
              </Link>
            </div>

            {/* Cleaning Box */}
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">🧼</span> Cleaning & Washing
                </h3>
                <ul className="space-y-4 text-gray-600 text-base mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 font-bold">✕</span>
                    <span><strong>No Pressure Washers:</strong> High pressure forces water directly into the wheel bearings, LCD display, and battery port.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 font-bold">✓</span>
                    <span><strong>Proper Wipe Down:</strong> Use a damp, soapy microfiber cloth to wipe the frame and Kenda tires.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 font-bold">✓</span>
                    <span><strong>Avoid Oil on Brakes:</strong> When lubricating the chain, ensure absolutely no oil gets onto the steel brake rotors or Star Union calipers, as it will destroy the braking power.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            6. FAQ SECTION (Interactive Accordions)
        ========================================== */}
        <section id="faq" className="scroll-mt-32">
           <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 inline-flex flex-col items-center">
              Frequently Asked Questions
              <span className="h-1.5 w-24 bg-blue-600 mt-3 rounded-full"></span>
            </h2>
          </div>
          
          <div className="space-y-5 mb-12 max-w-4xl mx-auto">
            {/* FAQ 1 */}
            <div className={`bg-white border ${activeFaq === 1 ? 'border-blue-500 shadow-md' : 'border-gray-200'} rounded-2xl overflow-hidden transition-all duration-300`}>
              <button onClick={() => toggleFaq(1)} className="w-full flex items-center justify-between p-6 font-bold text-gray-900 text-left bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none">
                <span className="text-lg">Do I need to register my bike for the warranty?</span>
                <span className={`transform transition-transform duration-300 text-blue-600 text-2xl ${activeFaq === 1 ? 'rotate-180' : ''}`}>↓</span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === 1 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 text-gray-600 bg-white border-t border-gray-100 text-base leading-relaxed">
                  No paperwork or mail-in cards needed! Your warranty is automatically activated the day your bike is delivered. Just keep your original order confirmation email as your proof of purchase.
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className={`bg-white border ${activeFaq === 2 ? 'border-blue-500 shadow-md' : 'border-gray-200'} rounded-2xl overflow-hidden transition-all duration-300`}>
              <button onClick={() => toggleFaq(2)} className="w-full flex items-center justify-between p-6 font-bold text-gray-900 text-left bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none">
                <span className="text-lg">The motor cuts out while riding. Is it broken?</span>
                <span className={`transform transition-transform duration-300 text-blue-600 text-2xl ${activeFaq === 2 ? 'rotate-180' : ''}`}>↓</span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === 2 ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 text-gray-600 bg-white border-t border-gray-100 text-base leading-relaxed">
                  This is often a built-in safety feature, not a defect! Our e-bikes have "brake-cut-off" sensors. If your brake lever is even slightly pulled (or the sensor gets stuck), it immediately tells the motor to shut off power. Try flicking the brake levers outwards to release the sensor.
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className={`bg-white border ${activeFaq === 3 ? 'border-blue-500 shadow-md' : 'border-gray-200'} rounded-2xl overflow-hidden transition-all duration-300`}>
              <button onClick={() => toggleFaq(3)} className="w-full flex items-center justify-between p-6 font-bold text-gray-900 text-left bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none">
                <span className="text-lg">Can I take my GoBike to a local bike shop for repair?</span>
                <span className={`transform transition-transform duration-300 text-blue-600 text-2xl ${activeFaq === 3 ? 'rotate-180' : ''}`}>↓</span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === 3 ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 text-gray-600 bg-white border-t border-gray-100 text-base leading-relaxed">
                  For mechanical issues (like replacing an inner tube, adjusting the chain, or changing brake pads), absolutely! Any local bike mechanic can handle it. However, for <strong>electrical issues</strong> under warranty (battery, motor, display), you must contact GoBike support first.
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className={`bg-white border ${activeFaq === 4 ? 'border-blue-500 shadow-md' : 'border-gray-200'} rounded-2xl overflow-hidden transition-all duration-300`}>
              <button onClick={() => toggleFaq(4)} className="w-full flex items-center justify-between p-6 font-bold text-gray-900 text-left bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none">
                <span className="text-lg">Is the warranty transferable if I sell the bike?</span>
                <span className={`transform transition-transform duration-300 text-blue-600 text-2xl ${activeFaq === 4 ? 'rotate-180' : ''}`}>↓</span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === 4 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 text-gray-600 bg-white border-t border-gray-100 text-base leading-relaxed">
                  No. The GoBike 24-month warranty is strictly valid only for the original purchaser. It is non-transferable to protect against second-hand modifications and abuse.
                </div>
              </div>
            </div>
          </div>
          
          {/* More FAQs Button */}
          <div className="text-center">
            <Link href="/faq" className="inline-block bg-white text-blue-600 border-2 border-blue-600 font-bold py-4 px-10 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg">
              View All Frequently Asked Questions
            </Link>
          </div>
        </section>
        
        {/* ==========================================
            7. BOTTOM FULL-WIDTH CTA SECTION
        ========================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 pb-10">
            {/* Sales CTA */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 sm:p-12 rounded-[2rem] text-white shadow-xl text-center relative overflow-hidden flex flex-col justify-center">
               <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
              <h3 className="text-3xl font-extrabold mb-4 relative z-10">Ready for Adventure?</h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed relative z-10 max-w-md mx-auto">Now that you know you are 100% covered by our Aussie support team, find the perfect bike for your child.</p>
              <Link href="/bikes" className="inline-block bg-blue-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-blue-500 transition-colors shadow-md relative z-10 mx-auto w-full sm:w-auto">
                Shop Kids Ebikes
              </Link>
            </div>

            {/* Support CTA */}
            <div className="bg-blue-50 p-10 sm:p-12 rounded-[2rem] shadow-sm border border-blue-100 text-center flex flex-col justify-center">
              <h3 className="font-extrabold text-blue-900 text-3xl mb-4">Need Help Now?</h3>
              <p className="text-blue-700 text-lg mb-8 leading-relaxed max-w-md mx-auto">Our Aussie support crew is standing by to help you out with any questions or claims.</p>
              <Link href="/contact" className="inline-block bg-white border-2 border-blue-600 text-blue-700 font-bold py-4 px-10 rounded-xl hover:bg-blue-600 hover:text-white transition-colors shadow-sm mx-auto w-full sm:w-auto">
                Contact Support
              </Link>
            </div>
        </section>

      </div>
    </div>
  );
}