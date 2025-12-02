import { Checkbox } from '../ui/checkbox';

export function TutorialStep({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <li className='relative'>
      <Checkbox
        className={`peer absolute top-[3px] mr-2`}
        id={title}
        name={title}
      />
      <label
        className={`relative text-base font-medium text-foreground peer-checked:line-through`}
        htmlFor={title}
      >
        <span className='ml-8'>{title}</span>
        <div
          className={`ml-8 text-sm font-normal text-muted-foreground peer-checked:line-through`}
        >
          {children}
        </div>
      </label>
    </li>
  );
}
