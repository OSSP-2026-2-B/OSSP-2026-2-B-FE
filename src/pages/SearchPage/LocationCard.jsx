import { RightIcon } from '../../assets'

export default function LocationCard({ location }) {
  const { name, address, date, Icon, color, background } = location

  return (
    <li className="flex min-h-16 items-center gap-3 border-b border-gray-200 p-4 last:border-b-0">
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
    </li>
  )
}
