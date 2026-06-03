export default function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF383C]" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
