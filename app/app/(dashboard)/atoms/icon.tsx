interface IconProps {
  icon: React.ElementType
  size?: number
  color?: string
}
const Icon: React.FC<IconProps> = ({ icon: IconComponent, size = 20, color = "gray" }) => (
  <IconComponent size={size} color={color} />
)

export default Icon
