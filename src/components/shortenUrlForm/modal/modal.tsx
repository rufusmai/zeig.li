import type { ReactNode } from 'react';

type Props = {
  valid?: boolean;
  children: ReactNode;
};

const Modal = ({ valid, children }: Props) => {
  return (
    <div
      className={`mt-2 rounded-lg border bg-white p-3 shadow-xs dark:bg-gray-800 ${valid || valid === undefined ? 'border-gray-400 dark:border-gray-500' : 'border-red-500 dark:border-red-500'}`}
    >
      {children}
    </div>
  );
};

export default Modal;
