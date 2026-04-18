import { TopNav } from './TopNav.js';
import { Hero } from './Hero.js';
import { Checker } from './Checker.js';
import { Problem } from './Problem.js';
import { HowItWorks } from './HowItWorks.js';
import { VerdictsExplainer } from './VerdictsExplainer.js';
import { Footer } from './Footer.js';

export function App() {
  return (
    <>
      <TopNav />
      <main>
        <Hero />
        <section className="wrap pb-10">
          <Checker />
        </section>
        <hr className="rule-double" />
        <Problem />
        <HowItWorks />
        <VerdictsExplainer />
      </main>
      <Footer />
    </>
  );
}
