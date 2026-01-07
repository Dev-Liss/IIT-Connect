import { SymbolView } from 'expo-symbols';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
