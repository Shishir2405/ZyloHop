import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {password: string};

type Strength = {
  score: number;
  label: 'Weak' | 'Medium' | 'Strong';
  color: string;
  litSegments: 1 | 2 | 3;
};

const EMPTY_SEGMENT_COLOR = '#E5E5E5';

const computeStrength = (password: string): Strength => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return {score, label: 'Weak', color: '#D14343', litSegments: 1};
  }
  if (score === 3) {
    return {score, label: 'Medium', color: '#E08E2A', litSegments: 2};
  }
  return {score, label: 'Strong', color: '#2E9E5B', litSegments: 3};
};

export const PasswordStrengthMeter: React.FC<Props> = ({password}) => {
  const strength = useMemo(() => computeStrength(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.segments}>
        {[0, 1, 2].map(idx => (
          <View
            key={idx}
            style={[
              styles.segment,
              idx < 2 ? styles.segmentGap : null,
              {
                backgroundColor:
                  idx < strength.litSegments
                    ? strength.color
                    : EMPTY_SEGMENT_COLOR,
              },
            ]}
          />
        ))}
      </View>
      <Text
        allowFontScaling={false}
        style={[styles.label, {color: strength.color}]}>
        {strength.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginLeft: 4,
  },
  segments: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  segmentGap: {
    marginRight: 4,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default PasswordStrengthMeter;
