interface ButtonProp {
  text: string
}

export const Button = ({ text }: ButtonProp) => {
  return (
    <button className="relative py-2 px-4 rounded-lg font-medium text-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff]">
      <div className="absolute inset-0">
        <div className="border rounded-lg border-white/20 absolute inset-0"></div>
      </div>
      <span>{text}</span>
    </button>
  )
}