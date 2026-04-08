import { motion } from "framer-motion";
import { SignUpButton, SignInButton } from "@clerk/clerk-react";
import { 
  Wallet, 
  CreditCard, 
  ShoppingBag, 
  Utensils, 
  PartyPopper, 
  Car, 
  MoreHorizontal, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#00E599]/30 transition-all hover:bg-white/[0.05] group"
  >
    <div className="w-12 h-12 rounded-2xl bg-[#00E599]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="text-[#00E599] w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

const CategoryItem = ({ icon: Icon, label, color }) => (
  <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
    </div>
    <span className="text-xs font-medium uppercase tracking-widest text-[#9B9B9B]">{label}</span>
  </div>
);

export default function Landing() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#00E599]/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-white mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-white/10"
          >
            <span className="text-black font-extrabold text-4xl">F</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]"
          >
            MASTER YOUR <br />
            <span className="text-[#00E599] drop-shadow-[0_0_30px_rgba(0,229,153,0.3)]">FINANCES.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The modern way to track your spending, manage credit, and reach your goals. 
            Designed for those who demand clarity and precision.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <SignUpButton mode="modal">
              <button className="group relative bg-[#00E599] text-black font-black px-10 py-5 rounded-2xl hover:bg-[#00E599]/90 transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(0,229,153,0.2)] flex items-center gap-3">
                REGISTER NOW
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="text-white hover:text-[#00E599] font-bold px-10 py-5 rounded-2xl transition-all border border-white/10 hover:border-[#00E599]/30 bg-white/5">
                SIGN IN
              </button>
            </SignInButton>
          </motion.div>
        </div>
      </section>

      {/* Cash vs Credit Section */}
      <section className="py-24 px-4 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard 
              icon={Wallet}
              title="Cash Tracking"
              description="Record immediate spending as it happens. Keep a perfect pulse on your liquid assets and daily expenses without the guesswork."
              delay={0.1}
            />
            <FeatureCard 
              icon={CreditCard}
              title="Credit Mastery"
              description="Track debt with 'Pending' status. Know exactly what you owe and mark transactions as 'Settled' once you pay your bill."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm font-black tracking-[0.4em] uppercase text-[#00E599] mb-12"
          >
            Categorize Everything
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <CategoryItem icon={ShoppingBag} label="Grocery" color="bg-blue-500" />
            <CategoryItem icon={Utensils} label="Food" color="bg-orange-500" />
            <CategoryItem icon={PartyPopper} label="Fun" color="bg-purple-500" />
            <CategoryItem icon={Car} label="Vehicle" color="bg-red-500" />
            <CategoryItem icon={MoreHorizontal} label="Other" color="bg-gray-500" />
          </div>
        </div>
      </section>

      {/* How it Works / Trust */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black tracking-tight leading-tight">
                SIMPLE WORKFLOW, <br />
                <span className="text-muted-foreground">POWERFUL INSIGHTS.</span>
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Snap Transactions", desc: "Quick entry on any device." },
                  { title: "Smart Buckets", desc: "Visual groupings by category." },
                  { title: "Credit Settlement", desc: "Sync your payments with one tab." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[#00E599] flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full aspect-square relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#00E599]/20 to-transparent rounded-3xl rotate-3" />
               <div className="absolute inset-0 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-3xl flex items-center justify-center p-12 overflow-hidden shadow-2xl shadow-black">
                 {/* Decorative Graphic Element */}
                 <div className="relative w-full h-full flex items-end justify-between gap-2">
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 1 }}
                        className="flex-1 bg-gradient-to-t from-[#00E599] to-[#00E599]/20 rounded-t-lg"
                      />
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 text-center border-t border-white/5 bg-black/80">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          &copy; 2026 FinMate &bull; The Modern Finance Tracker
        </p>
      </footer>
    </div>
  );
}
