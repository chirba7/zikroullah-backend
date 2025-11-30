export default function Header({ title }) {
  return (
    <div className="flex items-center mb-8">
      <div className="w-12 h-12 rounded-xl bg-green-600 shadow-lg flex items-center justify-center">
        <span className="text-white text-2xl">☪</span>
      </div>
      <h1 className="text-3xl font-bold ml-4 text-gray-800 tracking-tight">
        {title}
      </h1>
    </div>
  );
}
