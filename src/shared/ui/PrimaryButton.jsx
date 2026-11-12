export default function PrimaryButton({ children, icon: Icon, className = '', ...props }) {
  return (
    <button className={`flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand font-bold text-white text-sm shadow-[0_5px_10px_#FFC93C66] ${className}`.trim()} type="button" {...props}>
      {Icon && <Icon className="size-5" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
