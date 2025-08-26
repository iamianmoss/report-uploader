export const metadata = {
  title: "Report Uploader",
  description: "Upload HTML reports to Vercel Blob"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
