import ShaderBackground from '@/components/ShaderBackground';
import GlassShowcase from '@/components/GlassShowcase';

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <ShaderBackground />
      <GlassShowcase />
    </main>
  );
}
