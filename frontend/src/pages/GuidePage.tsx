import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, LayoutGrid, Wand2, Target, Code2, Shield, LogIn } from 'lucide-react';

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-10">
    <h2 className="flex items-center gap-3 text-lg sm:text-2xl font-display font-bold text-[var(--color-arc-cyan)] tracking-widest uppercase mb-4">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
      {title}
    </h2>
    <div className="space-y-3 text-sm sm:text-base text-white/80 leading-relaxed pl-8 sm:pl-9">
      {children}
    </div>
  </section>
);

const Feature = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <div>
    <span className="text-white font-semibold">{name}</span>
    <span className="text-white/70"> — {children}</span>
  </div>
);

export default function GuidePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-military selection:bg-[var(--color-arc-cyan)] selection:text-black">
      <header className="sticky top-0 z-30 border-b border-[var(--color-arc-cyan)]/20 bg-black/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border border-[var(--color-arc-cyan)]/30 text-[var(--color-arc-cyan)] hover:border-[var(--color-arc-cyan)] rounded transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display font-black text-lg sm:text-2xl tracking-widest text-white">
            FORGE <span className="text-[var(--color-arc-cyan)]">GUIDE</span>
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <p className="text-white/60 text-sm sm:text-base mb-12 leading-relaxed">
          Forge is a personal goal &amp; DSA-tracking system. Every goal you create gets its own
          workspace with a roadmap, tasks, resources, and notes — plus a dedicated problem
          tracker if the goal is DSA or competitive-programming focused. This page walks through
          every screen and what it's for.
        </p>

        <Section icon={LogIn} title="Getting Started">
          <Feature name="Sign up / Log in">
            Every account is real and private — your goals, notes, and problem progress belong
            only to you. Creating an account takes an email and password; nothing else is required
            up front.
          </Feature>
          <Feature name="Logout">
            The logout icon next to INITIATE on the home screen ends your session and returns you
            to the login page.
          </Feature>
        </Section>

        <Section icon={LayoutGrid} title="Master Dashboard (Home Screen)">
          <p>
            The home screen is your command center — a grid of every goal you're tracking, called
            a <span className="text-white font-medium">workspace</span>. Each card shows the
            goal's category, milestone count, and XP earned so far. Click a card to open that
            goal's dashboard, or hit the dashed <span className="text-white font-medium">NEW</span>{' '}
            card / <span className="text-white font-medium">INITIATE</span> button to start a new one.
          </p>
        </Section>

        <Section icon={Wand2} title="Creating a Goal (Onboarding Wizard)">
          <p>Hitting INITIATE walks you through a short setup flow:</p>
          <Feature name="1. Template">
            Pick a starting point — Master DSA (Striver A-Z), Competitive Programming, System
            Design, Language Learning, Build a Project, or a fully Custom goal you name yourself.
          </Feature>
          <Feature name="2. Resources">
            Optionally attach links or files (PDF/TXT) related to the goal — these are saved to
            the goal's Resources tab so you have them on hand later.
          </Feature>
          <Feature name="3. Availability">
            Set how many hours per day and which specific days of the week you can realistically
            commit — click any combination of days, it's not limited to a contiguous block.
          </Feature>
          <Feature name="4. Milestones">
            Draft the first few checkpoints for the goal, each with a target date. You can add
            more later from the goal's Planner tab.
          </Feature>
          <Feature name="5. Done">
            Confirms the goal is created and drops you straight into its dashboard.
          </Feature>
        </Section>

        <Section icon={Target} title="Goal Dashboard">
          <p>
            Every goal opens into its own dashboard with a row of tabs. Which tabs you see depends
            on the goal type:
          </p>
          <Feature name="Planner (Roadmap)">
            Your milestones laid out as a timeline. Add new ones, click a milestone to cycle it
            through pending → in progress → completed, or delete it.
          </Feature>
          <Feature name="Tasks">
            Smaller, day-to-day to-dos tied to the goal — quick to add, check off, or remove
            without needing a full milestone.
          </Feature>
          <Feature name="Resources">
            Every link or file you attached during setup (or add later) lives here for quick
            reference.
          </Feature>
          <Feature name="Notes">
            A block-based note editor (headings, text, code blocks) per goal, organized into
            pages you create and switch between in the sidebar. Each block is capped at 300
            characters — a live counter shows how much room you have left. Notes can be exported
            to Markdown.
          </Feature>
        </Section>

        <Section icon={Code2} title="DSA Sheet (DSA &amp; Competitive Goals)">
          <p>
            DSA and Competitive Programming goals get an extra tab: the full Striver A-Z sheet —
            455 problems grouped by topic and subtopic, pre-loaded automatically when the goal is
            created.
          </p>
          <Feature name="Status &amp; difficulty, inline">
            Right next to each problem's title are two clickable badges — status (unsolved →
            attempted → solved → revision) and difficulty (easy → medium → hard). Click either to
            cycle it on the spot, no need to open the problem.
          </Feature>
          <Feature name="Problem drawer">
            Clicking a problem opens a panel with a direct LeetCode link and the same status/
            difficulty controls, for a focused view while you're solving.
          </Feature>
          <Feature name="XP &amp; heatmap">
            Marking a problem Solved for the first time awards XP based on its difficulty
            (Easy 15 / Medium 30 / Hard 60), which rolls up into the goal's total XP shown on the
            home screen. The heatmap at the top of the sheet shows your progress by topic.
          </Feature>
          <Feature name="Search &amp; filter">
            Filter the sheet by status or search by topic name to jump straight to what you're
            working on.
          </Feature>
        </Section>

        <Section icon={Shield} title="Accounts &amp; Data">
          <p>
            Everything above is scoped to your account — other Forge users can't see or touch your
            goals, notes, or progress. Data lives in a managed Postgres database (Supabase); your
            login session is handled by Supabase Auth and never touches your password directly
            once you're signed in.
          </p>
        </Section>

        <div className="mt-16 pt-8 border-t border-[var(--color-arc-cyan)]/20 text-center">
          <p className="text-white/40 text-xs font-display tracking-widest mb-4">
            THAT'S EVERYTHING — GO BUILD SOMETHING
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-arc-cyan)]/10 text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)] hover:bg-[var(--color-arc-cyan)] hover:text-black rounded font-display tracking-widest font-bold transition-all text-sm shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.6)]"
          >
            <Rocket className="w-4 h-4" /> BACK TO DASHBOARD
          </button>
        </div>
      </main>
    </div>
  );
}
