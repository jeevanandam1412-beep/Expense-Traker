import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fee2e2', paddingTop: 60, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#991b1b', marginBottom: 12 }}>
            App Crashed!
          </Text>
          <ScrollView>
            <Text style={{ fontSize: 14, color: '#7f1d1d', fontFamily: 'monospace' }}>
              {this.state.error && this.state.error.toString()}
            </Text>
            <Text style={{ fontSize: 12, color: '#991b1b', marginTop: 20 }}>
              Please take a screenshot of this error and send it.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}
