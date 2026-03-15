type ProfessionalProfileLoadingStateProps = {
  message: string;
};

export function ProfessionalProfileLoadingState({
  message,
}: ProfessionalProfileLoadingStateProps) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-[#f6f6f8]'>
      <p className='text-slate-500'>{message}</p>
    </div>
  );
}
