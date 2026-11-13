import { RightIcon } from '../../assets'

export default function LocationCard({ location, onSelect }) {
  const { name, address, date, Icon, color, background } = location

  return (
    <li className="border-b border-gray-200 last:border-b-0">
      <button type="button" onClick={() => onSelect(location)} className="flex min-h-16 w-full items-center gap-3 p-4 text-left active:bg-gray-50">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${background} ${color}`}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-black">{name}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">{address}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4 self-stretch text-gray-500">
        <span className="flex items-center whitespace-nowrap text-xs">{date}</span>
        <RightIcon className="size-5" aria-hidden="true" />
      </div>
      </button>
    </li>
  )
}
