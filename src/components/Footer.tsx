export default function Footer() {
  return (
    <footer className="border-t border-white bg-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-mono">
          <p className="opacity-50">
            Built by KK & Team Lazarus
          </p>
          <p className="opacity-50">
            © 2024 MANTRIQ 2.0
          </p>
        </div>
      </div>
    </footer>
  );
}