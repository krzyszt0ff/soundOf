import { Footer } from "@/src/components/organisms/Footer/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative z-10">{children}</div>
      <Footer/>
    </>
  );
}