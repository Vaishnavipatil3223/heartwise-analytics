import { motion } from "framer-motion";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold font-display">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </motion.div>
  );
}
