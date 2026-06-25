import Image from 'next/image';

const activities = [
  { time: 'Morning', title: 'Senso-ji Temple', tag: 'Culture' },
  { time: 'Afternoon', title: 'Shibuya Crossing', tag: 'Sightseeing' },
  { time: 'Evening', title: 'Ramen in Shinjuku', tag: 'Food' },
];

export default function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-500/10 via-transparent to-slate-900/5 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10">
        <div className="relative h-36 sm:h-40">
          <Image
            src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80"
            alt="Tokyo skyline"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 480px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Your trip</p>
            <h3 className="text-xl font-semibold text-white">Tokyo</h3>
            <p className="mt-0.5 text-sm text-white/80">5 days · Mid-range budget</p>
          </div>
        </div>

        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex gap-4 text-xs font-medium text-slate-500">
            <span className="border-b-2 border-teal-600 pb-2 text-slate-900">Itinerary</span>
            <span className="pb-2">Budget</span>
            <span className="pb-2">Hotels</span>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Day 1</p>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Ready
            </span>
          </div>
          {activities.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
            >
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {item.time}
                </p>
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
              </div>
              <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">
                {item.tag}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Estimated total</span>
            <span className="font-semibold text-slate-900">$1,240</span>
          </div>
        </div>
      </div>
    </div>
  );
}
