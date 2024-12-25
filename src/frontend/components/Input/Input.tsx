import { InputContainer } from './InputContainer/InputContainer';
import { useInputs } from './hooks/useInputs';

export const Input = () => {
  const inputs = useInputs();

  return <InputContainer {...inputs} />;
};
