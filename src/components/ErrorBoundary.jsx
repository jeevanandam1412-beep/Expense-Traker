import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Clipboard, Alert } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleCopy = () => {
    const errorText = this.state.error ? this.state.error.toString() : 'Unknown error';
    Clipboard.setString(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fee2e2', paddingTop: 60, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#991b1b', marginBottom: 12 }}>
            App Crashed!
          </Text>
          <ScrollView style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: '#7f1d1d', fontFamily: 'monospace' }}>
              {this.state.error && this.state.error.toString()}
            </Text>
            <Text style={{ fontSize: 12, color: '#991b1b', marginTop: 20 }}>
              Please take a screenshot of this error and send it.
            </Text>
          </ScrollView>

          {/* Copy Error Button */}
          <TouchableOpacity
            onPress={this.handleCopy}
            style={{
              marginTop: 16,
              marginBottom: 32,
              backgroundColor: this.state.copied ? '#16a34a' : '#991b1b',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
              {this.state.copied ? '✓ Copied!' : '📋 Copy Error'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}