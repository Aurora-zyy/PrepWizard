import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'file';
}
//FormFieldProps = "表单类铸造卷轴"
// - 它是一个 **TypeScript 接口**（interface）或类型别名（type alias），指定了你铸造 `FormField` 时，**必须**准备哪些“材料”——也就是组件的 props。
// - `<T>` 泛型就像在卷轴上留了一个“空格”，告诉你：
//     - “这枚表单域可能要对应不同的表单模型（用户、商品、评论……），具体是哪种类型，等你动手时再补上。”
const FormField = ({
  //FormField = "表单类法器铸造炉"
  control,
  name,
  label,
  placeholder,
  type = 'text',
}: FormFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormItem>
        <FormLabel className='label'>{label}</FormLabel>
        <FormControl>
          <Input
            className='input'
            placeholder={placeholder}
            type={type}
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default FormField;
