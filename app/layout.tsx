import "./globals.css";

export const metadata = {
  title: "Bloom",
  description: "A habit, task, journal & garden reward app."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-moss-50 text-moss-900 antialiased">
        {children}
      </body>
    </html>
  );
}
