import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Local error boundary for the ride-assign / OTP modal.
 *
 * The app-level ErrorBoundary replaces the entire screen when something
 * throws, which made the modal look like it "closed the app" the moment
 * the OTP rendered. This boundary catches the same throw but stays inside
 * the modal — the error message, type, and first stack frame are shown at
 * the top so you can see exactly what crashed and why, and the user gets a
 * Retry button instead of being kicked out of the flow.
 */
type Props = { children: React.ReactNode };
type State = { error: Error | null };

class RideErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[OTP/RIDE ERROR]', error?.name, error?.message);
    // eslint-disable-next-line no-console
    console.error('[OTP/RIDE STACK]', info?.componentStack ?? error?.stack);
  }

  reset = () => this.setState({ error: null });

  private firstStackLine(): string {
    const stack = this.state.error?.stack ?? '';
    const lines = stack.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.slice(0, 3).join('\n');
  }

  render() {
    if (!this.state.error) return this.props.children;

    const err = this.state.error;
    return (
      <View style={styles.shell}>
        <View style={styles.banner}>
          <Text style={styles.title}>Something on this screen errored</Text>
          <Text style={styles.subtitle}>
            The app didn't close — this is the actual crash so we can fix it.
          </Text>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{err.name || 'Error'}</Text>

          <Text style={styles.label}>Message</Text>
          <Text style={styles.value}>
            {err.message || '(no message)'}
          </Text>

          <Text style={styles.label}>Where</Text>
          <Text style={styles.mono}>{this.firstStackLine()}</Text>
        </ScrollView>
        <TouchableOpacity style={styles.btn} onPress={this.reset}>
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#fff',
    padding: 18,
    minHeight: 240,
  },
  banner: {
    backgroundColor: '#FEE4E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#7F1D1D' },
  subtitle: { fontSize: 12, color: '#7F1D1D', marginTop: 4 },
  body: { maxHeight: 280 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#6B7280',
    marginTop: 10,
    marginBottom: 2,
  },
  value: { fontSize: 13, color: '#111827' },
  mono: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'Courier',
    marginTop: 2,
  },
  btn: {
    marginTop: 14,
    backgroundColor: '#EDAE10',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default RideErrorBoundary;
