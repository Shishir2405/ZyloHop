import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { hideMessage } from 'react-native-flash-message';
import { Font } from '../../common/Theam';

export type GlassToastType = 'success' | 'error' | 'info' | 'warn';

export interface ToastPalette {
  /** Solid card background */
  background: string;
  /** Icon chip background (subtle highlight on top of `background`) */
  chip: string;
  /** Inner top border that fakes a raised neumorphic edge */
  highlight: string;
  /** Single-glyph icon, white on the solid background */
  icon: string;
}

export const TOAST_COLORS: Record<GlassToastType, ToastPalette> = {
  success: {
    background: '#16A34A',
    chip: 'rgba(255,255,255,0.22)',
    highlight: 'rgba(255,255,255,0.28)',
    icon: '✓',
  },
  error: {
    background: '#DC2626',
    chip: 'rgba(255,255,255,0.22)',
    highlight: 'rgba(255,255,255,0.26)',
    icon: '!',
  },
  info: {
    background: '#2563EB',
    chip: 'rgba(255,255,255,0.22)',
    highlight: 'rgba(255,255,255,0.28)',
    icon: 'i',
  },
  warn: {
    background: '#D97706',
    chip: 'rgba(255,255,255,0.22)',
    highlight: 'rgba(255,255,255,0.28)',
    icon: '!',
  },
};

interface GlassToastProps {
  type: GlassToastType;
  title: string;
  subTitle?: string;
}

const GlassToast: React.FC<GlassToastProps> = ({ type, title, subTitle }) => {
  const palette = TOAST_COLORS[type];
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.background,
          borderTopColor: palette.highlight,
        },
      ]}
    >
      <View style={[styles.iconChip, { backgroundColor: palette.chip }]}>
        <Text style={styles.iconText}>{palette.icon}</Text>
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>
          {title}
        </Text>
        {subTitle ? (
          <Text
            style={styles.subtitle}
            numberOfLines={2}
            allowFontScaling={false}
          >
            {subTitle}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        hitSlop={8}
        onPress={() => hideMessage()}
        style={({ pressed }) => [
          styles.close,
          { backgroundColor: palette.chip },
          pressed && styles.closePressed,
        ]}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </View>
  );
};

export default GlassToast;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginHorizontal: 12,
    minHeight: 56,
    // Neumorphic raised effect: drop shadow on the bottom-right, subtle light
    // highlight on the top via borderTop. Solid background — no blur, no
    // translucency — for high contrast.
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    lineHeight: 18,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    lineHeight: 18,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontFamily: Font.textNormal,
    lineHeight: 17,
    marginTop: 2,
  },
  close: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  closePressed: {
    opacity: 0.7,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Font.textSemiBolder,
    lineHeight: 13,
  },
});
