import { Colors } from '@/constants/theme';
import { useColorScheme } from './use-color-scheme';

export function useThemeColor(
    props,
    colorName
) {
    const theme = useColorScheme() ?? 'light';
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    }

    return Colors[theme][colorName];
}
