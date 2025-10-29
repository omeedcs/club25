'use client'

import { motion } from 'framer-motion'

export default function Concept() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        className="max-w-4xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left side - poetic description */}
          <div>
            <h2 className="text-5xl md:text-6xl font-serif mb-8 leading-tight">
              A supper club.<br />
              A conversation experiment.<br />
              A night that disappears.
            </h2>
          </div>

          {/* Right side - explanation */}
          <div className="space-y-6 text-lg text-club-cream/80 leading-relaxed">
            <p>
              Club25 is not a restaurant. It's a living installation where food, design, 
              music, and technology converge into a single immersive evening.
            </p>
            
            <p>
              Every two weeks, we design a new chapter — a self-contained story told through 
              flavor, sound, and space. Each drop is limited to 10-15 guests.
            </p>
            
            <p>
              When you arrive, the outside world pauses. Your phone becomes an instrument 
              of connection, not distraction. Anonymous prompts encourage conversation. 
              Strangers become collaborators in a shared moment.
            </p>
            
            <p>
              It's the intersection of the physical and the digital, the intimate and the 
              cinematic. Something between a supper club, an art gallery, and a social network.
            </p>

            <div className="pt-8 border-t border-club-cream/20 mt-8">
              {/* <p className="italic text-club-lilac">
                "a collective that designs moments — one table, one night, one story at a time."
              </p> */}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
