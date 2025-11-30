export default function Input({ placeholder, type = "text", value, onChange, maxLength }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className="border border-gray-300 rounded-xl p-3 w-full bg-white shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-500 outline-none"
    />
  );
}
