export default function PrimaryButton({ children, icon: Icon, className = '', ...props }) {
  return (
    <button className={`flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#1A2A47] font-bold text-white text-sm ${className}`.trim()} type="button" {...props}>
      {Icon && <Icon className="size-5" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
