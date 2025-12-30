import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import LatestQuestions from "./components/LatestQuestions";
import TopContributers from "./components/TopContributers";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Link from "next/link";
import { MagicCard } from "@/components/ui/magic-card";

const features = [
  {
    title: "Ask great questions",
    desc: "Clear templates and community guidelines help you ask questions that get fast answers.",
    icon: (
      <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
  },
  {
    title: "Share knowledge",
    desc: "Publish answers and earn reputation while helping others solve problems.",
    icon: (
      <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a1 1 0 01-1 1H9l-4 2V6a1 1 0 011-1h14a1 1 0 011 1v9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
  },
  {
    title: "Collaborate & Learn",
    desc: "Follow tags, connect with contributors, and stay up-to-date with curated content.",
    icon: (
      <svg className="h-8 w-8 text-pink-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white dark:bg-black text-neutral-900 dark:text-white">
      <Header />

      {/* HERO */}
      <section aria-label="Hero" className="relative w-full overflow-hidden">
        <HeroSection />
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Built for developers</h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">Ask questions, share knowledge, and grow with an active developer community.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <MagicCard key={f.title} className="group rounded-2xl border border-white/10 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-white/5 p-3">{f.icon}</div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
              </div>
              <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{f.desc}</p>
              <div className="mt-6">
                <Link href="/register">
                  <ShimmerButton shimmerColor="#ffffff">
                    <span className="text-sm font-medium text-white">Get started</span>
                  </ShimmerButton>
                </Link>
              </div>
            </MagicCard>
          ))}
        </div>
      </section>

      {/* LATEST + CONTRIBUTORS */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-6">Latest Questions</h3>
            <LatestQuestions />
          </div>

          <aside>
            <h3 className="text-2xl font-bold mb-6">Top Contributors</h3>
            <TopContributers />
          </aside>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-[#ffd319] via-[#ff2975] to-[#8c1eff] p-10 text-white shadow-2xl">
            <h4 className="text-3xl font-bold">Join DevXchange — Connect with developers</h4>
            <p className="mt-3 text-lg">Create an account, ask your first question and start contributing.</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link href="/register">
                <ShimmerButton shimmerColor="#ffffff">
                  <span className="text-sm font-medium text-white">Sign up</span>
                </ShimmerButton>
              </Link>

              <Link href="/questions/ask" className="rounded-full border border-white/20 px-6 py-3 text-white">
                Ask a question
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
