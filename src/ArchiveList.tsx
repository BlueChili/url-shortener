type Result = {
  url: string;
  code: string;
  hits: number;
};

export default function ArchiveList({ data }: { data: Result[] }) {
  return (
    <div class="flex flex-col gap-6 md:gap-3">
      <div className="hidden md:flex justify-end gap-6 font-bold border-b border-b-cyan-700">
        <span class="grow shrink-0">Base URL</span>
        <span class="w-8 shrink-0 text-right">Hits</span>
        <span class="w-20 text-right text-right">Code</span>
        <span class="w-64 shrink-0">Shortened URL</span>
      </div>
      {data.map((result) => (
        <div className="flex flex-col md:flex-row justify-end gap-0.5 border border-cyan-800 md:gap-6 md:border-0 md:border-b md:border-cyan-50 p-4 rounded-lg md:p-0">
          <span class="font-bold md:hidden">URL</span>
          <span class="grow 2xl:shrink-0">{result.url}</span>
          <span class="font-bold md:hidden">Hits</span>
          <span class="w-8 shrink-0 md:text-right">{result.hits}</span>
          <span class="font-bold md:hidden">Code</span>
          <span class="w-20 md:text-right shrink-0">{result.code}</span>
          <span class="font-bold md:hidden">Shortened URL</span>
          <span class="w-64 shrink-0">
            https://bosfirearms.com/{result.code}
          </span>
        </div>
      ))}
    </div>
  );
}
