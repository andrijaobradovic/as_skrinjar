import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* LEFT - LOGO IMAGE */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="AS Skrinjar"
            width={50}
            height={50}
            className="object-contain"
          />
        </Link>

        {/* RIGHT - BUTTON NAV */}
        <nav className="flex gap-4 text-sm">

          <Link
            href="/"
            className="rounded-md border border-red-500 bg-red-500 px-4 py-2 text-white transition hover:bg-red-700 hover:border-red-700"
          >
            Pocetna
          </Link>

          <Link
            href="/oglasi"
            className="rounded-md border border-red-500 bg-red-500 px-4 py-2 text-white transition hover:bg-red-700 hover:border-red-700"
          >
            Oglasi
          </Link>

          <Link
            href="/chiptuning"
            className="rounded-md border border-red-500 bg-red-500 px-4 py-2 text-white transition hover:bg-red-700 hover:border-red-700"
          >
            Chiptuning
          </Link>

          <Link
            href="/servis"
            className="rounded-md border border-red-500 bg-red-500 px-4 py-2 text-white transition hover:bg-red-700 hover:border-red-700"
          >
            Servis
          </Link>

        </nav>
      </div>
    </header>
  );
}