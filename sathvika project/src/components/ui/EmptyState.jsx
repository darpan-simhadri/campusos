export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-600" />
        </div>
      )}
      <h3 className="text-gray-300 font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
