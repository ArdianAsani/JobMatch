const EmptyState = ({ message = 'No data found.' }) => (
  <div className="py-16 text-center">
    <p className="text-sm text-slate-400 italic">{message}</p>
  </div>
);

export default EmptyState;
