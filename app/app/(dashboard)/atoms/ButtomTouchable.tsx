import { TouchableOpacity } from "react-native"

interface ButtonProps {
  onPress: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}


const ButtonTouchable: React.FC<ButtonProps> = ({ onPress, children, className, disabled }) => (
  <TouchableOpacity onPress={onPress} className={className} disabled={disabled}>
    {children}
  </TouchableOpacity>
)

export default ButtonTouchable