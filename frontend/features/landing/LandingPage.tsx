import { Footer } from '@/components/footer/Footer'
import { Nav } from '@/components/nav/Nav'
import { BottomCTA } from './BottomCTA'
import { HeroSection } from './HeroSection'
import { HowItWorks } from './HowItWorks'
import { SampleSavingsCard } from './SampleSavingsCard'
import { SocialProofBar } from './SocialProofBar'
import { ToolLogosStrip } from './ToolLogosStrip'
import styles from './landing.module.css'

export function LandingPage() {
  return (
    <div className={styles.landing}>
      <Nav />
      <main>
        <div className={styles.container}>
          <HeroSection />
        </div>
        <SocialProofBar />
        <HowItWorks />
        <ToolLogosStrip />
        <SampleSavingsCard />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  )
}
