const LoadingState = ({ message = 'Loading...' }) => (
  <div className="py-16 text-center">
    <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mb-3" />
    <p className="text-sm text-slate-400">{message}</p>
  </div>
);

export default LoadingState;
