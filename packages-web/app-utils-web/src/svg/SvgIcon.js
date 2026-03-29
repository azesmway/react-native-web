/**
 * Базовый компонент для всех иконок
 * @param {number} size - Размер иконки (ширина и высота)
 * @param {string} color - Цвет заливки
 * @param children
 * @param {object} props - Дополнительные пропсы для Svg
 * @param utils
 */
const SvgIcon = ({ width = 24, height = 24, color = 'currentColor', children, utils, ...props }) => {
  const { Svg } = utils

  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      {children}
    </Svg>
  )
}

export default SvgIcon
