export const AnnouncementBar = ({ text }: { text: string }) => (
  <div className="border-b border-line bg-coal">
    <p className="mx-auto max-w-6xl px-6 py-2 text-center text-[0.6875rem] uppercase tracking-[0.2em] text-parch">
      {text}
    </p>
  </div>
);
