export function Button({ className = '', ...props }) {
  return <button className={`px-4 py-2 rounded font-medium ${className}`} {...props} />;
}
