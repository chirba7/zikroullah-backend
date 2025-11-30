export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md active:scale-95 transition ${className}`}
    >
      {children}
    </button>
  );
}
